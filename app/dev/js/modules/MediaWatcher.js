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

        const sources = [...video.querySelectorAll("source")];

        // STEP 1 — Find active breakpoint source (if any)
        let activeBreakpoint = null;

        for (const source of sources) {
            const mq = source.dataset.media || null;

            // Only breakpoint sources have mq
            if (!mq) continue;

            if (window.matchMedia(mq).matches) {
                activeBreakpoint = source;
                break;
            }
        }

        // STEP 2 — Apply breakpoint behavior if matched
        if (activeBreakpoint) {
            const dataSrc = activeBreakpoint.dataset.src ?? "";
            const disabled = !dataSrc || dataSrc === "#" || dataSrc === "";

            for (const source of sources) {
                if (source === activeBreakpoint) {
                    // ENABLED breakpoint
                    if (!disabled && source.getAttribute("src") !== dataSrc) {
                        source.setAttribute("src", dataSrc);
                        changed = true;
                    }

                    // DISABLED breakpoint
                    if (disabled && source.getAttribute("src") !== "#") {
                        source.setAttribute("src", "#");
                        changed = true;
                    }

                    continue;
                }

                // Non-active sources must be reset
                if (source.getAttribute("src") && source.getAttribute("src") !== "#") {
                    source.setAttribute("src", "#");
                    changed = true;
                }
            }

            if (changed) video.load();
            return;
        }

        // STEP 3 — No matching breakpoint → base behavior
        const base = sources.find((s) => !s.dataset.media);

        if (!base) return;

        const dataSrc = base.dataset.src ?? "";
        const disabled = !dataSrc || dataSrc === "#" || dataSrc === "";

        if (disabled) {
            if (base.getAttribute("src") !== "#") {
                base.setAttribute("src", "#");
                changed = true;
            }
        } else {
            if (base.getAttribute("src") !== dataSrc) {
                base.setAttribute("src", dataSrc);
                changed = true;
            }
        }

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
