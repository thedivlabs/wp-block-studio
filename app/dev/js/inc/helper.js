import {useEffect} from 'react';
import {select, useSelect} from '@wordpress/data';


export const imageButtonStyle = {
    border: '1px dashed lightgray',
    width: '100%',
    height: 'auto',
    aspectRatio: '16/9',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
}

export function cleanObject(obj) {
    if (Array.isArray(obj)) {
        return obj
            .map(cleanObject)
            .filter(v => v != null && v !== '' && !(typeof v === 'object' && !Array.isArray(v) && !Object.keys(v).length));
    }

    if (typeof obj === 'object' && obj !== null) {
        return Object.fromEntries(
            Object.entries(obj)
                .map(([k, v]) => [k, cleanObject(v)])
                .filter(([_, v]) =>
                    v != null &&
                    v !== '' &&
                    !(Array.isArray(v) && v.length === 0) &&
                    !(typeof v === 'object' && Object.keys(v).length === 0)
                )
        );
    }

    return obj;
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