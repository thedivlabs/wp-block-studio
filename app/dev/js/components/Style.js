import {memo, useCallback, useEffect, useMemo, useState} from "react";
import {
    __experimentalGrid as Grid,
    __experimentalBoxControl as BoxControl,
    __experimentalToolsPanelItem as ToolsPanelItem,
    __experimentalToolsPanel as ToolsPanel,
    Button,
    PanelBody,
    SelectControl,
    TextControl
} from "@wordpress/components";
import {InspectorControls} from "@wordpress/block-editor";
import {useInstanceId} from "@wordpress/compose";
import _ from "lodash";
import {DIMENSION_UNITS, DIRECTION_OPTIONS, DISPLAY_OPTIONS} from "Includes/config";

export function getCSSFromStyle(raw, presetKeyword = '') {
    if (raw == null) return '';

    // Handle objects (padding, margin, etc.)
    if (typeof raw === 'object' && !Array.isArray(raw)) {
        return Object.entries(raw)
            .map(([k, v]) => `${k}: ${getCSSFromStyle(v, presetKeyword)};`)
            .join(' ');
    }

    // Handle arrays (e.g., font-family fallbacks)
    if (Array.isArray(raw)) {
        return raw.map(v => getCSSFromStyle(v, presetKeyword)).join(', ');
    }

    // Handle primitives
    if (typeof raw !== 'string') return String(raw);

    // Custom variable format
    if (raw.startsWith('var:')) {
        const [source, type, name] = raw.slice(4).split('|');
        if (source && type && name) {
            return `var(--wp--${source}--${type}--${name})`;
        }
        return raw;
    }

    // CSS variable
    if (raw.startsWith('--wp--')) {
        return `var(${raw})`;
    }

    // Preset keyword
    if (presetKeyword) {
        return `var(--wp--preset--${presetKeyword}--${raw})`;
    }

    return raw;
}


// Flatten special props like padding/margin/gap
function parseSpecialProps(props = {}) {
    const result = {};
    Object.entries(props).forEach(([key, val]) => {
        if (val == null) return;

        if (SPECIAL_FIELDS.includes(key)) {
            switch (key) {
                case 'margin':
                case 'padding':
                case 'gap':
                    result[`${key}-top`] = val.top ?? '0px';
                    result[`${key}-right`] = val.right ?? '0px';
                    result[`${key}-bottom`] = val.bottom ?? '0px';
                    result[`${key}-left`] = val.left ?? '0px';
                    break;
                default:
                    result[key] = val;
            }
        } else {
            result[key] = val;
        }
    });
    return result;
}

// Parse wpbs-layout into a flattened CSS-ready object
export function parseLayoutForCSS(layout = {}) {
    return {
        props: layout.props ? parseSpecialProps(layout.props) : {},
        breakpoints: layout.breakpoints
            ? Object.fromEntries(
                Object.entries(layout.breakpoints).map(([k, v]) => [k, parseSpecialProps(v)])
            )
            : {},
        hover: layout.hover ? parseSpecialProps(layout.hover) : {},
    };
}

/**
 * Production-ready Style component
 * Only re-renders when wpbs-layout changes
 */
export const Style = React.memo(({wpbsLayout, uniqueId}) => {
    if (!uniqueId || !wpbsLayout) return null;

    const selector = `.${uniqueId}`;

    const cssString = useMemo(() => {
        if (_.isEmpty(wpbsLayout)) return '';

        const parsedCss = parseLayoutForCSS(wpbsLayout);

        const propsToCss = (props = {}) =>
            Object.entries(props)
                .map(([k, v]) => `${k}: ${getCSSFromStyle(v)};`)
                .join(' ');

        let result = '';

        // Default
        if (!_.isEmpty(parsedCss.props)) {
            result += `${selector} { ${propsToCss(parsedCss.props)} }`;
        }

        // Breakpoints
        if (parsedCss.breakpoints) {
            Object.entries(parsedCss.breakpoints).forEach(([bpKey, bpProps]) => {
                const bp = WPBS?.settings?.breakpoints?.[bpKey];
                if (!bp || _.isEmpty(bpProps)) return;

                result += `@media (max-width: ${bp.size - 1}px) { ${selector} { ${propsToCss(bpProps)} } }`;
            });
        }

        // Hover
        if (!_.isEmpty(parsedCss.hover)) {
            result += `${selector}:hover { ${propsToCss(parsedCss.hover)} }`;
        }

        return result;
    }, [wpbsLayout, selector]);

    if (!cssString) return null;
    return <style>{cssString}</style>;
}, (prev, next) => prev.wpbsLayout === next.wpbsLayout && prev.uniqueId === next.uniqueId);

