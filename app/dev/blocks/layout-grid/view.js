/**************************************************************************
 * WPBS LAYOUT GRID — FRONT-END LOOP ENGINE (Instance-based, no global state)
 **************************************************************************/

import {store, getContext, getElement} from "@wordpress/interactivity";

const {gridDividers} = window?.WPBS ?? {};

store("wpbs/layout-grid", {
    callbacks: {
        /* -----------------------------------------------------------
         * Staggered reveal animation
         * ----------------------------------------------------------- */
        revealCards(el) {
            const instance = el._wpbs;
            if (!instance) return;

            const {container} = instance;
            if (!container) return;

            requestAnimationFrame(() => {
                const newCards = container.querySelectorAll(".loop-card.--loading");

                newCards.forEach((card, i) => {
                    card.style.setProperty("--delay", `${i * 100}ms`);
                });

                setTimeout(() => {
                    newCards.forEach((card) => card.classList.remove("--loading"));
                }, 50);
            });
        },
    },

    actions: {
        /* -----------------------------------------------------------
         * INIT — run once per block (main query already rendered)
         * ----------------------------------------------------------- */
        init() {
            const {ref: el} = getElement();
            const context = getContext();

            const script = el.querySelector('script[data-wpbs-loop-template]');
            if (!script) return console.error("Missing loop template JSON");

            const data = JSON.parse(script.textContent);
            const template = data.template;
            const pagination = data.pagination;

            const hasMore = pagination.page < pagination.totalPages;

            // Save instance state
            el._wpbs = {
                container: el.querySelector(".loop-container") ?? el,
                template,
                page: pagination.page,
                totalPages: pagination.totalPages,
                hasMore,
                query: pagination.query,
            };

            // Remove script tag after parsing
            script.remove();

            if (hasMore) el.classList.add("active");

            const {uniqueId, divider, breakpoints, props} = context;
            gridDividers?.(
                el,
                JSON.parse(JSON.stringify({uniqueId, divider, props, breakpoints})),
                uniqueId
            );
        },

        /* -----------------------------------------------------------
         * FETCH SSR LOOP RESULTS — instance-driven for pagination
         * ----------------------------------------------------------- */
        async fetchQuery(el, context, page = 1, button = null) {
            const instance = el._wpbs;
            if (!instance) return;

            const {template, query} = instance;
            const {uniqueId, divider, breakpoints, props} = context;

            if (!template) {
                console.error("WPBS Loop Error: Template missing.");
                return;
            }

            try {
                const payload = {template, query, page};

                const res = await fetch("/wp-json/wpbs/v1/loop", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
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

                const {container} = instance;

                // Append new cards
                cards.forEach((card) => {
                    card.classList.add("--loading");
                    container.appendChild(card);
                });

                // Update pagination state
                instance.page = page;
                instance.totalPages = data.pages || 1;
                instance.hasMore = page < instance.totalPages;

                if (!instance.hasMore && button) button?.remove();

                store("wpbs/layout-grid").callbacks.revealCards(el);

                // Reapply dividers
                gridDividers?.(
                    el,
                    JSON.parse(JSON.stringify({uniqueId, divider, props, breakpoints})),
                    uniqueId
                );
            } catch (err) {
                console.error("WPBS Loop Fetch Exception:", err);
            }
        },

        /* -----------------------------------------------------------
         * LOAD MORE — instance-driven
         * ----------------------------------------------------------- */
        async loadMore() {
            const {ref: el} = getElement();
            const context = getContext();
            const grid = el.closest(".wpbs-layout-grid");
            const instance = grid?._wpbs;
            
            if (!instance || !instance.hasMore) return;

            const nextPage = instance.page + 1;
            await store("wpbs/layout-grid").actions.fetchQuery(grid, context, nextPage, el);
        },
    },
});
