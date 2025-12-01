import { store, getContext, getElement } from "@wordpress/interactivity";

store("wpbs/layout-grid", {
    state: {
        // Raw items returned from REST API
        allItems: [],

        // Items currently visible inside the grid
        items: [],

        // Total items visible so far
        visibleCount: 0,

        // Page size for load-more (can eventually come from settings)
        pageSize: 12,

        // Whether more items exist after visibleCount
        hasMore: false,

        // UI / timing helpers
        isLoaded: false,
        containerEl: null,
    },

    callbacks: {
        revealCards() {
            const { state } = store("wpbs/layout-grid");
            const container = state.containerEl;
            if (!container) return;

            requestAnimationFrame(() => {
                const newCards = container.querySelectorAll(
                    ".wpbs-loop-card:not(.--visible)"
                );

                newCards.forEach((card, i) => {
                    card.style.setProperty("--delay", `${i * 100}ms`);
                });

                setTimeout(() => {
                    newCards.forEach((card) => {
                        card.classList.add("--visible");
                    });
                }, 100);
            });
        }
    },

    actions: {
        /* -----------------------------------------------------------
         * INIT — Runs automatically on block hydration
         * ----------------------------------------------------------- */
        init() {
            const { state, actions } = store("wpbs/layout-grid");
            const { ref: el } = getElement();
            const context = getContext();

            state.containerEl = el;

            console.log(JSON.parse(JSON.stringify(context)));

            // Lazy load the query when block enters viewport
            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            observer.unobserve(entry.target);
                            actions.fetchQuery(context);
                        }
                    });
                },
                { threshold: 0 }
            );

            observer.observe(el);
        },

        /* -----------------------------------------------------------
         * FETCH — Calls your custom REST endpoint
         * ----------------------------------------------------------- */

        async fetchQuery(context) {
            const { state, callbacks } = store("wpbs/layout-grid");
            const { query = {}, divider = {} } = context;

            try {
                // 1. Get the loop card template (SSR requires the block’s save markup)
                const templateEl = state.containerEl.querySelector("template");

                if (!templateEl) {
                    console.error("WPBS Loop Error: Missing <template> in markup.");
                    return;
                }

                const templateHTML = templateEl.innerHTML;

                // 2. Build REST payload
                const payload = {
                    template: templateHTML,
                    query,
                    page: 1,
                    divider // optional — only if you want backend to use it
                };

                const res = await fetch("/wp-json/wpbs/v1/loop", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                if (!res.ok) {
                    console.error("WPBS Loop Error:", res.statusText);
                    return;
                }

                const data = await res.json();

                // The backend returns:
                // { html, total, pages, page }
                const html = data?.html || "";

                // Convert HTML string into DOM nodes
                const temp = document.createElement("div");
                temp.innerHTML = html;

                const cards = Array.from(temp.children);

                state.allItems = cards;
                state.visibleCount = state.pageSize;
                state.items = cards.slice(0, state.visibleCount);
                state.hasMore = state.visibleCount < cards.length;

                state.isLoaded = true;
                callbacks.revealCards();

            } catch (err) {
                console.error("WPBS Loop Fetch Exception:", err);
            }
        },


        /* -----------------------------------------------------------
         * LOAD MORE — Simple pagination
         * ----------------------------------------------------------- */
        loadMore() {
            const { state, callbacks } = store("wpbs/layout-grid");

            state.visibleCount = Math.min(
                state.visibleCount + state.pageSize,
                state.allItems.length
            );

            state.items = state.allItems.slice(0, state.visibleCount);
            state.hasMore = state.visibleCount < state.allItems.length;

            callbacks.revealCards();
        }
    }
});