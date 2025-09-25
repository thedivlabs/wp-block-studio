import {useEffect, useMemo} from "react";
import {backgroundCss, backgroundPreload} from "Components/Background.js";
import {layoutCss} from "Components/Layout.js";
import {isEqual} from "lodash";
import {cleanObject} from "Includes/helper";

export const STYLE_ATTRIBUTES = {
    'wpbs-css': {
        type: 'string'
    },
    'wpbs-preload': {
        type: 'object',
        default: {}
    }
};

export function getCSSFromStyle(raw, presetKeyword = '') {

    if (typeof raw !== 'string') return raw;

    if (raw.startsWith('var:')) {
        const [source, type, name] = raw.slice(4).split('|');
        if (source && type && name) {
            return `var(--wp--${source}--${type}--${name})`;
        }
    }

    if (raw.startsWith('--wp--')) {
        return `var(${raw})`;
    }

    if (presetKeyword === 'color') {
        return `var(--wp--preset--${presetKeyword}--${raw})`;
    }

    return raw;
}

function getPreloadMedia(preloads) {

    let result = {};

    preloads.forEach((preloadItem) => {

        const {media, resolution = 'large', breakpoint = 'normal', mobile} = preloadItem;

        if (media.id) {
            result[media.id] = {
                id: media?.id,
                resolution: resolution,
                breakpoint: breakpoint,
                mobile: !!mobile
            }
        }
    })

    return result;

}

export const styleClassnames = (attributes = {}) => {

    const result = Object.entries(attributes)
        .filter(([key]) => key.startsWith('wpbs'))
        .flatMap(([_, value]) => value?.classNames ?? []);

    return result.filter(Boolean).join(' ').trim();
};

export function Style({
                          selector,
                          uniqueId,
                          attributes,
                          props = {},
                          deps = [],
                          preload = []
                      }) {

    if (!attributes || !uniqueId) {
        return <></>;
    }

    const dependencyValues = [...deps.map((key) => attributes[key]), attributes?.style, uniqueId, attributes?.['wpbs-layout'], attributes?.['wpbs-background']];

    const cssString = useMemo(() => {

        const {'wpbs-layout': settings = {}} = attributes;

        if (!settings) {
            return '';
        }

        let css = ''; // ✅ initialize css
        const baseSelector = `.${uniqueId}`;

        // ✅ Helper to safely stringify CSS props
        const propsToCss = (props = {}) =>
            Object.entries(props)
                .filter(([_, val]) =>
                    val !== undefined && val !== null && typeof val !== 'object'
                )
                .map(([key, val]) => `${key}: ${val};`)
                .join(' ');

        // 1. Default layout
        const defaultProps = {
            ...settings.props,
            ...settings.special?.props,
        };
        if (Object.keys(defaultProps).length) {
            css += `${baseSelector} { ${propsToCss(defaultProps)} }`;
        }

        // 2. Breakpoints
        if (settings.breakpoints) {
            Object.entries(settings.breakpoints).forEach(([bpKey, bpProps]) => {
                const bp = WPBS?.settings?.breakpoints?.[bpKey];
                if (!bp || !bpProps || Object.keys(bpProps).length === 0) return;

                const combinedProps = {
                    ...bpProps,
                    ...settings.special?.breakpoints?.[bpKey],
                };

                if (Object.keys(combinedProps).length) {
                    css += `@media (max-width: ${bp.size - 1}px) { ${baseSelector} { ${propsToCss(combinedProps)} } }`;
                }
            });
        }

        // 3. Hover
        const hoverProps = {
            ...settings.hover,
            ...settings.special?.hover,
        };
        if (Object.keys(hoverProps).length) {
            css += `${baseSelector}:hover { ${propsToCss(hoverProps)} }`;
        }

        return css;
    }, [dependencyValues]);

    if (!cssString) return null;

    return <style>{cssString}</style>;

}