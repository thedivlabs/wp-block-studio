/**************************************************************************
 * WPBS LAYOUT GRID — FRONT-END LOOP ENGINE (no <template> tags needed)
 **************************************************************************/

import { store, getContext, getElement } from "@wordpress/interactivity";

store("wpbs/layout-grid", {
    state: {
        containerEl: null,
        isLoaded: false,
        page: 1,
        hasMore: false,
        totalPages: 1,
        templateHTML: null,  // ⭐ store extracted loop-card template
    },

    callbacks: {
        /* -----------------------------------------------------------
         * Staggered reveal animation
         * ----------------------------------------------------------- */
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

            /***********************************************************
             * ⭐ EXTRACT TEMPLATE FROM FIRST LOOP CARD
             ***********************************************************/
            const sampleCard = el.querySelector(".wpbs-loop-card");

            if (!sampleCard) {
                console.error("WPBS Loop Error: No .wpbs-loop-card found as template.");
                return;
            }

            // Save the template HTML for SSR
            state.templateHTML = sampleCard.outerHTML;

            // Remove from DOM so SSR populates container
            sampleCard.remove();

            /***********************************************************
             * Lazy-load when entering viewport
             ***********************************************************/
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
                /***********************************************************
                 * We now use templateHTML from the extracted loop-card
                 ***********************************************************/
                if (!state.templateHTML) {
                    console.error("WPBS Loop Error: Missing templateHTML (no loop-card?).");
                    return;
                }

                const payload = {
                    template: state.templateHTML,
                    query,
                    page,
                };

                const res = await fetch("/wp-json/wpbs/v1/loop", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });

                if (!res.ok) {
                    console.error("WPBS Loop Error:", res.statusText);
                    return;
                }

                const data = await res.json();
                const html = data?.html || "";

                /***********************************************************
                 * Convert SSR HTML → DOM Nodes
                 ***********************************************************/
                const temp = document.createElement("div");
                temp.innerHTML = html;
                const cards = Array.from(temp.children);

                /***********************************************************
                 * Replace old cards with new SSR-rendered cards
                 ***********************************************************/
                const container = state.containerEl;

                // Remove old cards
                container
                    .querySelectorAll(".wpbs-loop-card")
                    .forEach((old) => old.remove());

                // Append new cards
                cards.forEach((card) => {
                    card.classList.remove("--visible");
                    container.appendChild(card);
                });

                /***********************************************************
                 * Update pagination state
                 ***********************************************************/
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
         * LOAD MORE
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