import _ from "lodash";

export default class MediaWatcher {

    static init(themeInstance) {
        if (!themeInstance) return;

        this.theme = themeInstance;

        // Ensure videos array exists
        if (!Array.isArray(this.theme.videos)) {
            this.theme.videos = [];
        }

        // Bind methods
        this.responsiveVideoSrc = this.responsiveVideoSrc.bind(this);
        this.responsiveBackgroundSrc = this.responsiveBackgroundSrc.bind(this);
        this.observeMedia = this.observeMedia.bind(this);

        // Setup watchers
        document.addEventListener("DOMContentLoaded", () => {
            this.observeMedia(document);

            // Load lazy hrefs
            [...document.querySelectorAll('link[data-href]')].forEach((link) => {
                link.href = link.dataset.href;
            });
        });

        // Debounced viewport-based video re-check
        const recheck = _.debounce(() => {
            if (!Array.isArray(this.theme.videos)) return;

            this.theme.videos.forEach((video) => {
                this.responsiveVideoSrc(video);
            });
        }, 900);

        window.addEventListener("resize", recheck, { passive: true });
        window.addEventListener("scroll", recheck, { passive: true });
        window.addEventListener("load", recheck, { passive: true });
    }

    // -----------------------------------------------------
    // Responsive Background
    // -----------------------------------------------------
    responsiveBackgroundSrc(element) {
        element.classList.remove("--lazy");
    }

    // -----------------------------------------------------
    // Responsive Video Source MQ Handler
    // -----------------------------------------------------
    responsiveVideoSrc(video) {
        [...video.querySelectorAll("source")].forEach((source) => {
            const mq = source.dataset.media;
            const hasDataSrc = !!source.dataset.src;

            if (!mq) {
                if (hasDataSrc) {
                    source.src = source.dataset.src;
                    delete source.dataset.src;
                }
                return;
            }

            const matches = window.matchMedia(mq).matches;

            if (matches) {
                if (hasDataSrc) {
                    source.src = source.dataset.src;
                    delete source.dataset.src;
                } else if (!source.src) {
                    source.src = "#";
                }
            } else {
                if (source.src && source.src !== "#") {
                    source.dataset.src = source.src;
                }
                source.src = "#";
            }
        });

        video.load();
    }

    // -----------------------------------------------------
    // IntersectionObserver Loader (images, video, bg)
    // -----------------------------------------------------
    observeMedia(root) {
        const observer = new IntersectionObserver(
            (entries, obs) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;

                    const el = entry.target;
                    obs.unobserve(el);

                    // Handle VIDEO
                    if (el.tagName === "VIDEO") {
                        this.theme.videos.push(el);
                        this.responsiveVideoSrc(el);
                        return;
                    }

                    // Background wrappers
                    if (el.classList.contains("wpbs-background")) {
                        this.responsiveBackgroundSrc(el);
                        return;
                    }

                    // Generic lazy elements
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