import _, {merge} from "lodash";

export function resolveFeaturedMedia({type, media, resolution, isEditor}) {
    const res = (resolution || "large").toUpperCase();

    const normalized = normalizeMedia(media);
    const fallbackUrl = normalized?.source
        ? getImageUrlForResolution(normalized, res)
        : null;

    // Editor → always show fallback real media
    if (isEditor) {
        return normalized;
    }

    // Save mode: featured-image → return token
    if (type === "featured-image" || type === "featured-image-mobile") {

        const payload = {
            mode: type,
            resolution: res,
            fallback: fallbackUrl || null,
        };

        const b64 = btoa(JSON.stringify(payload));

        return {
            id: null,
            type: "image",
            source: `%%__FEATURED_IMAGE__${b64}__%%`,
        };
    }

    // Normal image / video
    return normalized;
}

export const mergeEntry = (entry, patch, reset = false) => {
    const base = reset ? {} : (entry || {});
    return merge({}, base, patch || {});
};

export function normalizeBreakpoints(style = {}) {
    if (!style.breakpoints) return style;

    const out = {...style, breakpoints: {...style.breakpoints}};

    for (const key in out.breakpoints) {
        const entry = out.breakpoints[key];

        if (entry === null) {
            delete out.breakpoints[key];
            continue;
        }

        // Normalize existing breakpoint
        out.breakpoints[key] = {
            props: entry.props || {},
            hover: entry.hover || {},
            background: entry.background || {},
        };
    }

    return out;
}

export function buildImageSet(url) {
    if (!url) return '';

    const ext = url.endsWith('.png') ? 'image/png' : 'image/jpeg';

    const webp = `url("${url}.webp") type("image/webp")`;
    const fallback = `url("${url}") type("${ext}")`;

    return `image-set(${webp}, ${fallback})`;
}

export function normalizeMedia(input) {
    // 1. empty / invalid
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

    // 2. placeholder (PreviewThumbnail)
    if (input.isPlaceholder === true || input.source === "#") {
        return {
            id: null,
            source: "#",
            type: null,
            width: null,
            height: null,
            sizes: null,
            isPlaceholder: true
        };
    }

    // 3. already normalized
    const already =
        "source" in input &&
        "type" in input &&
        "sizes" in input &&
        "isPlaceholder" in input;

    if (already) {
        return {
            id: input.id ?? null,
            source: input.source ?? null,
            type: input.type ?? null,
            width: input.width ?? null,
            height: input.height ?? null,
            sizes: input.sizes ?? null,
            isPlaceholder: !!input.isPlaceholder
        };
    }

    // 4. WP MediaUpload object (THIS is what you showed me)
    const {
        id = null,
        url = null,
        mime = null,
        type = null,
        width = null,
        height = null,
        sizes = null
    } = input;

    // resolve "image", "video"
    const resolvedType =
        mime?.startsWith("video") || type === "video"
            ? "video"
            : "image";

    // build wordPress size map
    const sizeMap = {};
    if (sizes && typeof sizes === "object") {
        Object.entries(sizes).forEach(([key, val]) => {
            sizeMap[key] = {
                width: val?.width ?? null,
                height: val?.height ?? null
            };
        });
    }

    return {
        id,
        source: url,             // <-- THE REAL SOURCE
        type: resolvedType,
        width: width ?? null,
        height: height ?? null,
        sizes: Object.keys(sizeMap).length ? sizeMap : null,
        isPlaceholder: false
    };
}

export function getImageUrlForResolution(image, resolution = 'large') {

    if (!image?.source) return null;

    const source = image.source;
    const isSvg = source.toLowerCase().endsWith('.svg');

    if (isSvg) {
        return source;
    }

    const sizes = image.sizes || {};

    if (!sizes || !Object.keys(sizes).length) {
        return source;
    }

    if (resolution === 'full') {
        return source;
    }

    const buildFromSize = (sizeObj) => {
        const match = source.match(/^(.*\/)([^\/]+)\.([a-z0-9]+)$/i);
        if (!match) return source;
        const [, base, name, ext] = match;
        return `${base}${name}-${sizeObj.width}x${sizeObj.height}.${ext}`;
    };

    if (sizes[resolution]?.width && sizes[resolution]?.height) {
        return buildFromSize(sizes[resolution]);
    }

    if (sizes.large?.width && sizes.large?.height) {
        return buildFromSize(sizes.large);
    }

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
                return;
            }
            result[key] = value;
        }
    }, {});
}

export function extractPreloadsFromLayout(bgData = {}, uniqueId) {
    const result = [];

    if (!uniqueId) return result;

    const base = bgData?.props || {};
    const bps = bgData?.breakpoints || {};

    const isEager = base?.eager === true;
    if (!isEager) {
        return result;
    }

    const baseMedia =
        base.media || base.image || base.video || null;

    if (baseMedia && !baseMedia.isPlaceholder && baseMedia.id) {
        if (base.type === "video" || baseMedia.type === "video") {
            result.push({
                group: uniqueId,
                id: baseMedia.id,
                type: "video",
            });
        } else if (
            base.type === "image" ||
            base.type === "featured-image" ||
            baseMedia.type === "image"
        ) {
            result.push({
                group: uniqueId,
                id: baseMedia.id,
                type: "image",
                resolution: base.resolution || null,
            });
        }
    }

    for (const [bpKey, bpEntry] of Object.entries(bps)) {
        const bpProps = bpEntry?.props || {};
        const bpMedia =
            bpProps.media || bpProps.image || bpProps.video || null;

        if (!bpMedia || bpMedia.isPlaceholder || !bpMedia.id) continue;

        if (bpProps.type === "video" || bpMedia.type === "video") {
            result.push({
                group: uniqueId,
                id: bpMedia.id,
                type: "video",
                media: bpKey,
            });
        } else if (
            bpProps.type === "image" ||
            bpProps.type === "featured-image" ||
            bpMedia.type === "image"
        ) {
            result.push({
                group: uniqueId,
                id: bpMedia.id,
                type: "image",
                resolution: bpProps.resolution || base.resolution || null,
                media: bpKey,
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

    if (typeof v === "object") {
        if (typeof v.value === "string") return v.value;
        if (typeof v.top === "string") return v.top;
        if (typeof v.left === "string") return v.left;
        if (typeof v.raw === "string") return v.raw;
    }

    return v;
}