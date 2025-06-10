import {useEffect, useMemo} from "react";
import {backgroundPreload} from "Components/Background.js";

export const STYLE_ATTRIBUTES = {
    'wpbs-css': {
        type: 'string'
    },
    'wpbs-preload': {
        type: 'object',
        default: {}
    }
};

export function getCSSFromStyle(raw) {

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

    return raw;
}

function getPreloadMedia(preloads) {

    let result = {};

    preloads.forEach((preloadItem) => {

        const {media, resolution = 'large', breakpoint = 'normal', mobile} = preloadItem;

        if (media?.id) {
            result[id] = {
                resolution: resolution,
                breakpoint: breakpoint,
                mobile: !!mobile
            }
        }
    })

    return result;

}

export function Style({
                          attributes,
                          setAttributes,
                          css = [],
                          props = {},
                          deps = [],
                          preload = []
                      }) {

    const dependencyValues = [...deps.map((key) => attributes[key]), attributes?.style, attributes.uniqueId, preload];
    const {containers, breakpoints} = WPBS?.settings ?? {};

    const uniqueId = attributes?.uniqueId ?? '';
    const selector = '.' + uniqueId.trim().split(' ').join('.');
    const breakpoint = '%__BREAKPOINT__' + (attributes['wpbs-layout']?.breakpoint ?? 'normal') + '__%';

    const result = useMemo(() => {

        let desktopProps = {};
        let mobileProps = {};

        let propsCss = '';

        const rowGap = (() => {
            const val = getCSSFromStyle(attributes?.style?.spacing?.blockGap?.top ?? null);
            return val === 0 || val === '0' ? '0px' : val;
        })();

        const colGap = (() => {
            const val = getCSSFromStyle(attributes?.style?.spacing?.blockGap?.left ?? null);
            return val === 0 || val === '0' ? '0px' : val;
        })();

        const rowGapMobile = (() => {
            const val = getCSSFromStyle(attributes?.['wpbs-layout']?.['gap-mobile']?.top ?? null);
            return val === 0 || val === '0' ? '0px' : val;
        })();

        const colGapMobile = (() => {
            const val = getCSSFromStyle(attributes?.['wpbs-layout']?.['gap-mobile']?.left ?? null);
            return val === 0 || val === '0' ? '0px' : val;
        })();

        const desktop = Object.fromEntries(Object.entries({
            'row-gap': rowGap,
            'column-gap': colGap,
            '--row-gap': rowGap,
            '--column-gap': colGap,
        }).filter(([k, v]) => !!v));

        const mobile = Object.fromEntries(Object.entries({
            'row-gap': rowGapMobile,
            'column-gap': colGapMobile,
            '--row-gap': rowGapMobile,
            '--column-gap': colGapMobile,
        }).filter(([k, v]) => !!v));

        desktopProps = {
            ...desktopProps,
            ...desktop
        };

        mobileProps = {
            ...mobileProps,
            ...mobile
        }

        if (Object.keys(desktopProps).length) {
            propsCss += selector + '{';
            Object.entries(desktopProps).forEach(([prop, value]) => {

                if (!value) {
                    return;
                }

                propsCss += [prop, value].join(':') + ';';
            })

            propsCss += '}';
        }

        if (Object.keys(mobileProps).length) {
            propsCss += '@media(width < ' + breakpoint + '){' + selector + '{';

            Object.entries(mobileProps).forEach(([prop, value]) => {

                if (!value) {
                    return;
                }

                propsCss += [prop, value].join(':') + ';';
            })

            propsCss += '}}';
        }

        if (Object.keys(props).length) {

            propsCss += selector + '{';
            Object.entries(props).forEach(([prop, value]) => {

                if (!value || prop === 'breakpoints') {
                    return;
                }

                value = getCSSFromStyle(value);

                propsCss += [prop, value].join(':') + ';';
            })

            propsCss += '}';

            if (Object.keys(props?.breakpoints ?? {}).length) {
                Object.entries(props.breakpoints).forEach(([bp, rules]) => {

                    if (typeof rules !== 'object') {
                        return;
                    }

                    propsCss += '@media(min-width: %__BREAKPOINT__' + bp + '__%){' + selector + '{';

                    Object.entries(rules).forEach(([prop, value]) => {

                        if (!value) {
                            return;
                        }

                        value = getCSSFromStyle(value);

                        propsCss += [prop, value].join(':') + ';';
                    })

                    propsCss += '}}';
                })
            }
        }

        const mergedCss = Array.isArray(css)
            ? [propsCss, ...css].join(' ').trim()
            : [propsCss, css].join(' ').trim();

        return mergedCss.replace(/%__(BREAKPOINT|CONTAINER)__(.*?)__%/g, (match, type, key) => {
            switch (type) {
                case 'BREAKPOINT':
                    return breakpoints[key] ?? match;
                case 'CONTAINER':
                    return containers[key] ?? match;
                default:
                    return match; // fallback for unknown types
            }
        });

    }, dependencyValues);

    const preloadMedia = useMemo(() => [...getPreloadMedia(preload), ...backgroundPreload(attributes['wpbs-background'])], [preload, attributes['wpbs-background']]);

    useEffect(() => {
        if (attributes['wpbs-css'] !== result) {
            setAttributes({
                'wpbs-css': result,
                'wpbs-preload': preloadMedia
            });
        }
    }, [result, preloadMedia]);


    return <style className='wpbs-styles'>{result}</style>;
}

