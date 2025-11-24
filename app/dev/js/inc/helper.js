import _ from "lodash";

export function buildImageSet(url) {
    if (!url) return '';

    const ext = url.endsWith('.png') ? 'image/png' : 'image/jpeg';

    const webp = `url("${url}.webp") type("image/webp")`;
    const fallback = `url("${url}") type("${ext}")`;

    return `image-set(${webp}, ${fallback})`;
}

export function normalizeMedia(input) {
    // ------------------------------------------------------------
    // 0. EMPTY INPUT → return fully empty normalized object
    // ------------------------------------------------------------
    if (!input || input === "" || typeof input !== "object") {
        return {
            id: null,
            source: null,
            type: null,
            width: null,
            height: null,
            sizes: null,
            isPlaceholder: false
        };
    }

    // ------------------------------------------------------------
    // 1. PLACEHOLDER INPUT (PreviewThumbnail)
    // ------------------------------------------------------------
    if (input.isPlaceholder === true) {
        return {
            id: null,
            source: "#",        // required for <picture> + CSS hiding logic
            type: null,
            width: null,
            height: null,
            sizes: null,
            isPlaceholder: true
        };
    }

    // ------------------------------------------------------------
    // 2. ALREADY NORMALIZED
    // ------------------------------------------------------------
    // If the shape already matches our unified spec, return as-is.
    const alreadyNormalized =
        "id" in input &&
        "source" in input &&
        "type" in input &&
        "isPlaceholder" in input;

    if (alreadyNormalized) {
        return {
            id: input.id ?? null,
            source: input.source ?? null,
            type: input.type ?? null,
            width: input.width ?? null,
            height: input.height ?? null,
            sizes: input.sizes ?? null,
            isPlaceholder: input.isPlaceholder === true
        };
    }

    // ------------------------------------------------------------
    // 3. WP MEDIA OBJECT → extract minimal unified data
    // ------------------------------------------------------------
    const isImage = input.type?.startsWith("image");
    const isVideo = input.type?.startsWith("video");

    // WordPress attachment full URL
    const fullSrc =
        input?.media_details?.sizes?.full?.source_url ||
        input?.media_details?.sizes?.full?.url ||
        input?.source_url ||
        null;

    // Image sizes map → only width/height
    let sizeMap = null;
    if (isImage && input.media_details?.sizes) {
        sizeMap = {};

        Object.entries(input.media_details.sizes).forEach(([key, val]) => {
            sizeMap[key] = {
                width: val?.width ?? null,
                height: val?.height ?? null
            };
        });
    }

    return {
        id: input.id ?? null,
        source: fullSrc,
        type: isImage ? "image" : isVideo ? "video" : null,
        width: input.media_details?.width ?? null,
        height: input.media_details?.height ?? null,
        sizes: sizeMap,
        isPlaceholder: false
    };
}

export function getImageUrlForResolution(image, resolution = 'large') {

    if (!image?.source) return null;

    const {source, sizes = {}} = image;

    // SVGs or anything without sizes → always return source
    if (!sizes || !Object.keys(sizes).length) {
        return source;
    }

    // Full always returns the real source file
    if (resolution === 'full') {
        return source;
    }

    // Utility: build resized URL from existing size
    const buildFromSize = (sizeObj) => {
        const match = source.match(/^(.*\/)([^\/]+)\.([a-z0-9]+)$/i);
        if (!match) return source;
        const [, base, name, ext] = match;
        return `${base}${name}-${sizeObj.width}x${sizeObj.height}.${ext}`;
    };

    // 1. Exact match
    if (sizes[resolution]?.width && sizes[resolution]?.height) {
        //console.log('exact match', buildFromSize(sizes[resolution]));
        return buildFromSize(sizes[resolution]);
    }

    // 2. Fallback: "large"
    if (sizes.large?.width && sizes.large?.height) {
        //console.log('fallback large', buildFromSize(sizes.large))
        return buildFromSize(sizes.large);
    }

    //console.log('fallback full', source)
    // 3. Fallback: "full"
    return source;
}

export function diffObjects(base = {}, bp = {}) {
    const out = {};

    Object.keys(bp).forEach((key) => {
        const bpVal = bp[key];
        const baseVal = base[key];

        if (!_.isEqual(bpVal, baseVal)) {
            out[key] = bpVal;
        }
    });

    return out;
}

