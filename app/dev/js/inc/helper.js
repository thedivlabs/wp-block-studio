import _ from "lodash";

export function buildImageSet(url) {
    if (!url) return '';

    const ext = url.endsWith('.png') ? 'image/png' : 'image/jpeg';

    const webp = `url("${url}.webp") type("image/webp")`;
    const fallback = `url("${url}") type("${ext}")`;

    return `image-set(${webp}, ${fallback})`;
}

export function extractMinimalImageMeta(media) {
    if (!media) return null;

    const mime = media.mime || media.mime_type || '';
    const type = media.type || (mime.startsWith('video/') ? 'video' : 'image');
    const source = media.url || '';

    // --- Handle VIDEO ---
    if (type === 'video') {
        return {
            id: media.id,
            type: 'video',
            source,
            width: Number(media.width) || null,
            height: Number(media.height) || null,
            //poster: media.image?.src || null
        };
    }

    // --- Handle SVG IMAGE ---
    const isSVG = mime === 'image/svg+xml';
    if (isSVG) {
        return {
            id: media.id,
            type: 'image',
            source,
            sizes: {}
        };
    }

    // --- Handle RASTER IMAGE ---
    const rawSizes = media.sizes || {};
    const sizes = {};

    Object.entries(rawSizes).forEach(([key, size]) => {
        const width = Number(size.width) || 0;
        const height = Number(size.height) || 0;
        if (width && height) {
            sizes[key] = {width, height};
        }
    });

    return {
        id: media.id,
        type: 'image',
        source,
        sizes
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

