import debounce from "lodash/debounce";

export default class MediaWatcher {

    static videos = [];

    static init() {

        // 1. Watch video / images / background
        this.observeMedia(document);

        // 2. Watch visibility-only elements
        this.observeVisibility(document);

        [...document.querySelectorAll('link[data-href]')].forEach((link) => {
            link.href = link.dataset.href;
        });

        // 3. Debounced MQ checking for videos
        const recheck = debounce(() => {
            this.videos.forEach((video) => {
                this.responsiveVideoSrc(video);
            });
        }, 900);

        window.addEventListener("resize", recheck, {passive: true});
        window.addEventListener("scroll", recheck, {passive: true});
        window.addEventListener("load", recheck, {passive: true});
    }

    // -----------------------------------------------------
    // Background (simple)
    // -----------------------------------------------------
    static responsiveBackgroundSrc(element) {
        element.classList.remove("--lazy");
    }

    // -----------------------------------------------------
    // Responsive Video MQ Activation
    // -----------------------------------------------------
    static responsiveVideoSrc(video) {
        let changed = false;

        [...video.querySelectorAll("source")].forEach((source) => {
            const mq = source.dataset.media || null;
            const dataSrc = source.dataset.src || "";
            const currentSrc = source.getAttribute("src") || "";

            // BASE SOURCE (no MQ)
            if (!mq) {
                if (dataSrc && currentSrc !== dataSrc) {
                    source.setAttribute("src", dataSrc);
                    changed = true;
                }
                return;
            }

            const matches = window.matchMedia(mq).matches;

            if (matches) {
                // MQ matches → activate
                if (dataSrc && currentSrc !== dataSrc) {
                    source.setAttribute("src", dataSrc);
                    changed = true;
                }
                return;
            }

            // MQ does NOT match → deactivate
            if (currentSrc && currentSrc !== "#") {
                source.setAttribute("src", "#");
                changed = true;
            }
        });

        if (changed) video.load();
    }

    // -----------------------------------------------------
    // IntersectionObserver for lazy media
    // -----------------------------------------------------
    static observeMedia(root) {
        const observer = new IntersectionObserver(
            (entries, obs) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;

                    const el = entry.target;
                    obs.unobserve(el);

                    // VIDEO
                    if (el.tagName === "VIDEO") {
                        this.videos.push(el);
                        this.responsiveVideoSrc(el);
                        return;
                    }

                    // BACKGROUND WRAPPER
                    if (el.classList.contains("wpbs-background")) {
                        this.responsiveBackgroundSrc(el);
                        return;
                    }

                    // GENERIC LAZY
                    [...el.querySelectorAll("[data-src],[data-srcset]"), el].forEach(
                        (child) => {
                            if (child.dataset.src) {
                                child.src = child.dataset.src;
                                child.removeAttribute("data-src");
                            }
                            if (child.dataset.srcset) {
                                child.srcset = child.dataset.srcset;
                                child.removeAttribute("data-srcset");
                            }
                        }
                    );
                });
            },
            {
                root: null,
                rootMargin: "90px",
                threshold: 0,
            }
        );

        const selector =
            "img[data-src]," +
            "picture:has(source[data-src])," +
            "video:has(source[data-src])," +
            "video:has(source[data-media])," +
            ".wpbs-background";

        [...root.querySelectorAll(selector)].forEach((el) =>
            observer.observe(el)
        );
    }

    // -----------------------------------------------------
    // IntersectionObserver for data-visibility optimizations
    // -----------------------------------------------------
    static observeVisibility(root) {

        const observer = new IntersectionObserver(
            (entries, obs) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;

                    const el = entry.target;
                    obs.unobserve(el);

                    // Turn on content-visibility only when shown
                    el.style.contentVisibility = "visible";
                });
            },
            {
                root: null,
                rootMargin: "500px 0px 500px 0px",
                threshold: 0,
            }
        );

        [...root.querySelectorAll("[data-visibility]")].forEach((el) =>
            observer.observe(el)
        );
    }
}
