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
         * INIT — run once per block
         * ----------------------------------------------------------- */
        init() {
            const { ref: el } = getElement();
            const context = getContext();
            const { uniqueId, divider, breakpoints, props } = context;

            /* Create per-instance storage on the block element */
            el._wpbs = {
                container: el.querySelector(".loop-container") ?? el,
                template: null,
                page: 1,
                hasMore: false,
                totalPages: 1,
            };

            /* Fire dividers immediately on init */
            if (window?.WPBS?.gridDividers) {
                window.WPBS.gridDividers(
                    el,
                    JSON.parse(JSON.stringify({ uniqueId, divider, props, breakpoints })),
                    uniqueId
                );
            }

            /* Load the template (still needed for future pagination) */
            const templateScript = el.querySelector("script[data-wpbs-loop-template]");
            if (!templateScript) {
                console.error("WPBS Loop Error: Missing template script.");
                return;
            }

            try {
                el._wpbs.template = JSON.parse(templateScript.textContent);
            } catch (err) {
                console.error("WPBS Loop Error: Invalid template JSON.", err);
                return;
            }

            templateScript.remove();

            /* Lazy-load using viewport observer (optional) */
            /*
            const observer = new IntersectionObserver(
                entries => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            observer.unobserve(entry.target);
                            store("wpbs/layout-grid").actions.fetchQuery(el, context, 1);
                        }
                    });
                },
                { threshold: 0 }
            );

            observer.observe(el);
            */
        },

        /* -----------------------------------------------------------
         * FETCH SSR LOOP RESULTS — now instance-driven
         * ----------------------------------------------------------- */
        async fetchQuery(el, context, page = 1, button = null) {
            const instance = el._wpbs;
            if (!instance) return;

            const {template} = instance;
            const {query = {}, uniqueId, divider, breakpoints, props} = context;

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

                //console.log(data);
                //console.log(JSON.parse(JSON.stringify(payload)));

                const temp = document.createElement("div");
                temp.innerHTML = data?.html ?? "";
                const cards = Array.from(temp.children);

                const {container} = instance;

                /* Clear existing cards */
                //container.querySelectorAll(".loop-card").forEach(old => old.remove());

                /* Add new cards */
                cards.forEach(card => {
                    card.classList.remove("--visible");
                    container.appendChild(card);
                });

                el.classList.add("active");

                /* Update instance pagination state */
                instance.page = page;
                instance.totalPages = data.pages || 1;
                instance.hasMore = page < instance.totalPages;

                if (!instance.hasMore && button) {
                    button?.remove()
                }

                store("wpbs/layout-grid").callbacks.revealCards(el);

                gridDividers(el, JSON.parse(JSON.stringify({
                    uniqueId,
                    divider,
                    props,
                    breakpoints
                })), uniqueId);

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
