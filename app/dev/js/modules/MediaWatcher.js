import debounce from "lodash/debounce";

export default class MediaWatcher {

    static videos = [];

    static init() {

        this.observeMedia(document);

        const recheck = debounce(() => {
            this.videos.forEach((video) => {
                this.responsiveVideoSrc(video);
            });
        }, 900);

        window.addEventListener("resize", recheck, {passive: true});
        window.addEventListener("scroll", recheck, {passive: true});
        window.addEventListener("load", recheck, {passive: true});
    }

    static responsiveBackgroundSrc(element) {
        element.classList.remove("--lazy");
    }

    static responsiveVideoSrc(video) {
        let changed = false;

        [...video.querySelectorAll("source")].forEach((source) => {
            const mq = source.dataset.media || null;
            const dataSrc = source.dataset.src || "";
            const currentSrc = source.getAttribute("src") || "";

            // ---------------------------------------------------
            // BASE SOURCE (no data-media)
            // ---------------------------------------------------
            if (!mq) {
                // activate base source if not already active
                if (dataSrc && currentSrc !== dataSrc) {
                    source.setAttribute("src", dataSrc);
                    changed = true;
                }
                return;
            }

            // ---------------------------------------------------
            // MQ SOURCE
            // ---------------------------------------------------
            const matches = window.matchMedia(mq).matches;

            if (matches) {
                // activate source if not already active
                if (dataSrc && currentSrc !== dataSrc) {
                    source.setAttribute("src", dataSrc);
                    changed = true;
                }
                return;
            }

            // MQ does NOT match → deactivate
            if (currentSrc !== "#" && currentSrc !== "") {
                source.setAttribute("src", "#");
                changed = true;
            }
        });

        if (changed) {
            video.load();
        }
    }

    static observeMedia(root) {
        const observer = new IntersectionObserver(
            (entries, obs) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;

                    const el = entry.target;
                    obs.unobserve(el);

                    if (el.tagName === "VIDEO") {
                        this.videos.push(el);
                        this.responsiveVideoSrc(el);
                        return;
                    }

                    if (el.classList.contains("wpbs-background")) {
                        this.responsiveBackgroundSrc(el);
                        return;
                    }

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
}
