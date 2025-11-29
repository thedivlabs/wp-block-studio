import {getContext, getElement, store} from "@wordpress/interactivity";

store("wpbs/layout-grid", {
    state: {
        allItems: [],
        items: [],
        visibleCount: 0,
        pageSize: 12,
        imageSize: null,
        isLoaded: false,
        hasMore: false,
        containerEl: null,
    },
    callbacks: {
        revealCards() {
            const state = store("wpbs/layout-grid").state;
            const container = state.containerEl;
            if (!container) return;

            requestAnimationFrame(() => {
                const newCards = container.querySelectorAll(".wpbs-loop-card:not(.--visible)");

                newCards.forEach((card, i) => {
                    card.style.setProperty('--delay', `${i * 100}ms`);
                });

                setTimeout(() => {
                    newCards.forEach((card, i) => {
                        card.classList.add("--visible");
                    });
                }, 100);

            });
        },
    },
    actions: {
        async fetchFeed(context) {
            const {state, callbacks} = store("wpbs/layout-grid");
            const {feed, maxItems = 12, dateFormat, imageSize = null} = context;

            if (!feed) {
                return
            }

            const params = new URLSearchParams(
                Object.fromEntries(
                    Object.entries({
                        feed,
                        dateFormat,
                        imageSize
                    }).filter(([_, v]) => v != null && v !== "")
                )
            );

            try {

                const response = await fetch(`/wp-json/wpbs/v1/xml-feed?${params.toString()}`);

                const data = await response.json();

                const {items} = data;

                if(!items){return}

                state.allItems = items;
                state.pageSize = parseInt(maxItems, 10);
                state.visibleCount = state.pageSize;
                state.items = items.slice(0, state.visibleCount);

                state.imageSize = imageSize;
                state.hasMore = state.visibleCount < items.length;

                state.isLoaded = true;

                callbacks.revealCards();

            } catch (err) {
                console.error("Feed fetch error:", err);
            }
        },

        loadMore() {
            const {state, callbacks} = store("wpbs/layout-grid");


            state.visibleCount = Math.min(
                state.visibleCount + state.pageSize,
                state.allItems.length
            );
            state.items = state.allItems.slice(0, state.visibleCount);

            state.hasMore = state.visibleCount < state.allItems.length;

            callbacks.revealCards();
        },

        async init() {
            const {actions, state} = store("wpbs/layout-grid");
            const context = getContext();
            const {ref: element} = getElement();

            state.containerEl = element;

            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            observer.unobserve(entry.target);
                            actions.fetchFeed(context);
                        }
                    });
                },
                {
                    root: null,
                    threshold: 0,
                }
            );

            observer.observe(element);
        },
    },
});