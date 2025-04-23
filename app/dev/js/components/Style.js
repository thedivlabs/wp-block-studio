import {useSetting} from '@wordpress/block-editor';


import {LayoutAttributes} from './Layout';
import {BackgroundAttributes} from './Background';

import {getCSSValueFromRawStyle} from "@wordpress/style-engine";
import {useEffect} from "react";

function parseSpecial(prop, value) {
    switch (prop) {
        case 'height':
        case 'min-height':
        case 'max-height':
            if (value === 'screen') {
                value = 'calc(100svh - var(--wpbs-header-height, 0px))';
            } else if (value === 'full-screen') {
                value = '100svh';
            }
            break;
    }

    return value;
}

function desktop(attributes) {

    const styleAttributes = Object.fromEntries(Object.entries({
        'row-gap': getCSSValueFromRawStyle(attributes?.style?.spacing?.blockGap?.left ?? null),
        'column-gap': getCSSValueFromRawStyle(attributes?.style?.spacing?.blockGap?.top ?? null),
    }).filter(([key, value]) => value));

    const specialAttributes = Object.fromEntries(
        Object.entries(attributes).filter(([key]) => [
            'wpbs-layout-mask-image',
            'wpbs-layout-mask-size',
            'wpbs-layout-mask-origin',
            'wpbs-layout-container',
            'wpbs-layout-width',
            'wpbs-layout-width-custom',
            'wpbs-layout-height',
            'wpbs-layout-height-custom',
            'wpbs-layout-min-height',
            'wpbs-layout-min-height-custom',
            'wpbs-layout-max-height',
            'wpbs-layout-max-height-custom',
            'wpbs-layout-offset-header',
            'wpbs-layout-translate'
        ].includes(key))
    );

    const layoutAttributes = Object.fromEntries(
        Object.entries(attributes).filter(([k]) =>
            k.startsWith('wpbs-layout') &&
            !Array.isArray(attributes[k]) &&
            !k.includes('mobile') &&
            !k.includes('hover') &&
            ![...Object.keys(specialAttributes), 'wpbs-layout-breakpoint'].includes(k)
        ));

    const styles = {};

    // Filter style attributes
    for (const [prop, value] of Object.entries(styleAttributes)) {
        if (!value) continue;
        styles[prop] = value;
    }

    // Rename layout attribute keys and assign values
    for (const [prop, value] of Object.entries(layoutAttributes)) {
        if (!value) continue;
        const propName = prop.replace('wpbs-layout-', '');
        styles[propName] = value;
    }

    // Handle special attributes
    for (const [prop, value] of Object.entries(specialAttributes)) {
        if (!value) continue;

        switch (prop) {
            case 'wpbs-layout-mask-image':
                const imageUrl = value?.sizes?.full?.url || '#';
                styles['mask-image'] = `url(${imageUrl})`;
                styles['mask-repeat'] = 'no-repeat';
                styles['mask-size'] = (() => {
                    const size = attributes?.['wpbs-layout-mask-size'];
                    switch (size) {
                        case 'cover':
                            return 'cover';
                        case 'horizontal':
                            return '100% auto';
                        case 'vertical':
                            return 'auto 100%';
                        default:
                            return 'contain';
                    }
                })();
                styles['mask-position'] = attributes?.['wpbs-layout-mask-origin'] || 'center center';
                break;

            case 'wpbs-layout-height':
            case 'wpbs-layout-height-custom':
                styles['height'] = parseSpecial('height', attributes?.['wpbs-layout-height-custom'] ?? attributes?.['wpbs-layout-height']);
                break;

            case 'wpbs-layout-min-height':
            case 'wpbs-layout-min-height-custom':
                styles['min-height'] = parseSpecial('min-height', attributes?.['wpbs-layout-min-height-custom'] ?? attributes?.['wpbs-layout-min-height']);
                break;

            case 'wpbs-layout-max-height':
            case 'wpbs-layout-max-height-custom':
                styles['max-height'] = parseSpecial('max-height', attributes?.['wpbs-layout-max-height-custom'] ?? attributes?.['wpbs-layout-max-height']);
                break;

            case 'wpbs-layout-width':
            case 'wpbs-layout-width-custom':
                styles['width'] = attributes?.['wpbs-layout-width-custom'] ?? attributes?.['wpbs-layout-width'] ?? null;
                break;

            case 'wpbs-layout-translate':
                const top = getCSSValueFromRawStyle(attributes?.['wpbs-layout-translate']?.top || '0px');
                const left = getCSSValueFromRawStyle(attributes?.['wpbs-layout-translate']?.left || '0px');
                styles['transform'] = `translate(${top}, ${left})`;
                break;

            case 'wpbs-layout-offset-header':
                const padding = getCSSValueFromRawStyle(attributes?.style?.spacing?.padding?.top || '0px');
                styles['padding-top'] = `calc(${padding} + var(--wpbs-header-height, 0px)) !important`;
                break;
        }
    }

    return styles;

}

