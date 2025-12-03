/**************************************************************************
 * WPBS LAYOUT GRID — FRONT-END PAGINATION ONLY
 **************************************************************************/

import { store, getContext, getElement } from "@wordpress/interactivity";

const { gridDividers } = window?.WPBS ?? {};

store("wpbs/layout-grid", {
    callbacks: {
        /* -----------------------------------------------------------
         * Staggered reveal animation
         * ----------------------------------------------------------- */
        revealCards(el) {
            const instance = el._wpbs;
            if (!instance) return;

            const { container } = instance;
            if (!container) return;

            requestAnimationFrame(() => {
                const newCards = container.querySelectorAll(
                    ".loop-card:not(.--visible)"
                );

                newCards.forEach((card, i) => {
                    card.style.setProperty("--delay", `${i * 100}ms`);
                });

                setTimeout(() => {
                    newCards.forEach((card) => card.classList.add("--visible"));
                }, 50);
            });
        },
    },

    actions: {
        /* -----------------------------------------------------------
         * INITIALIZE INSTANCE — run once per block
         * ----------------------------------------------------------- */
        initInstance(el) {
            if (!el._wpbs) {
                el._wpbs = {
                    container: el.querySelector(".loop-container") ?? el,
                    page: 1,
                    hasMore: false,
                    totalPages: 1,
                };
            }
        },

        /* -----------------------------------------------------------
         * FETCH NEXT PAGE — instance-driven
         * ----------------------------------------------------------- */
        async fetchQuery(el, context, page = 1, button = null) {
            const instance = el._wpbs;
            if (!instance) return;

            const { query = {}, uniqueId, divider, breakpoints, props } = context;

            try {
                const payload = {
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

                const temp = document.createElement("div");
                temp.innerHTML = data?.html ?? "";
                const cards = Array.from(temp.children);

                const { container } = instance;

                /* Add new cards */
                cards.forEach((card) => {
                    card.classList.remove("--visible");
                    container.appendChild(card);
                });

                el.classList.add("active");

                /* Update instance pagination state */
                instance.page = page;
                instance.totalPages = data.pages || 1;
                instance.hasMore = page < instance.totalPages;

                if (!instance.hasMore && button) {
                    button?.remove();
                }

                store("wpbs/layout-grid").callbacks.revealCards(el);

                gridDividers(
                    el,
                    JSON.parse(JSON.stringify({ uniqueId, divider, props, breakpoints })),
                    uniqueId
                );

            } catch (err) {
                console.error("WPBS Loop Fetch Exception:", err);
            }
        },

        /* -----------------------------------------------------------
         * LOAD MORE — triggers next page fetch
         * ----------------------------------------------------------- */
        async loadMore() {
            const { ref: el } = getElement();
            const context = getContext();
            const grid = el.closest(".wpbs-layout-grid");
            const instance = grid?._wpbs;

            if (!instance || !instance.hasMore) return;

            const nextPage = instance.page + 1;
            await store("wpbs/layout-grid").actions.fetchQuery(grid, context, nextPage, el);
        },
    },
});
