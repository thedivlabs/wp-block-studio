import {getImageUrlForResolution} from "Includes/helper";

const ResponsivePicture = ({
                               mobile = {},
                               large = {},
                               settings = {},
                               editor = false
                           }) => {

    const {
        resolutionMobile = "medium",
        resolutionLarge = "large",
        force = false,
        eager = false,
        breakpoint: breakpointKey = "normal",
        className: extraClass = "",
        style = {}
    } = settings;

    // Global theme breakpoints
    const breakpoints = WPBS.settings.breakpoints || {};
    const breakpoint = breakpoints[breakpointKey] || "768px";

    // ------------------------------------------------------------
    // SAFE IMAGE FALLBACKS
    // ------------------------------------------------------------
    // If only ONE image is provided, use it for BOTH breakpoints.
    const baseMobile = mobile?.id ? mobile : large?.id ? large : null;
    const baseLarge = large?.id ? large : mobile?.id ? mobile : null;

    if (!baseMobile && !baseLarge) {
        return null;
    }

    // Pull URLs using helper
    const urlMobile = getImageUrlForResolution(baseMobile, resolutionMobile);
    const urlLarge = getImageUrlForResolution(baseLarge, resolutionLarge);

    // If still nothing, abort rendering
    if (!urlMobile && !urlLarge) {
        return null;
    }

    // WebP variants
    const webpMobile = urlMobile && !urlMobile.endsWith(".svg")
        ? `${urlMobile}.webp`
        : null;

    const webpLarge = urlLarge && !urlLarge.endsWith(".svg")
        ? `${urlLarge}.webp`
        : null;

    // data- attributes when lazy
    const srcAttr = editor || eager ? "src" : "data-src";
    const srcsetAttr = editor || eager ? "srcset" : "data-srcset";

    const className = [
        "wpbs-picture",
        extraClass
    ].filter(Boolean).join(" ");

    // ------------------------------------------------------------
    // RENDER
    // ------------------------------------------------------------
    return (
        <picture
            className={className}
            style={{
                ...style,
                objectFit: "inherit"
            }}
        >

            {/* ================= MOBILE FIRST ================= */}
            {urlMobile && (
                <>
                    {webpMobile && (
                        <source
                            type="image/webp"
                            media={`(max-width: calc(${breakpoint} - 1px))`}
                            {...{[srcsetAttr]: webpMobile}}
                        />
                    )}
                    <source
                        media={`(max-width: calc(${breakpoint} - 1px))`}
                        {...{[srcsetAttr]: urlMobile}}
                    />
                </>
            )}

            {/* ================= LARGE ================= */}
            {urlLarge && (
                <>
                    {webpLarge && (
                        <source
                            type="image/webp"
                            media={`(min-width: ${breakpoint})`}
                            {...{[srcsetAttr]: webpLarge}}
                        />
                    )}
                    <source
                        media={`(min-width: ${breakpoint})`}
                        {...{[srcsetAttr]: urlLarge}}
                    />
                </>
            )}

            {/* ================= FALLBACK IMG ================= */}
            <img
                {...{
                    [srcAttr]: urlLarge || "#",
                    alt: large?.alt || mobile?.alt || "",
                    loading: eager ? "eager" : "lazy",
                    ariaHidden: true
                }}
            />
        </picture>
    );
};

export default ResponsivePicture;
