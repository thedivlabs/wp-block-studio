/**
 * BackgroundMedia.js
 *
 * A future-proof media renderer for background elements.
 * Currently supports <video>, but designed so you can easily
 * add Lottie, animated SVG, WebM, etc.
 */

import { memo } from "@wordpress/element";

/**
 * Build a responsive <video> element based on base + breakpoints.
 * This is 100% extracted from the original Background.js file.
 */
const BackgroundVideo = ({ settings = {}, isSave = false }) => {
    if (!isSave) return null;

    const { props = {}, breakpoints = {} } = settings || {};
    const bpDefs = WPBS?.settings?.breakpoints ?? {};
    const entries = [];

    // ----------------------------------------
    // Base video
    // ----------------------------------------
    const baseVideo = props?.video;
    const hasRealBase = !!baseVideo?.source;

    if (baseVideo?.source) {
        entries.push({
            size: Infinity,
            video: baseVideo,
        });
    }

    // ----------------------------------------
    // Breakpoint overrides
    // ----------------------------------------
    Object.entries(breakpoints || {}).forEach(([bpKey, bpData]) => {
        const size = bpDefs?.[bpKey]?.size ?? 0;
        const bpVideo = bpData?.props?.video;

        // Explicit video at breakpoint
        if (bpVideo) {
            if (bpVideo.source) {
                entries.push({ size, video: bpVideo });
            } else if (bpVideo.isPlaceholder && hasRealBase) {
                // implicit disable
                entries.push({
                    size,
                    video: { source: "#", mime: "video/mp4" },
                });
            }
            return;
        }

        // No video at this breakpoint: if base has video → disable here
        if (hasRealBase) {
            entries.push({
                size,
                video: { source: "#", mime: "video/mp4" },
            });
        }
    });

    if (!entries.length) return null;

    // Sort: base (Infinity) first
    entries.sort((a, b) => b.size - a.size);

    const baseEntry = entries.find((e) => e.size === Infinity);
    const baseVideoObj = baseEntry?.video ?? null;
    const bpEntries = entries.filter((e) => e.size !== Infinity);

    return (
        <video
            muted
            loop
            autoPlay
            playsInline
            className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none"
        >
            {/* BREAKPOINT SOURCES */}
            {bpEntries.map(({ size, video }, i) => {
                const mq =
                    Number.isFinite(size) && size > 0 && size !== Infinity
                        ? `(max-width:${size - 1}px)`
                        : null;

                return (
                    <source
                        key={`bp-${i}`}
                        data-src={video.source || "#"}
                        data-media={mq}
                        type={video.mime || "video/mp4"}
                    />
                );
            })}

            {/* BASE SOURCE */}
            {baseVideoObj?.source && (
                <source
                    data-src={baseVideoObj.source}
                    type={baseVideoObj.mime || "video/mp4"}
                />
            )}
        </video>
    );
};

/**
 * Main exported component.
 *
 * Expands in the future:
 * - if props.type === "lottie" → <Lottie />
 * - if props.type === "svg" → <img> or <svg>
 * - etc.
 */
export const BackgroundMedia = memo(function BackgroundMedia({
                                                                 settings = {},
                                                                 isSave = false,
                                                             }) {
    const type = settings?.props?.type;

    // Eventually switch on type:
    switch (type) {
        case "video":
            return <BackgroundVideo settings={settings} isSave={isSave} />;

        // case "lottie":
        //     return <LottieRenderer settings={settings} isSave={isSave} />;

        // case "webm":
        //     return <WebMRenderer settings={settings} isSave={isSave} />;

        default:
            return null;
    }
});