import {memo} from "@wordpress/element";

/**
 * BackgroundVideo
 *
 * Handles the <video> element for background video rendering.
 * - Works with unified media shape: settings.props.media
 * - Fully breakpoint-aware
 * - Supports placeholder ("#") disabling
 * - No CSS-based video logic — HTML <video> is always the renderer
 */
const BackgroundVideo = ({settings = {}, isSave = false}) => {
    if (!isSave) return null; // only output on frontend save

    const {props = {}, breakpoints = {}} = settings || {};
    const bpDefs = WPBS?.settings?.breakpoints ?? {};
    const entries = [];

    const baseMedia = props?.media;

    const isBaseVideo =
        props?.type === "video" &&
        baseMedia &&
        typeof baseMedia.source === "string" &&
        baseMedia.source !== "";

    if (isBaseVideo) {
        entries.push({
            size: Infinity,
            media: baseMedia,
        });
    }

    // Breakpoints
    Object.entries(breakpoints || {}).forEach(([bpKey, bpData]) => {
        const size = bpDefs?.[bpKey]?.size ?? 0;
        const bpMedia = bpData?.props?.media;
        const bpType = bpData?.props?.type;

        // Breakpoint explicitly requests video
        if (bpType === "video") {
            // Real video at this breakpoint
            if (bpMedia?.source) {
                entries.push({
                    size,
                    media: bpMedia,
                });
                return;
            }

            // Disabled placeholder video at this breakpoint
            if (bpMedia?.isPlaceholder || bpMedia?.source === "#") {
                entries.push({
                    size,
                    media: {
                        id: null,
                        source: "#",
                        type: "video",
                        width: null,
                        height: null,
                        sizes: null,
                        isPlaceholder: true,
                    },
                });
                return;
            }
        }

        // Breakpoint NOT video, but base video exists → explicit disable
        if (isBaseVideo) {
            entries.push({
                size,
                media: {
                    id: null,
                    source: "#",
                    type: "video",
                    width: null,
                    height: null,
                    sizes: null,
                    isPlaceholder: true,
                },
            });
        }
    });

    if (!entries.length) return null;

    // Largest -> smallest (Infinity keeps base last)
    entries.sort((a, b) => b.size - a.size);

    const baseEntry = entries.find((e) => e.size === Infinity);
    const baseObj = baseEntry?.media ?? null;

    const bpEntries = entries.filter((e) => e.size !== Infinity);

    return (
        <video
            muted
            loop
            autoPlay
            playsInline
            className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none"
        >
            {bpEntries.map(({size, media}, i) => {
                const mq =
                    Number.isFinite(size) &&
                    size > 0 &&
                    size !== Infinity
                        ? `(max-width:${size - 1}px)`
                        : null;

                return (
                    <source
                        key={`bp-${i}`}
                        data-src={media.source || "#"}
                        data-media={mq}
                        type="video/mp4"
                    />
                );
            })}

            {baseObj?.source && (
                <source
                    data-src={baseObj.source}
                    type="video/mp4"
                />
            )}
        </video>
    );
};

/**
 * BackgroundMedia
 *
 * Switches by props.type only.
 * - No old image/video props
 * - Unified "media" object only
 */
export const BackgroundMedia = ({
                                    settings = {},
                                    isSave = false,
                                }) => {
    const type = settings?.props?.type;

    switch (type) {
        case "video":
            return <BackgroundVideo settings={settings} isSave={isSave}/>;

        default:
            return null;
    }
};