export function cleanObject(obj, strict = false) {
    return _.transform(obj, (result, value, key) => {
        if (_.isPlainObject(value)) {
            const cleaned = cleanObject(value, strict);
            if (!_.isEmpty(cleaned)) {
                result[key] = cleaned;
            }
        } else if (Array.isArray(value)) {
            const cleanedArray = value
                .map((v) => (_.isPlainObject(v) ? cleanObject(v, strict) : v))
                .filter((v) => v !== undefined && v !== null && (!strict || (v !== '' && !(typeof v === 'string' && v.trim() === ''))));

            if (cleanedArray.length > 0) {
                result[key] = cleanedArray;
            }
        } else if (value !== undefined && value !== null) {
            if (strict && typeof value === 'string' && value.trim() === '') {
                // skip empty strings in strict mode
                return;
            }
            result[key] = value;
        }
    }, {});
}

export function extractPreloadsFromLayout(bgData = {}, uniqueId) {
    const result = [];

    if (!uniqueId) return result;

    // NEW: bgData comes directly from wpbs-background
    const base = bgData?.props || {};
    const bps = bgData?.breakpoints || {};

    const isEager = base?.eager === true;

    if (!isEager) {
        return result; // background not eager → nothing to preload
    }

    // ----------------------------------------
    // BASE BACKGROUND
    // ----------------------------------------
    if (base.type === "image" && base.image?.id) {
        result.push({
            group: uniqueId,
            id: base.image.id,
            type: "image",
            resolution: base.resolution || null
        });
    }

    if (base.type === "video" && base.video?.id) {
        result.push({
            group: uniqueId,
            id: base.video.id,
            type: "video"
        });
    }

    // ----------------------------------------
    // BREAKPOINT BACKGROUNDS
    // ----------------------------------------
    for (const [bpKey, bpEntry] of Object.entries(bps)) {
        const bpProps = bpEntry?.props || {};
        if (!bpProps.type) continue;

        // Breakpoints inherit eagerness from base
        if (bpProps.type === "image" && bpProps.image?.id) {
            result.push({
                group: uniqueId,
                id: bpProps.image.id,
                type: "image",
                resolution: bpProps.resolution || null,
                media: bpKey
            });
        }

        if (bpProps.type === "video" && bpProps.video?.id) {
            result.push({
                group: uniqueId,
                id: bpProps.video.id,
                type: "video",
                media: bpKey
            });
        }
    }

    return result;
}

export function normalizePreloadItem(item) {
    if (!item || !item.id) return null;

    const out = {
        id: item.id,
        type: item.type || "image",
    };

    if (item.group) out.group = item.group;
    if (item.media) out.media = item.media;
    if (item.resolution) out.resolution = item.resolution;

    return out;
}

export function getCSSFromStyle(raw, presetKeyword = '') {
    if (raw == null) return '';

    if (typeof raw === 'object' && !Array.isArray(raw)) {
        return Object.entries(raw)
            .map(([k, v]) => `${k}: ${getCSSFromStyle(v, presetKeyword)};`)
            .join(' ');
    }

    if (Array.isArray(raw)) {
        return raw.map(v => getCSSFromStyle(v, presetKeyword)).join(', ');
    }

    if (typeof raw !== 'string') return raw;

    if (raw.startsWith('var:')) {
        const [source, type, name] = raw.slice(4).split('|');
        if (source && type && name) {
            return `var(--wp--${source}--${type}--${name})`;
        }
        return raw;
    }

    if (raw.startsWith('--wp--')) {
        return `var(${raw})`;
    }

    if (presetKeyword) {
        return `var(--wp--preset--${presetKeyword}--${raw})`;
    }

    return raw;
}

export const heightVal = (val) => {
    let height = val;
    if (val === 'screen') height = 'calc(100svh - var(--wpbs-header-height, 0px))';
    if (val === 'full-screen') height = '100svh';
    if (['auto', 'full', 'inherit'].includes(val)) height = val;
    return height;
};

export function normalizeGapVal(v) {
    if (!v) return null;

    // WP BoxControl / UnitControl sometimes gives objects
    if (typeof v === "object") {
        if (typeof v.value === "string") return v.value;
        if (typeof v.top === "string") return v.top;
        if (typeof v.left === "string") return v.left;
        if (typeof v.raw === "string") return v.raw;
    }

    return v; // already a string
}

