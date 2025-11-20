import React from "react";

const ResponsivePicture = ({mobile = {}, large = {}, settings = {}, editor = false}) => {
    const {
        resolutionMobile: sizeMobile = "medium",
        resolutionLarge: sizeLarge = "large",
        force = false,
        eager = false,
    } = settings;

    // Pull global breakpoints
    const breakpoints = WPBS.settings.breakpoints || {};
    const breakpointKey = settings?.breakpoint ?? "normal";
    const breakpoint = breakpoints[breakpointKey];

    // Extract correct sized variants
    const {[sizeMobile]: mobileVariant = {}} = mobile.sizes || {};
    const {[sizeLarge]: largeVariant = {}} = large.sizes || {};

    // Determine URLs with fallback logic (matches PHP logic)
    let urlLarge;
    let urlMobile;

    if (!force) {
        urlLarge = largeVariant.url || mobileVariant.url || null;
        urlMobile = mobileVariant.url || largeVariant.url || null;
    } else {
        urlLarge = largeVariant.url || null;
        urlMobile = mobileVariant.url || null;
    }

    // Nothing to render
    if (!urlLarge && !urlMobile) {
        return null;
    }

    // Only create WebP if not SVG
    const webpLarge = urlLarge && !urlLarge.includes(".svg") ? urlLarge + ".webp" : null;
    const webpMobile = urlMobile && !urlMobile.includes(".svg") ? urlMobile + ".webp" : null;

    const className = [
        "wpbs-picture",
        settings.className || null
    ].filter(Boolean).join(" ");

    // Attribute mode
    const srcAttr = editor || eager ? "src" : "data-src";
    const srcsetAttr = editor || eager ? "srcset" : "data-srcset";

    return (
        <picture
            className={className}
            style={{
                ...(settings.style || {}),
                objectFit: "inherit",
            }}
        >
            {/* MOBILE FIRST (max-width) */}
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

            {/* LARGE (min-width) */}
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

            {/* FALLBACK IMG — always large */}
            <img
                {...{
                    [srcAttr]: urlLarge || "#",
                    alt: large?.alt || mobile?.alt || "",
                    ariaHidden: true,
                    loading: eager ? "eager" : "lazy",
                }}
            />
        </picture>
    );
};

export default ResponsivePicture;
