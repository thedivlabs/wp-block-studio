import {useEffect} from "react";

function getCSSFromStyle(raw) {
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
        'row-gap': getCSSFromStyle(attributes?.style?.spacing?.blockGap?.left ?? null),
        'column-gap': getCSSFromStyle(attributes?.style?.spacing?.blockGap?.top ?? null),
    }).filter(([key, value]) => value));

    const specialAttributes = Object.fromEntries(
        Object.entries(attributes['wpbs-layout']).filter(([key]) => [
            'mask-image',
            'mask-size',
            'mask-origin',
            'container',
            'width',
            'width-custom',
            'height',
            'height-custom',
            'min-height',
            'min-height-custom',
            'max-height',
            'max-height-custom',
            'offset-header',
            'translate'
        ].includes(key))
    );

    const layoutAttributes = Object.fromEntries(
        Object.entries(attributes['wpbs-layout']).filter(([k]) =>
            !Array.isArray(attributes['wpbs-layout'][k]) &&
            !k.includes('mobile') &&
            !k.includes('hover') &&
            ![...Object.keys(specialAttributes), 'breakpoint'].includes(k)
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
        const propName = prop.replace('', '');
        styles[propName] = value;
    }

    // Handle special attributes
    for (const [prop, value] of Object.entries(specialAttributes)) {
        if (!value) continue;

        switch (prop) {
            case 'mask-image':
                const imageUrl = value?.sizes?.full?.url || '#';
                styles['mask-image'] = `url(${imageUrl})`;
                styles['mask-repeat'] = 'no-repeat';
                styles['mask-size'] = (() => {
                    const size = attributes?.['mask-size'];
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
                styles['mask-position'] = attributes?.['mask-origin'] || 'center center';
                break;

            case 'height':
            case 'height-custom':
                styles['height'] = parseSpecial('height', attributes?.['height-custom'] ?? attributes?.['height']);
                break;

            case 'min-height':
            case 'min-height-custom':
                styles['min-height'] = parseSpecial('min-height', attributes?.['min-height-custom'] ?? attributes?.['min-height']);
                break;

            case 'max-height':
            case 'max-height-custom':
                styles['max-height'] = parseSpecial('max-height', attributes?.['max-height-custom'] ?? attributes?.['max-height']);
                break;

            case 'width':
            case 'width-custom':
                styles['width'] = attributes?.['width-custom'] ?? attributes?.['width'] ?? null;
                break;

            case 'translate':
                const top = getCSSFromStyle(attributes?.['translate']?.top || '0px');
                const left = getCSSFromStyle(attributes?.['translate']?.left || '0px');
                styles['transform'] = `translate(${top}, ${left})`;
                break;

            case 'offset-header':
                const padding = getCSSFromStyle(attributes?.style?.spacing?.padding?.top || '0px');
                styles['padding-top'] = `calc(${padding} + var(--wpbs-header-height, 0px)) !important`;
                break;
        }
    }

    return styles;

}

function mobile(attributes) {

    const styleAttributes = Object.fromEntries(Object.entries({
        'row-gap': getCSSFromStyle(attributes['gap-mobile']?.left ?? null),
        'column-gap': getCSSFromStyle(attributes['gap-mobile']?.top ?? null),
    }).filter(([key, value]) => value));

    const specialKeys = [
        'mask-image-mobile',
        'mask-origin-mobile',
        'mask-size-mobile',
        'width-mobile',
        'width-custom-mobile',
        'height-mobile',
        'height-custom-mobile',
        'min-height-mobile',
        'min-height-custom-mobile',
        'max-height-mobile',
        'max-height-custom-mobile',
        'translate-mobile',
    ];

    const specialAttributes = Object.fromEntries(
        Object.entries(attributes['wpbs-layout']).filter(([key]) => specialKeys.includes(key))
    );

    const mobileAttributes = Object.fromEntries(
        Object.entries(attributes['wpbs-layout']).filter(([key, value]) =>
            key.includes('mobile') &&
            typeof value !== 'object' &&
            !key.includes('hover') &&
            ![...Object.keys(specialAttributes), 'breakpoint'].includes(key)
        )
    );

    const styles = {};

    for (const [prop, value] of Object.entries(styleAttributes)) {
        if (!value) continue;
        styles[prop] = value;
    }

    for (const [prop, value] of Object.entries(mobileAttributes)) {
        if (!value) continue;

        let propName = prop.replace('', '').replace('-mobile', '');

        if (propName === 'text-color') {
            propName = 'color';
        }

        styles[propName] = value;
    }

    for (const [prop, value] of Object.entries(specialAttributes)) {
        if (!value) continue;

        switch (prop) {
            case 'mask-image-mobile': {
                const imageUrl = value?.sizes?.full?.url || '#';
                styles['mask-image'] = `url(${imageUrl})`;
                styles['mask-repeat'] = 'no-repeat';
                styles['mask-size'] = (() => {
                    const size = attributes?.['mask-size'];
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
                styles['mask-position'] = attributes?.['mask-origin'] || 'center center';
                break;
            }
            case 'height-mobile':
            case 'height-custom-mobile':
                styles['height'] =
                    attributes['height-custom-mobile'] ||
                    attributes['height-mobile'] ||
                    null;
                break;

            case 'min-height-mobile':
            case 'min-height-custom-mobile':
                styles['min-height'] =
                    attributes['min-height-custom-mobile'] ||
                    attributes['min-height-mobile'] ||
                    null;
                break;

            case 'max-height-mobile':
            case 'max-height-custom-mobile':
                styles['max-height'] =
                    attributes['max-height-custom-mobile'] ||
                    attributes['max-height-mobile'] ||
                    null;
                break;

            case 'width-mobile':
            case 'width-custom-mobile':
                styles['width'] =
                    attributes['width-custom-mobile'] ||
                    attributes['width-mobile'] ||
                    null;
                break;

            case 'translate-mobile': {
                const top = getCSSFromStyle(attributes['translate-mobile']?.top ?? '0px');
                const left = getCSSFromStyle(attributes['translate-mobile']?.left ?? '0px');
                styles['transform'] = `translate(${top}, ${left})`;
                break;
            }
        }
    }

    return styles;
}

function hover(attributes) {
    
    const hoverAttributes = Object.fromEntries(
        Object.entries(attributes['wpbs-layout']).filter(([key, value]) =>
            key.includes('hover') &&
            typeof value !== 'object' &&
            !key.includes('mobile')
        )
    );

    const styles = {};

    // Process each hover attribute
    for (const [prop, value] of Object.entries(hoverAttributes)) {
        if (!value) continue;

        // Remove the prefix '' and suffix '-hover'
        let propName = prop.replace('', '').replace('-hover', '');

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

    useEffect(() => {
        setAttributes({'wpbs-css': styleCss(attributes, uniqueId, customCss, selector)});
    }, [attributes['wpbs-layout'], attributes['wpbs-background']]);

    return <style className={'wpbs-styles'}>{attributes['wpbs-css']}</style>;
}

export function styleCss(attributes, uniqueId, customCss = '', selector = '') {

    const breakpoints = WPBS?.settings?.breakpoints;
    const breakpoint = breakpoints[attributes['wpbs-layout']?.breakpoint ?? 'normal'];

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