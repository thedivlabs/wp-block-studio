import {useEffect, useRef, useState} from "@wordpress/element";

const BackgroundVideoEditor = ({bpEntries = [], baseObj}) => {
    const allVideos = [
        ...(baseObj?.source ? [{size: Infinity, src: baseObj.source}] : []),
        ...bpEntries.map(o => ({size: o.size, src: o.media.source})),
    ];

    // Sort largest → smallest
    allVideos.sort((a, b) => b.size - a.size);

    const [videoSrc, setVideoSrc] = useState(null);

    useEffect(() => {
        if (!allVideos.length) return;

        // Build matchMedia listeners for real breakpoints (skip Infinity)
        const queries = allVideos
            .filter(v => v.size !== Infinity)
            .map(v => ({
                size: v.size,
                src: v.src,
                mql: window.matchMedia(`(max-width: ${v.size - 1}px)`),
            }));

        const pick = () => {
            // 1. Try to match breakpoints in descending order
            for (let q of queries) {
                if (q.mql.matches) {
                    setVideoSrc(q.src);
                    return;
                }
            }

            // 2. Otherwise fall back to Infinity (base video)
            const base = allVideos.find(v => v.size === Infinity);
            setVideoSrc(base?.src || null);
        };

        // Initial pick
        pick();

        // Attach listeners
        queries.forEach(q => q.mql.addEventListener("change", pick));

        return () => {
            queries.forEach(q => q.mql.removeEventListener("change", pick));
        };
    }, [bpEntries, baseObj]);

    if (!videoSrc) return null;

    return (
        <video
            src={videoSrc}
            muted
            playsInline
            preload="metadata"
            poster={videoSrc}
            className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none opacity-60"
            onLoadedMetadata={(e) => {
                try {
                    e.target.currentTime = 0;
                } catch (_) {
                }
            }}
            onCanPlay={(e) => e.target.pause()}
        />
    );
};

const BackgroundVideo = ({settings = {}, isSave = false}) => {
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
        const bpProps = bpData?.props || {};
        const bpType = bpProps.type;
        const bpMedia = bpProps.media;

        // Breakpoint explicitly requests video
        if (bpType === "video") {
            if (bpMedia?.source) {
                entries.push({size, media: bpMedia});
                return;
            }

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

        // Breakpoint NOT video → disable base video
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

    entries.sort((a, b) => b.size - a.size);

    const baseEntry = entries.find((e) => e.size === Infinity);
    const baseObj = baseEntry?.media ?? null;

    const bpEntries = entries.filter((e) => e.size !== Infinity);

    /* ------------------------------------------------------------
     * EDIT vs SAVE props
     * ------------------------------------------------------------ */

    const videoPropsEdit = {
        muted: true,
        playsInline: true,
        preload: "metadata",
        poster: baseObj?.source || undefined,
        onLoadedMetadata: (e) => {
            try {
                e.target.currentTime = 0;  // freeze on first frame
            } catch (err) {
            }
        },
        onCanPlay: (e) => {
            e.target.pause(); // prevent accidental playback
        },
        className:
            "absolute top-0 left-0 w-full h-full object-cover pointer-events-none opacity-60",
    };

    const videoPropsSave = {
        muted: true,
        loop: true,
        autoPlay: true,
        playsInline: true,
        preload: "auto",
        className:
            "absolute top-0 left-0 w-full h-full z-0 pointer-events-none",
    };

    const videoProps = isSave ? videoPropsSave : videoPropsEdit;

    const srcAttr = isSave ? "data-src" : "data-src";


    console.log(bpEntries);


    if (!isSave) {
        return <BackgroundVideoEditor bpEntries={bpEntries} baseObj={baseObj}/>;
    }


    return (
        <video {...videoProps}>
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
                        {...{[srcAttr]: media.source || "#"}}
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