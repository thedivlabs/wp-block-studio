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

    const breakpoints = WPBS.settings.breakpoints || {};
    const bp = breakpoints[breakpointKey];
    const breakpoint = bp?.size ? `${bp.size}px` : "768px";

    const isMobilePlaceholder = mobile?.isPlaceholder === true;
    const isLargePlaceholder = large?.isPlaceholder === true;

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

    if (!baseMobile && !baseLarge && !isMobilePlaceholder && !isLargePlaceholder) {
        return null;
    }

    /* ------------------------------------------------------------
     * ALWAYS RESPECT RESOLUTION SETTINGS
     * ------------------------------------------------------------ */

    let urlMobile;

    if (isMobilePlaceholder) {
        urlMobile = mobile?.source || "#";
    } else if (mobile?.source) {
        urlMobile = getImageUrlForResolution(mobile, resolutionMobile) || mobile.source;
    } else if (baseMobile) {
        urlMobile = getImageUrlForResolution(baseMobile, resolutionMobile);
    } else {
        urlMobile = null;
    }

    let urlLarge;

    if (isLargePlaceholder) {
        urlLarge = large?.source || "#";
    } else if (large?.source) {
        urlLarge = getImageUrlForResolution(large, resolutionLarge) || large.source;
    } else if (baseLarge) {
        urlLarge = getImageUrlForResolution(baseLarge, resolutionLarge);
    } else {
        urlLarge = null;
    }

    if (!urlMobile && !urlLarge) {
        return null;
    }

    const webpMobile =
        urlMobile && urlMobile !== "#" && !urlMobile.endsWith(".svg")
            ? `${urlMobile}.webp`
            : null;

    const webpLarge =
        urlLarge && urlLarge !== "#" && !urlLarge.endsWith(".svg")
            ? `${urlLarge}.webp`
            : null;

    const srcAttr = editor || eager ? "src" : "data-src";
    const srcsetAttr = editor || eager ? "srcset" : "data-srcset";

    const className = ["wpbs-picture", extraClass].filter(Boolean).join(" ");

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