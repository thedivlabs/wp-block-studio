export default class Video {
    static init() {
        if (document.body.classList.contains("wp-admin")) return;

        document.addEventListener("click", (e) => {
            const el = e.target.closest(".wpbs-video:not(.--disabled)");
            if (el) {
                this.clickHandler(el);
            }
        });
    }

    static clickHandler(element) {
        const { title, vid, platform } = element.dataset;
        const isLightbox = element.classList.contains("--lightbox");

        if (element.classList.contains("active")) return false;

        const baseURL = {
            rumble: "https://rumble.com/embed/",
            youtube: "https://www.youtube.com/embed/",
            vimeo: "https://player.vimeo.com/video/",
        };

        const queryString = {
            rumble: "",
            youtube: "?autoplay=1&enablejsapi=1&rel=0",
            vimeo: "",
        };

        const classNames = [
            "wpbs-video-player",
            isLightbox
                ? "h-auto overflow-hidden w-[min(140vh,100vw,100%)] max-w-full aspect-video m-auto relative"
                : "w-full h-full",
        ]
            .filter(Boolean)
            .join(" ");

        // ----------------------------------------------
        // iframe (jQuery → pure)
        // ----------------------------------------------
        const iframe = document.createElement("iframe");
        iframe.src =
            (baseURL[platform] || baseURL.youtube) +
            vid +
            (queryString[platform] || queryString.youtube);
        iframe.allow = "autoplay;";
        iframe.allowFullscreen = true;
        iframe.title = title || "YouTube video player";
        iframe.frameBorder = "0";
        iframe.width = "100%";
        iframe.height = "100%";
        iframe.className =
            "absolute top-0 left-0 w-full h-full opacity-0 transition-opacity duration-500";

        iframe.addEventListener("load", () => {
            iframe.style.opacity = "1";
            WPBS.loader.toggle({ remove: true });
        });

        // ----------------------------------------------
        // wrapper div (jQuery → pure)
        // ----------------------------------------------
        const component = document.createElement("div");
        component.className = classNames;
        component.appendChild(iframe);

        // ----------------------------------------------
        // lightbox vs inline
        // ----------------------------------------------
        if (isLightbox) {
            WPBS.modals.toggle_modal(false, {
                template: component,
            });
        } else {
            element.classList.add("active");
            element.replaceChildren(component);
        }
    }
}