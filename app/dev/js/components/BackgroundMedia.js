import { memo } from "@wordpress/element";

const BackgroundVideo = ({ settings = {}, isSave = false }) => {
    if (!isSave) return null;

    const { props = {}, breakpoints = {} } = settings || {};
    const bpDefs = WPBS?.settings?.breakpoints ?? {};
    const entries = [];

    const baseMedia = props?.media;
    const hasRealBase =
        baseMedia?.type === "video" && baseMedia?.source;

    if (hasRealBase) {
        entries.push({
            size: Infinity,
            media: baseMedia,
        });
    }

    Object.entries(breakpoints || {}).forEach(([bpKey, bpData]) => {
        const size = bpDefs?.[bpKey]?.size ?? 0;
        const bpMedia = bpData?.props?.media;

        if (bpMedia && bpMedia.type === "video") {
            if (bpMedia.source) {
                entries.push({ size, media: bpMedia });
            } else if (bpMedia.isPlaceholder && hasRealBase) {
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
            return;
        }

        if (hasRealBase) {
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

    return (
        <video
            muted
            loop
            autoPlay
            playsInline
            className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none"
        >
            {bpEntries.map(({ size, media }, i) => {
                const mq =
                    Number.isFinite(size) && size > 0 && size !== Infinity
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

export const BackgroundMedia = memo(function BackgroundMedia({
                                                                 settings = {},
                                                                 isSave = false,
                                                             }) {
    const type = settings?.props?.type;

    switch (type) {
        case "video":
            return <BackgroundVideo settings={settings} isSave={isSave} />;

        default:
            return null;
    }
});