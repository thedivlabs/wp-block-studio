import {useEffect} from "react";

export const styleAttributes = {
    'wpbs-css': {
        type: 'string'
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

export function Style({attributes, setAttributes, css = '' | []}) {

    const uniqueId = attributes?.uniqueId;
    const selector = '.' + uniqueId.trim().split(' ').join('.');
    const breakpoint = WPBS?.settings?.breakpoints[attributes['wpbs-layout']?.breakpoint ?? 'normal'];

    let desktopProps = {}
    let mobileProps = {}

    useEffect(() => {
        const desktop = Object.fromEntries(Object.entries({
            'row-gap': getCSSFromStyle(attributes?.style?.spacing?.blockGap?.top ?? null),
            'column-gap': getCSSFromStyle(attributes?.style?.spacing?.blockGap?.left ?? null),
        }).filter(([k, v]) => !!v));

        const mobile = Object.fromEntries(Object.entries({
            'row-gap': getCSSFromStyle(attributes?.['wpbs-layout']?.['gap-mobile']?.top ?? null),
            'column-gap': getCSSFromStyle(attributes?.['wpbs-layout']?.['gap-mobile']?.left ?? null),
        }).filter(([k, v]) => !!v));

        desktopProps = {
            ...desktopProps,
            ...desktop
        };

        mobileProps = {
            ...mobileProps,
            ...mobile
        }

    }, [attributes?.style?.spacing?.blockGap, attributes?.['wpbs-layout']?.['gap-mobile']]);

    let styleCss = '';

    if (Object.keys(desktopProps).length) {
        styleCss += selector + '{';
        Object.entries(desktopProps).forEach(([prop, value]) => {

            styleCss += [prop, value].join(':') + ';';
        })

        styleCss += '}';
    }

    if (Object.keys(mobileProps).length) {
        styleCss += '@media(width < ' + breakpoint + '){' + selector + '{';

        Object.entries(mobileProps).forEach(([prop, value]) => {
            styleCss += [prop, value].join(':') + ';';
        })

        styleCss += '}}';
    }


    if (Array.isArray(css)) {
        css = [styleCss, ...css].join(' ');
    } else {
        css = [styleCss, css].join(' ');
    }

    setAttributes({'wpbs-css': css.trim()});

    return <style className={'wpbs-styles'}>{attributes['wpbs-css']}</style>;
}