function mobile(attributes) {

    const styleAttributes = Object.fromEntries(Object.entries({
        'row-gap': getCSSValueFromRawStyle(attributes['wpbs-layout-gap-mobile']?.left ?? null),
        'column-gap': getCSSValueFromRawStyle(attributes['wpbs-layout-gap-mobile']?.top ?? null),
    }).filter(([key, value]) => value));

    const specialKeys = [
        'wpbs-layout-mask-image-mobile',
        'wpbs-layout-mask-origin-mobile',
        'wpbs-layout-mask-size-mobile',
        'wpbs-layout-width-mobile',
        'wpbs-layout-width-custom-mobile',
        'wpbs-layout-height-mobile',
        'wpbs-layout-height-custom-mobile',
        'wpbs-layout-min-height-mobile',
        'wpbs-layout-min-height-custom-mobile',
        'wpbs-layout-max-height-mobile',
        'wpbs-layout-max-height-custom-mobile',
        'wpbs-layout-translate-mobile',
    ];

    const specialAttributes = Object.fromEntries(
        Object.entries(attributes).filter(([key]) => specialKeys.includes(key))
    );

    const mobileAttributes = Object.fromEntries(
        Object.entries(attributes).filter(([key, value]) =>
            key.startsWith('wpbs-layout') &&
            key.includes('mobile') &&
            typeof value !== 'object' &&
            !key.includes('hover') &&
            ![...Object.keys(specialAttributes), 'wpbs-layout-breakpoint'].includes(key)
        )
    );

    const styles = {};

    for (const [prop, value] of Object.entries(styleAttributes)) {
        if (!value) continue;
        styles[prop] = value;
    }

    for (const [prop, value] of Object.entries(mobileAttributes)) {
        if (!value) continue;

        let propName = prop.replace('wpbs-layout-', '').replace('-mobile', '');

        if (propName === 'text-color') {
            propName = 'color';
        }

        styles[propName] = value;
    }

    for (const [prop, value] of Object.entries(specialAttributes)) {
        if (!value) continue;

        switch (prop) {
            case 'wpbs-layout-mask-image-mobile': {
                const imageUrl = value?.sizes?.full?.url || '#';
                styles['mask-image'] = `url(${imageUrl})`;
                styles['mask-repeat'] = 'no-repeat';
                styles['mask-size'] = (() => {
                    const size = attributes?.['wpbs-layout-mask-size'];
                    switch (size) {
                        case 'cover':
                            return 'cover';
                        case 'horizontal':
                            return '100% auto';
                        case 'vertical':
                            return 'auto 100%';
                        default:
                            return 'contain';
                    }
                })();
                styles['mask-position'] = attributes?.['wpbs-layout-mask-origin'] || 'center center';
                break;
            }
            case 'wpbs-layout-height-mobile':
            case 'wpbs-layout-height-custom-mobile':
                styles['height'] =
                    attributes['wpbs-layout-height-custom-mobile'] ||
                    attributes['wpbs-layout-height-mobile'] ||
                    null;
                break;

            case 'wpbs-layout-min-height-mobile':
            case 'wpbs-layout-min-height-custom-mobile':
                styles['min-height'] =
                    attributes['wpbs-layout-min-height-custom-mobile'] ||
                    attributes['wpbs-layout-min-height-mobile'] ||
                    null;
                break;

            case 'wpbs-layout-max-height-mobile':
            case 'wpbs-layout-max-height-custom-mobile':
                styles['max-height'] =
                    attributes['wpbs-layout-max-height-custom-mobile'] ||
                    attributes['wpbs-layout-max-height-mobile'] ||
                    null;
                break;

            case 'wpbs-layout-width-mobile':
            case 'wpbs-layout-width-custom-mobile':
                styles['width'] =
                    attributes['wpbs-layout-width-custom-mobile'] ||
                    attributes['wpbs-layout-width-mobile'] ||
                    null;
                break;

            case 'wpbs-layout-translate-mobile': {
                const top = getCSSValueFromRawStyle(attributes['wpbs-layout-translate-mobile']?.top ?? '0px');
                const left = getCSSValueFromRawStyle(attributes['wpbs-layout-translate-mobile']?.left ?? '0px');
                styles['transform'] = `translate(${top}, ${left})`;
                break;
            }
        }
    }

    return styles;
}