// Constants
const SPECIAL_FIELDS = [
    'gap', 'margin', 'padding', 'border', 'box-shadow', 'flex', 'display', 'width', 'height',
    'min-height', 'max-height', 'min-width', 'max-width', 'font-size', 'line-height', 'color',
    'background-color', 'border-radius', 'position', 'top', 'right', 'bottom', 'left',
];

// ------------------ LAYOUT ------------------

const Layout = memo(({layout, setLayout}) => {
    const uniqueId = useInstanceId("wpbs");

    useEffect(() => {
        if (!layout?.uniqueId) setLayout({...layout, uniqueId});
    }, [layout, setLayout, uniqueId]);

    const breakpoints = useMemo(
        () =>
            Object.entries(WPBS?.settings?.breakpoints || {}).map(([key, {label, size}]) => ({
                key,
                label,
                size
            })),
        []
    );

    const layoutKeys = useMemo(() => Object.keys(layout.breakpoints || {}).sort((a, b) => {
        const sizeA = breakpoints.find(bp => bp.key === a)?.size || 0;
        const sizeB = breakpoints.find(bp => bp.key === b)?.size || 0;
        return sizeA - sizeB;
    }), [layout.breakpoints, breakpoints]);

    const setLayoutItem = useCallback(
        (newProps, bpKey = "props") => {
            if (bpKey === "hover") {
                setLayout({...layout, hover: {...layout.hover, ...newProps}});
            } else if (bpKey === "props") {
                setLayout({...layout, props: {...layout.props, ...newProps}});
            } else {
                setLayout({
                    ...layout,
                    breakpoints: {
                        ...layout.breakpoints,
                        [bpKey]: {...layout.breakpoints[bpKey], ...newProps}
                    }
                });
            }
        },
        [layout, setLayout]
    );

    const addBreakpoint = useCallback(() => {
        const existing = Object.keys(layout.breakpoints || {});
        const available = breakpoints.map(bp => bp.key).filter(bp => !existing.includes(bp));
        if (!available.length) return;
        setLayout({
            ...layout,
            breakpoints: {...layout.breakpoints, [available[0]]: {}}
        });
    }, [layout, breakpoints, setLayout]);

    const removeBreakpoint = useCallback(
        (bpKey) => {
            const {[bpKey]: _, ...rest} = layout.breakpoints;
            setLayout({...layout, breakpoints: rest});
        },
        [layout, setLayout]
    );

    return (
        <PanelBody title="Layout" initialOpen={false} className="wpbs-layout-tools">
            <Grid columns={1} columnGap={5} className="wpbs-layout-tools__grid">
                <ToolsPanel label="Default" resetAll={() => setLayoutItem({}, "props")}>
                    <LayoutFields bpKey="props" settings={layout.props} updateLayoutItem={setLayoutItem}
                                  suppress={['padding', 'margin', 'gap']}/>
                </ToolsPanel>

                <ToolsPanel label="Hover" resetAll={() => setLayoutItem({}, "hover")}>
                    <HoverFields hoverSettings={layout.hover} updateHoverItem={(p) => setLayoutItem(p, "hover")}/>
                </ToolsPanel>

                {layoutKeys.map(bpKey => {
                    const bp = breakpoints.find(b => b.key === bpKey);
                    const label = bp ? `${bp.label} (${bp.size}px)` : bpKey;
                    return (
                        <ToolsPanel key={bpKey} label={label} resetAll={() => setLayoutItem({}, bpKey)}>
                            <LayoutFields bpKey={bpKey} settings={layout.breakpoints[bpKey]}
                                          updateLayoutItem={setLayoutItem}/>
                            <Button variant="secondary" onClick={() => removeBreakpoint(bpKey)} icon="trash"
                                    style={{gridColumn: "1/-1"}}/>
                        </ToolsPanel>
                    );
                })}

                <Button variant="primary" onClick={addBreakpoint} style={{width: "100%", gridColumn: "1/-1"}}
                        disabled={layoutKeys.length >= 3}>
                    Add Breakpoint
                </Button>
            </Grid>
        </PanelBody>
    );
});

