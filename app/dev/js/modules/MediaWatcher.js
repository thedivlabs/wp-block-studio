import debounce from "lodash/debounce";

export default class MediaWatcher {

    static videos = [];
    static pictures = [];

    static init() {

        // 1. Watch video / images / background / picture
        this.observeMedia(document);

        // 2. Watch visibility-only elements
        this.observeVisibility(document);

        // 3. Debounced MQ checking for videos + pictures
        const recheck = debounce(() => {
            this.videos.forEach((video) => {
                this.responsiveVideoSrc(video);
            });
            this.pictures.forEach((pic) => {
                this.responsivePictureSrc(pic);
            });
        }, 900);

        window.addEventListener("resize", recheck, {passive: true});
        window.addEventListener("scroll", recheck, {passive: true});
        window.addEventListener("load", recheck, {passive: true});
    }

    // -----------------------------------------------------
    // Responsive Picture MQ Activation (NEW)
    // -----------------------------------------------------
    static responsivePictureSrc(picture) {
        const sources = [...picture.querySelectorAll("source")];
        const img = picture.querySelector("img");
        if (!img || !sources.length) return;

        // How many breakpoint-specific sources?
        const bpSources = sources.filter(s => s.dataset.media);

        // 1. Find matching breakpoint <source>
        let active = bpSources.find(s => {
            const mq = s.dataset.media;
            return mq && window.matchMedia(mq).matches;
        });

        // 2. Fallback to base <source>
        if (!active) {
            active = sources.find(s => !s.dataset.media);
        }
        if (!active) return;

        const activeSrc = active.getAttribute("srcset") || active.dataset.srcset;
        if (!activeSrc) return;

        // 3. Promote active <source> to <img src>
        if (img.getAttribute("src") !== activeSrc) {
            img.setAttribute("src", activeSrc);
        }

        // 4. Promote active <source> (for <img srcset="" usage)
        if (active.dataset.srcset) {
            active.setAttribute("srcset", active.dataset.srcset);
            active.removeAttribute("data-srcset");
        }

        // 5. Demote all others
        for (const s of sources) {
            if (s === active) continue;

            const current = s.getAttribute("srcset");
            if (current) {
                s.setAttribute("data-srcset", current);
                s.removeAttribute("srcset");
            }
        }
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
        }

        const activeSrc = active && active.dataset.src;

        // Promote active
        if (activeSrc && active.getAttribute("src") !== activeSrc) {
            active.setAttribute("src", activeSrc);
            active.removeAttribute("data-src");
            changed = true;
        }

        // Demote others
        for (const s of sources) {
            if (s === active) continue;

            const sSrc = s.getAttribute("src");

            if (sSrc !== null) {
                s.setAttribute("data-src", sSrc);
                s.removeAttribute("src");
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

                    // -------------------------------------------------
                    // BACKGROUND
                    // -------------------------------------------------
                    if (el.classList.contains("wpbs-background")) {
                        this.responsiveBackgroundSrc(el);
                        return;
                    }

                    // -------------------------------------------------
                    // VIDEO
                    // -------------------------------------------------
                    if (el.tagName === "VIDEO") {
                        this.videos.push(el);
                        this.responsiveVideoSrc(el);
                        return;
                    }

                    // -------------------------------------------------
                    // PICTURE (NEW)
                    // -------------------------------------------------
                    if (el.tagName === "PICTURE") {
                        this.pictures.push(el);

                        // Promote child data-src/srcset → src/srcset
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

                        this.responsivePictureSrc(el);
                        return;
                    }

                    // -------------------------------------------------
                    // GENERIC LAZY (img, source)
                    // -------------------------------------------------
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
    // IntersectionObserver for content-visibility
    // -----------------------------------------------------
    static observeVisibility(root) {
        const observer = new IntersectionObserver(
            (entries, obs) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;

                    const el = entry.target;
                    obs.unobserve(el);

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