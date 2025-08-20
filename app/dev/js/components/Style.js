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

export const styleClasses = (selector) => {

    return selector;
}

export function Style({
                          selector,
                          uniqueId,
                          attributes,
                          setAttributes,
                          css = [],
                          props = {},
                          deps = [],
                          preload = []
                      }) {

    if (!attributes) {
        return <></>;
    }

    const dependencyValues = [...deps.map((key) => attributes[key]), attributes?.style, uniqueId, attributes?.['wpbs-layout'], attributes?.['wpbs-background'], attributes?.className];

    const {resultCss, preloadMedia} = useMemo(() => {

        if (!uniqueId) {
            return '';
        }

        const {containers, breakpoints} = WPBS?.settings ?? {};

        const cssSelector = selector ? '.' + selector + '.' + uniqueId : '.' + uniqueId;

        const breakpoint = '%__BREAKPOINT__' + (attributes?.['wpbs-breakpoint']?.large ?? 'normal') + '__%';

        const cssLayout = layoutCss(attributes, cssSelector);
        const cssBackground = backgroundCss(attributes, cssSelector);

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

        desktopProps = cleanObject({
            ...desktopProps,
            ...desktop
        });

        mobileProps = cleanObject({
            ...mobileProps,
            ...mobile
        });

        if (Object.keys(desktopProps).length) {
            propsCss += cssSelector + '{';
            Object.entries(desktopProps).forEach(([prop, value]) => {

                if (!value) {
                    return;
                }
                propsCss += [prop, value].join(':') + ';';
            })

            propsCss += '}';
        }

        if (Object.keys(mobileProps).length) {
            propsCss += '@media(width < ' + breakpoint + '){' + cssSelector + '{';

            Object.entries(mobileProps).forEach(([prop, value]) => {

                if (!value) {
                    return;
                }
                propsCss += [prop, value].join(':') + ';';
            })

            propsCss += '}}';
        }

        if (Object.keys(cleanObject(props)).length) {

            propsCss += cssSelector + '{';
            Object.entries(props).forEach(([prop, value]) => {

                if (!value || prop === 'breakpoints') {
                    return;
                }
                value = getCSSFromStyle(value);

                propsCss += [prop, value].join(':') + ';';
            })

            propsCss += '}';

            if (Object.keys(props?.breakpoints ?? {}).length) {
                Object.entries(cleanObject(props.breakpoints)).forEach(([bp, rules]) => {

                    if (typeof rules !== 'object') {
                        return;
                    }

                    propsCss += '@media(min-width: %__BREAKPOINT__' + bp + '__%){' + cssSelector + '{';

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

        const mergedCss = [cssLayout, cssBackground, propsCss, ...(Array.isArray(css) ? css : [css || ''])].join(' ').trim();

        const preloadMedia = getPreloadMedia([...preload, ...backgroundPreload(attributes)]);

        return {
            resultCss: mergedCss.replace(/%__(BREAKPOINT|CONTAINER)__(.*?)__%/g, (match, type, key) => {
                switch (type) {
                    case 'BREAKPOINT':
                        return breakpoints[key] ?? match;
                    case 'CONTAINER':
                        return containers[key] ?? match;
                    default:
                        return match; // fallback for unknown types
                }
            }),
            preloadMedia: preloadMedia
        };

    }, dependencyValues);

    useEffect(() => {

        const {'wpbs-css': currentCss = ''} = attributes;

        const result = {};

        if (attributes?.uniqueId !== uniqueId) {
            result.uniqueId = uniqueId;
        }

        if (!isEqual(currentCss, resultCss)) {
            result['wpbs-css'] = resultCss;
        }

        if (!isEqual(attributes?.['wpbs-preload'], preloadMedia)) {
            result['wpbs-preload'] = preloadMedia
        }

        if (Object.keys(result).length > 0) {
            setAttributes(result);
        }


    }, [resultCss, preloadMedia, uniqueId]);


    return <style className='wpbs-styles'>{(resultCss || '').replace(/%__BREAKPOINT__(\d+px)__%/, "$1")}</style>;
}

