import _ from "lodash";


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
            poster: media.image?.src || null
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
        return buildFromSize(sizes[resolution]);
    }

    // 2. Fallback: "large"
    if (sizes.large?.width && sizes.large?.height) {
        return buildFromSize(sizes.large);
    }

    // 3. Fallback: "full"
    return source;
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