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

function hover(attributes) {

    const hoverAttributes = Object.fromEntries(
        Object.entries(attributes?.['wpbs-layout']).filter(([key, value]) =>
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
        mobile: Object.fromEntries(Object.entries({
            'row-gap': attributes?.['wpbs-layout']?.['gap-mobile']?.top ?? null,
            'column-gap': attributes?.['wpbs-layout']?.['gap-mobile']?.left ?? null,
        }).filter(([key, value]) => value)),
        desktop: Object.fromEntries(Object.entries({
            'row-gap': attributes?.style?.spacing?.blockGap?.top ?? null,
            'column-gap': attributes?.style?.spacing?.blockGap?.left ?? null,
        }).filter(([key, value]) => value)),
    };

    Object.entries(attributes?.['wpbs-props'] ?? {}).forEach(([key, value]) => {
        if (
            typeof value !== 'object' &&
            !['', undefined, null].includes(value)
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

    return Object.fromEntries(Object.entries(styles).filter((k, style) => !!style));
}

export function Style({attributes, setAttributes, css = '' | []}) {

    const styleAttributes = Object.fromEntries(Object.entries({
        'row-gap': getCSSFromStyle(attributes['gap-mobile']?.left ?? null),
        'column-gap': getCSSFromStyle(attributes['gap-mobile']?.top ?? null),
    }).filter(([key, value]) => value))

    if (Array.isArray(css)) {
        setAttributes({'wpbs-css': css.join(' ')});
    } else {
        setAttributes({'wpbs-css': css});
    }

    return <style className={'wpbs-styles'}>{attributes['wpbs-css']}</style>;
}

