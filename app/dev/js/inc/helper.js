export function extractMinimalImageMeta(media) {
    if (!media) return null;

    const source =
        media.source_url ||
        media.guid?.rendered ||
        media.guid?.raw ||
        '';

    // SVG: keep it ultra-minimal
    if (media.mime_type === 'image/svg+xml') {
        return {
            id: media.id,
            source,
            sizes: {},
        };
    }

    const wpSizes = media.media_details?.sizes || {};
    const sizes = {};

    Object.entries(wpSizes).forEach(([key, size]) => {
        if (!size) return;

        const width = Number(size.width) || 0;
        const height = Number(size.height) || 0;
        if (!width || !height) return;

        sizes[key] = {width, height};
    });

    return {
        id: media.id,
        source,
        sizes,
    };
}


export function getImageUrlForResolution(image, resolution = 'large') {
    if (!image?.source) return null;

    const {source, sizes = {}} = image;

    // If no sizes (e.g. SVG), just use the source
    if (!sizes || !Object.keys(sizes).length) {
        return source;
    }

    const match = source.match(/^(.*\/)([^\/]+)\.([a-z0-9]+)$/i);
    if (!match) return source;

    const [, base, name, ext] = match;

    const pickSize = () => {
        const direct = sizes[resolution];
        if (direct?.width && direct?.height) return direct;

        // fallback: smallest non-thumbnail
        const candidates = Object.entries(sizes)
            .filter(([key, s]) => key !== 'thumbnail' && s?.width && s?.height)
            .map(([key, s]) => s)
            .sort((a, b) => a.width - b.width);

        return candidates[0] || null;
    };

    const chosen = pickSize();
    if (!chosen) return source;

    const {width, height} = chosen;
    return `${base}${name}-${width}x${height}.${ext}`;
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