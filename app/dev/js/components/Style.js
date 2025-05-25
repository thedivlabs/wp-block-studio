import {useMemo} from "react";

export const STYLE_ATTRIBUTES = {
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

export function Style({attributes, setAttributes, css = '' | [], props = {}, deps = []}) {

    const dependencyValues = [...deps.map((key) => attributes[key]), attributes?.style, attributes.uniqueId];

    const uniqueId = attributes?.uniqueId ?? '';
    const selector = '.' + uniqueId.trim().split(' ').join('.');
    const breakpoint = WPBS?.settings?.breakpoints[attributes['wpbs-layout']?.breakpoint ?? 'normal'];

    const result = useMemo(() => {

        let desktopProps = {};
        let mobileProps = {};

        let propsCss = '';

        let rowGap = (rowGap = getCSSFromStyle(attributes?.style?.spacing?.blockGap?.top ?? null)) === 0 ? '0px' : rowGap;
        let colGap = (colGap = getCSSFromStyle(attributes?.style?.spacing?.blockGap?.left ?? null)) === 0 ? '0px' : colGap;
        let rowGapMobile = (rowGapMobile = getCSSFromStyle(attributes?.['wpbs-layout']?.['gap-mobile']?.top ?? null)) === 0 ? '0px' : rowGapMobile;
        let colGapMobile = (colGapMobile = getCSSFromStyle(attributes?.['wpbs-layout']?.['gap-mobile']?.left ?? null)) === 0 ? '0px' : colGapMobile;

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

                propsCss += [prop, value].join(':') + ';';
            })

            propsCss += '}';

            if (Object.keys(props?.breakpoints ?? {}).length) {
                Object.entries(props.breakpoints).forEach(([breakpoint, rules]) => {

                    if (typeof rules !== 'object') {
                        return;
                    }

                    propsCss += '@media(min-width: ' + breakpoint + '){' + selector + '{';

                    Object.entries(rules).forEach(([prop, value]) => {

                        if (!value) {
                            return;
                        }

                        propsCss += [prop, value].join(':') + ';';
                    })

                    propsCss += '}}';
                })
            }
        }


        if (Array.isArray(css)) {
            css = [propsCss, ...css].join(' ').trim();
        } else {
            css = [propsCss, css].join(' ').trim();
        }

        setAttributes({'wpbs-css': css});

        return css;

    }, dependencyValues);


    return <style className={'wpbs-styles'}>{result}</style>;
}