function hover(attributes) {
    const hoverAttributes = Object.fromEntries(
        Object.entries(attributes).filter(([key, value]) =>
            key.startsWith('wpbs-layout') &&
            key.includes('hover') &&
            typeof value !== 'object' &&
            !key.includes('mobile')
        )
    );

    const styles = {};

    // Process each hover attribute
    for (const [prop, value] of Object.entries(hoverAttributes)) {
        if (!value) continue;

        // Remove the prefix 'wpbs-layout-' and suffix '-hover'
        let propName = prop.replace('wpbs-layout-', '').replace('-hover', '');

        // Handle special cases for property names
        if (propName === 'text-color') {
            propName = 'color';
        }

        // Add the processed property and value to styles
        styles[propName] = value;
    }

    return styles;
}

function props(attributes) {
    const styles = {
        mobile: {},
        desktop: {},
    };

    Object.entries(attributes).forEach(([key, value]) => {
        if (
            key.startsWith('wpbs-prop') &&
            typeof value !== 'object' &&
            value !== ''
        ) {
            const propName = key.replace('wpbs-prop-', '');
            
            if (key.includes('mobile')) {
                const styleKey = `--${propName}`.replace('-mobile', '');
                styles.mobile[styleKey] = value;
            } else {
                const styleKey = `--${propName}`;
                styles.desktop[styleKey] = value;
            }
        }
    });

    return styles;
}

export function Style({attributes, setAttributes, uniqueId, customCss = '', selector = ''}) {

    const breakpoints = useSetting('custom.breakpoints');

    useEffect(() => {
        setAttributes({'wpbs-css': styleCss(attributes, uniqueId, breakpoints, customCss, selector)});
    }, [Object.fromEntries(Object.entries(styleAttributes))]);

    return <style class={'wpbs-styles'}>{attributes['wpbs-css']}</style>;
}

export const styleAttributes = {...BackgroundAttributes, ...LayoutAttributes};
export const styleAttributesFull = {
    ...BackgroundAttributes, ...LayoutAttributes, ...{
        'wpbs-css': {
            type: 'string'
        }
    }
};

export function styleCss(attributes, uniqueId, breakpoints, customCss = '', selector = '') {

    const breakpoint = breakpoints[attributes['wpbs-layout-breakpoint'] || attributes['wpbs-breakpoint'] || 'normal'];

    selector = '.' + [selector, uniqueId].join(' ').trim().split(' ').join('.');

    let css = '';
    let desktopCss = '';
    let desktopProps = '';
    let mobileCss = '';
    let mobileProps = '';
    let hoverCss = '';

    const customProps = props(attributes);

    Object.entries(desktop(attributes)).forEach(([prop, value]) => {
        desktopCss += prop + ':' + value + ';';
    });

    Object.entries(customProps.desktop).forEach(([prop, value]) => {
        desktopProps += prop + ':' + value + ';';
    });

    if (desktopCss.length) {
        css += selector + '{' + [desktopProps, desktopCss].join(' ') + '}';
    }

    Object.entries(mobile(attributes)).forEach(([prop, value]) => {
        mobileCss += prop + ':' + value + ';';
    });

    Object.entries(customProps.mobile).forEach(([prop, value]) => {
        mobileProps += prop + ':' + value + ';';
    });

    if (mobileCss.length || mobileProps.length) {
        css += '@media(width < ' + breakpoint + '){' + selector + '{' + [mobileProps, mobileCss].join(' ') + '}}';
    }

    Object.entries(hover(attributes)).forEach(([prop, value]) => {
        hoverCss += prop + ':' + value + ';';
    });

    if (hoverCss.length) {
        css += selector + ':hover' + '{' + hoverCss + '}';
    }

    return [css, customCss].join(' ');


}