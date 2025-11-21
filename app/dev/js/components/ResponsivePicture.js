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

    /* ------------------------------------------------------------
     * BREAKPOINT
     * ------------------------------------------------------------ */
    const breakpoints = WPBS.settings.breakpoints || {};
    const bp = breakpoints[breakpointKey];
    const breakpoint = bp?.size ? `${bp.size}px` : "768px";

    /* ------------------------------------------------------------
     * PLACEHOLDER DETECTION
     * ------------------------------------------------------------ */
    const isMobilePlaceholder = mobile?.isPlaceholder === true;
    const isLargePlaceholder = large?.isPlaceholder === true;

    /* ------------------------------------------------------------
     * BASE IMAGE SELECTION
     * ------------------------------------------------------------ */
    const baseMobile =
        !isMobilePlaceholder && mobile?.id
            ? mobile
            : !isLargePlaceholder && large?.id
                ? large
                : null;

    const baseLarge =
        !isLargePlaceholder && large?.id
            ? large
            : !isMobilePlaceholder && mobile?.id
                ? mobile
                : null;

    // If no real images and no placeholders → no render
    if (!baseMobile && !baseLarge && !isMobilePlaceholder && !isLargePlaceholder) {
        return null;
    }

    /* ------------------------------------------------------------
     * BUILD URLs — FULLY PATCHED FALLBACK LOGIC
     * ------------------------------------------------------------ */

    // MOBILE URL
    const urlMobile = isMobilePlaceholder
        ? (mobile?.url || "#")
        : mobile?.source                        // <-- NEW: use block source first
            ? mobile.source
            : getImageUrlForResolution(baseMobile, resolutionMobile);

    // LARGE URL
    const urlLarge = isLargePlaceholder
        ? (large?.url || "#")
        : large?.source                         // <-- NEW: use block source first
            ? large.source
            : getImageUrlForResolution(baseLarge, resolutionLarge);

    // If both URLs fail → bail
    if (!urlMobile && !urlLarge) {
        return null;
    }

    /* ------------------------------------------------------------
     * WEBP
     * ------------------------------------------------------------ */
    const webpMobile =
        urlMobile && urlMobile !== "#" && !urlMobile.endsWith(".svg")
            ? `${urlMobile}.webp`
            : null;

    const webpLarge =
        urlLarge && urlLarge !== "#" && !urlLarge.endsWith(".svg")
            ? `${urlLarge}.webp`
            : null;

    /* ------------------------------------------------------------
     * ATTRIBUTES
     * ------------------------------------------------------------ */
    const srcAttr = editor || eager ? "src" : "data-src";
    const srcsetAttr = editor || eager ? "srcset" : "data-srcset";

    const className = ["wpbs-picture", extraClass].filter(Boolean).join(" ");

    /* ------------------------------------------------------------
     * RENDER
     * ------------------------------------------------------------ */
    return (
        <picture className={className} style={{...style, objectFit: "inherit"}}>

            {/* MOBILE */}
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

            {/* LARGE */}
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

            <img
                {...{
                    [srcAttr]: urlLarge || urlMobile || "#",
                    alt: large?.alt || mobile?.alt || "",
                    loading: eager ? "eager" : "lazy",
                    ariaHidden: true
                }}
            />
        </picture>
    );
};

export default ResponsivePicture;
