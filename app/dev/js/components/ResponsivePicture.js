// ResponsivePicture.js — Fully Dynamic Multi-Breakpoint Version
// Uses your helper fn getImageUrlForResolution ( [oai_citation:2‡helper.js](sediment://file_000000009b8c71fdb41fda13dcc2f65d))

import { getImageUrlForResolution } from "Includes/helper";
import {Fragment} from "@wordpress/element";

export default function ResponsivePicture({
                                              settings = {},
                                              editor = false,
                                          }) {
    const base = settings.props || {};
    const bps = settings.breakpoints || {};
    const bpDefs = WPBS?.settings?.breakpoints || {};

    const eager = !!base.eager;
    const srcAttr = eager || editor ? "src" : "data-src";
    const srcsetAttr = eager || editor ? "srcset" : "data-srcset";

    const cls = ["wpbs-picture", base.className].filter(Boolean).join(" ");
    const style = base.style || {};

    // ------------------------------------------------------------
    // Utility: normalize any media object into a usable {source,id,...}
    // ------------------------------------------------------------
    const normalizeImg = (input) => {
        if (!input || typeof input !== "object") return null;

        if (input.isPlaceholder) {
            return { ...input, source: "#" };
        }

        if (input.source) return input;

        return null;
    };

    // ------------------------------------------------------------
    // Build ordered breakpoint entries
    // ------------------------------------------------------------
    let entries = [];

    // --- Base first (largest fallback) ---
    const baseImage = normalizeImg(base.image || base.media);
    const baseResolution = base.resolution || "large";

    if (baseImage) {
        entries.push({
            size: Infinity,      // fallback default
            image: baseImage,
            resolution: baseResolution,
        });
    }

    // --- Breakpoint entries (xs, sm, md...) ---
    Object.entries(bps).forEach(([bpKey, bpData]) => {
        const props = bpData?.props || {};
        const img = normalizeImg(props.image || props.media);
        const resolution = props.resolution || baseResolution;

        const size = bpDefs?.[bpKey]?.size ?? null;

        entries.push({
            size,
            image: img,
            resolution,
            bpKey,
        });
    });

    // ------------------------------------------------------------
    // Clean entries: if no image in bp, disable it with placeholder
    // (Same logic as background video implementation)
    // ------------------------------------------------------------
    entries = entries.map((e) => {
        if (e.image) return e;

        return {
            ...e,
            image: {
                id: null,
                source: "#",
                type: "image",
                width: null,
                height: null,
                sizes: null,
                isPlaceholder: true,
            },
        };
    });

    // ------------------------------------------------------------
    // Sort breakpoints: smallest → largest, base last
    // ------------------------------------------------------------
    const bpEntries = entries
        .filter((e) => Number.isFinite(e.size))
        .sort((a, b) => a.size - b.size);

    const baseEntry = entries.find((e) => e.size === Infinity);

    // ------------------------------------------------------------
    // Resolve URL for each entry using resolution map
    // ------------------------------------------------------------
    const resolveUrl = (entry) => {
        const img = entry.image;
        if (img.isPlaceholder) return "#";
        return getImageUrlForResolution(img, entry.resolution) || img.source;
    };

    // ------------------------------------------------------------
    // WebP helper
    // ------------------------------------------------------------
    const makeWebp = (url) =>
        url && !url.endsWith(".svg") && url !== "#"
            ? `${url}.webp`
            : null;

    // ------------------------------------------------------------
    // Render <picture>
    // ------------------------------------------------------------
    return (
        <picture className={cls} style={{ ...style, objectFit: "inherit" }}>
            {/* --- Breakpoint <source> tags (xs, sm, md…) --- */}
            {bpEntries.map((entry, i) => {
                const url = resolveUrl(entry);
                const webp = makeWebp(url);

                const mq =
                    Number.isFinite(entry.size) && entry.size > 0
                        ? `(max-width:${entry.size - 1}px)`
                        : null;

                if (!mq) return null;

                return (
                    <Fragment key={`bp-${i}`}>
                        {webp && (
                            <source
                                media={mq}
                                type="image/webp"
                                {...{ [srcsetAttr]: webp }}
                            />
                        )}
                        <source media={mq} {...{ [srcsetAttr]: url }} />
                    </Fragment>
                );
            })}

            {/* --- Base fallback (min-width last) --- */}
            {baseEntry && (() => {
                const url = resolveUrl(baseEntry);
                const webp = makeWebp(url);

                return (
                    <>
                        {webp && (
                            <source
                                type="image/webp"
                                {...{ [srcsetAttr]: webp }}
                            />
                        )}

                        <source {...{ [srcsetAttr]: url }} />
                    </>
                );
            })()}

            {/* --- <img> ultimate fallback --- */}
            {baseEntry && (
                <img
                    {...{
                        [srcAttr]: resolveUrl(baseEntry),
                        alt: base?.alt || "",
                        loading: eager ? "eager" : "lazy",
                        ariaHidden: true,
                    }}
                />
            )}
        </picture>
    );
}