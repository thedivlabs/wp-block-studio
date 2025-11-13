import _ from "lodash";

export default class MediaWatcher {

    static videos = [];

    static init() {

        this.observeMedia(document);

        const recheck = _.debounce(() => {
            this.videos.forEach((video) => {
                this.responsiveVideoSrc(video);
            });
        }, 900);

        window.addEventListener("resize", recheck, { passive: true });
        window.addEventListener("scroll", recheck, { passive: true });
        window.addEventListener("load", recheck, { passive: true });
    }

    static responsiveBackgroundSrc(element) {
        element.classList.remove("--lazy");
    }

    static responsiveVideoSrc(video) {
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