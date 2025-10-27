import _ from "lodash";
import {useCallback} from "@wordpress/element";

export function cleanObject(obj) {
    return _.transform(obj, (result, value, key) => {
        if (_.isPlainObject(value)) {
            const cleaned = cleanObject(value);
            if (!_.isEmpty(cleaned)) {
                result[key] = cleaned;
            }
        } else if (!_.isNil(value) && value !== '') {
            result[key] = value;
        }
    }, {});
}

export function propsToCss(props = {}, important = false, importantKeysCustom = []) {
    const importantProps = [
        'padding', 'margin', 'gap',
        'width', 'min-width', 'max-width', 'height', 'min-height', 'max-height',
        'color', 'background-color', 'border-color',
        'font-size', 'line-height', 'letter-spacing',
        'border-width', 'border-radius',
        'opacity', 'box-shadow', 'filter',
        ...importantKeysCustom
    ];

    return Object.entries(props)
        .filter(([_, v]) => v !== null && v !== '') // move filter before map
        .map(([k, v]) => {
            const needsImportant = important && importantProps.some(sub => k.includes(sub));
            return `${k}: ${v}${needsImportant ? ' !important' : ''};`;
        })
        .join(' ');
}

export function getCSSFromStyle(raw, presetKeyword = '') {
    if (raw == null) return '';

    // Handle objects (padding, margin, etc.)
    if (typeof raw === 'object' && !Array.isArray(raw)) {
        return Object.entries(raw)
            .map(([k, v]) => `${k}: ${getCSSFromStyle(v, presetKeyword)};`)
            .join(' ');
    }

    // Handle arrays (e.g., font-family, fallbacks)
    if (Array.isArray(raw)) {
        return raw.map(v => getCSSFromStyle(v, presetKeyword)).join(', ');
    }

    if (typeof raw !== 'string') return raw;

    // Handle custom variable format
    if (raw.startsWith('var:')) {
        const [source, type, name] = raw.slice(4).split('|');
        if (source && type && name) {
            return `var(--wp--${source}--${type}--${name})`;
        }
        return raw; // fallback if malformed
    }

    // Handle CSS variable directly
    if (raw.startsWith('--wp--')) {
        return `var(${raw})`;
    }

    // Handle presets (color, font-size, spacing, etc.)
    if (presetKeyword) {
        return `var(--wp--preset--${presetKeyword}--${raw})`;
    }

    return raw;
}

export function updateSettings(newValue = {}, attributes, setAttributes) {
    if (!newValue || typeof newValue !== 'object') return;

    const updates = {};

    for (const [attrName, val] of Object.entries(newValue)) {
        const prev = attributes?.[attrName] ?? {};
        const next = {...prev, ...val};

        if (!_.isEqual(prev, next)) {
            updates[attrName] = next;
        }
    }

    if (Object.keys(updates).length > 0) {
        setAttributes(updates);
    }
}
