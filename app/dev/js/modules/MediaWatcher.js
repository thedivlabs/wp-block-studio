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
            const dataValue = source.dataset.src; // may be undefined or "#"
            const currentSrc = source.src || "";

            // NO MEDIA QUERY → always ensure src matches data-src once, then stop
            if (!mq) {
                if (dataValue && currentSrc !== dataValue) {
                    source.src = dataValue;
                    delete source.dataset.src;
                    video.load();
                }
                return;
            }

            const matches = window.matchMedia(mq).matches;

            // --------------------------------------------
            // WHEN MEDIA QUERY MATCHES
            // --------------------------------------------
            if (matches) {
                // Case: matching MQ expects real source (data-src)
                if (dataValue && currentSrc !== dataValue) {
                    source.src = dataValue;
                    delete source.dataset.src;
                    video.load();
                }

                // Case: matching MQ but no data-src → ensure src is at least "#"
                if (!dataValue && !currentSrc) {
                    source.src = "#";
                    video.load();
                }

                return;
            }

            // --------------------------------------------
            // WHEN MEDIA QUERY DOES NOT MATCH
            // --------------------------------------------
            // If src has a real URL, move it to data-src only if needed
            if (currentSrc && currentSrc !== "#" && dataValue !== currentSrc) {
                source.dataset.src = currentSrc;
            }

            // Only set src="#" if it's not already "#"
            if (currentSrc !== "#") {
                source.src = "#";
                video.load();
            }
        });
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