// ------------------ FIELD ------------------

const Field = memo(({field, settings, callback}) => {
    const {type, slug, label, options, large = false} = field;
    if (!type || !slug || !label) return null;

    const handleChange = useCallback(val => callback({[slug]: val}), [callback, slug]);

    let control = null;
    switch (type) {
        case "select":
            control = <SelectControl label={label} value={settings?.[slug]} options={options} onChange={handleChange}
                                     __next40pxDefaultSize __nextHasNoMarginBottom/>;
            break;
        case "text":
            control = <TextControl label={label} value={settings?.[slug]} onChange={handleChange} __next40pxDefaultSize
                                   __nextHasNoMarginBottom/>;
            break;
        case "box":
            control = <BoxControl label={label} values={settings?.[slug]} onChange={handleChange} {...options}
                                  __next40pxDefaultSize __nextHasNoMarginBottom/>;
            break;
    }

    return (
        <ToolsPanelItem style={{gridColumn: large ? "1/-1" : "span 1"}} label={label}
                        hasValue={() => !!settings?.[slug]} onDeselect={() => handleChange('')}>
            {control}
        </ToolsPanelItem>
    );
});

const LayoutFields = memo(({bpKey, settings, updateLayoutItem, suppress = []}) => {
    const updateProp = useCallback((p) => updateLayoutItem(p, bpKey), [updateLayoutItem, bpKey]);
    const fields = [
        {type: "select", slug: "display", label: "Display", options: DISPLAY_OPTIONS},
        {type: "select", slug: "flex-direction", label: "Direction", options: DIRECTION_OPTIONS},
        {
            type: "box",
            slug: "padding",
            label: "Padding",
            large: true,
            options: {sides: ["top", "right", "bottom", "left"], inputProps: {units: DIMENSION_UNITS}}
        }
    ];
    return fields.filter(f => !suppress.includes(f.slug)).map(f => <Field key={f.slug} field={f} settings={settings}
                                                                          callback={updateProp}/>);
});

const HoverFields = memo(({hoverSettings, updateHoverItem, suppress = []}) => {
    const updateProp = useCallback(p => updateHoverItem(p), [updateHoverItem]);
    const fields = [
        {type: "text", slug: "background-color", label: "Background Color"},
        {type: "text", slug: "text-color", label: "Text Color"}
    ];
    return fields.filter(f => !suppress.includes(f.slug)).map(f => <Field key={f.slug} field={f}
                                                                          settings={hoverSettings}
                                                                          callback={updateProp}/>);
});

// ------------------ HOC ------------------

export function withStyle(EditComponent) {
    return memo(function StyledEdit(props) {
        const [layout, setLayout] = useState(props.attributes['wpbs-layout'] || {});
        const [css, setCss] = useState({});

        return (
            <>
                <EditComponent {...props} setCss={setCss} layout={layout} setLayout={setLayout}/>
                <InspectorControls group="styles">
                    <Layout layout={layout} setLayout={setLayout}/>
                </InspectorControls>
                <Style layout={layout} css={css}/>
            </>
        );
    });
}
