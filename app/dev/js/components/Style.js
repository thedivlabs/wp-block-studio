import {useEffect, useState} from "react";

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

export function Style({attributes, setAttributes, css = '' | [], deps = []}) {

    const dependencyValues = deps.map((key) => attributes[key]);

    const uniqueId = attributes?.uniqueId;
    const selector = '.' + uniqueId.trim().split(' ').join('.');
    const breakpoint = WPBS?.settings?.breakpoints[attributes['wpbs-layout']?.breakpoint ?? 'normal'];

    let desktopProps = {}
    let mobileProps = {}

    let propsCss = '';

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

    if (Object.keys(desktopProps).length) {
        propsCss += selector + '{';
        Object.entries(desktopProps).forEach(([prop, value]) => {

            propsCss += [prop, value].join(':') + ';';
        })

        propsCss += '}';
    }

    if (Object.keys(mobileProps).length) {
        propsCss += '@media(width < ' + breakpoint + '){' + selector + '{';

        Object.entries(mobileProps).forEach(([prop, value]) => {
            propsCss += [prop, value].join(':') + ';';
        })

        propsCss += '}}';
    }
    
    if (Array.isArray(css)) {
        css = [propsCss, ...css].join(' ');
    } else {
        css = [propsCss, css].join(' ');
    }

    useEffect(() => {
        setAttributes({'wpbs-css': css.trim()});
    }, dependencyValues);

    return <style className={'wpbs-styles'}>{attributes['wpbs-css']}</style>;
}

