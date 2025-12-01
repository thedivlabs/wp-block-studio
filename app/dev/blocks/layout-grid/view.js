import { store, getContext, getElement } from "@wordpress/interactivity";

store("wpbs/layout-grid", {
    state: {
        pageSize: 12,

        containerEl: null,
        isLoaded: false,
        page: 1,
        hasMore: false,
        totalPages: 1
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
                }, 50);
            });
        }
    },

    actions: {
        /* -----------------------------------------------------------
         * INIT
         * ----------------------------------------------------------- */
        init() {
            const { state, actions } = store("wpbs/layout-grid");
            const { ref: el } = getElement();
            const context = getContext();

            state.containerEl = el;

            // Lazy-load grid only when block enters viewport
            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            observer.unobserve(entry.target);
                            actions.fetchQuery(context, 1);
                        }
                    });
                },
                { threshold: 0 }
            );

            observer.observe(el);
        },

        /* -----------------------------------------------------------
         * FETCH SSR LOOP RESULTS
         * ----------------------------------------------------------- */
        async fetchQuery(context, page = 1) {
            const { state, callbacks } = store("wpbs/layout-grid");
            const { query = {} } = context;

            try {
                const templateEl = state.containerEl.querySelector("template");

                if (!templateEl) {
                    console.error("WPBS Loop Error: Missing <template> in markup.");
                    return;
                }

                const templateHTML = templateEl.innerHTML;

                const payload = {
                    template: templateHTML,
                    query,
                    page
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
                const html = data?.html || "";

                // 1. Convert HTML into elements
                const temp = document.createElement("div");
                temp.innerHTML = html;
                const cards = Array.from(temp.children);

                // 2. Inject into the DOM
                const container = state.containerEl;

                // Remove all old loop cards
                container.querySelectorAll(".wpbs-loop-card").forEach((old) => old.remove());

                // Append new cards
                cards.forEach((card) => {
                    card.classList.remove("--visible"); // ready for animation
                    container.appendChild(card);
                });

                state.page = page;
                state.totalPages = data.pages || 1;
                state.hasMore = page < state.totalPages;
                state.isLoaded = true;

                callbacks.revealCards();

            } catch (err) {
                console.error("WPBS Loop Fetch Exception:", err);
            }
        },

        /* -----------------------------------------------------------
         * LOAD MORE (pagination)
         * ----------------------------------------------------------- */
        async loadMore() {
            const { state, actions } = store("wpbs/layout-grid");

            if (!state.hasMore) return;

            const nextPage = state.page + 1;

            const context = getContext();
            await actions.fetchQuery(context, nextPage);
        }
    }
});