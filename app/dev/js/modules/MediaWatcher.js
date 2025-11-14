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
        const sources = [...video.querySelectorAll("source")];
        if (!sources.length) return;

        const bpCount = sources.filter(s => s.dataset.media).length;

        let changed = false;

        // 1. Find matching breakpoint source
        let active = !bpCount ? sources[0] : sources.find(s => {
            const mq = s.dataset.media;
            return mq && window.matchMedia(mq).matches;
        });

        // 2. If none matched → base is active
        if (!active) {
            active = sources.find(s => !s.dataset.media);
            if (!active) return;
        }

        const activeSrc = active.dataset.src;

        // ----- PROMOTE ACTIVE -----
        if (activeSrc && active.getAttribute("src") !== activeSrc) {
            active.setAttribute("src", activeSrc);
            active.removeAttribute("data-src");
            changed = true;
        }

        // ----- DEMOTE ALL OTHER SOURCES -----
        for (const s of sources) {
            if (s === active) continue;

            const sSrc = s.getAttribute("src");

            // If inactive and has any src value (even "#" or ""), demote it
            if (sSrc !== null) {
                s.setAttribute("data-src", sSrc);
                s.removeAttribute("src");
                changed = true;
            }
        }

        if (changed) video.load();
    }


    // IntersectionObserver for lazy media
    // -----------------------------------------------------
    static observeMedia(root) {
        const observer = new IntersectionObserver(
            (entries, obs) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;

                    const el = entry.target;
                    obs.unobserve(el);

                    // BACKGROUND WRAPPER
                    if (el.classList.contains("wpbs-background")) {
                        this.responsiveBackgroundSrc(el);
                        return;
                    }

                    // VIDEO
                    if (el.tagName === "VIDEO") {
                        console.log(el);
                        this.videos.push(el);
                        this.responsiveVideoSrc(el);
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
                rootMargin: "400px 0px 400px 0px",
                threshold: 0,
            }
        );

        const selector =
            "img[data-src]," +
            "picture:has(source[data-src])," +
            "video:has(source[data-src])," +
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
