import React, {memo, useCallback, useEffect, useMemo, useState} from "react";
import {
    __experimentalGrid as Grid,
    __experimentalBoxControl as BoxControl,
    __experimentalToolsPanelItem as ToolsPanelItem,
    __experimentalToolsPanel as ToolsPanel,
    Button,
    PanelBody,
    SelectControl,
    TextControl,
} from "@wordpress/components";
import {InspectorControls} from "@wordpress/block-editor";
import {useInstanceId} from "@wordpress/compose";
import {DIMENSION_UNITS, DIRECTION_OPTIONS, DISPLAY_OPTIONS} from "Includes/config";

// ------------------ UTILS ------------------

export function getCSSFromStyle(raw, presetKeyword = "") {
    if (raw == null) return "";

    if (Array.isArray(raw)) {
        return raw.map(v => getCSSFromStyle(v, presetKeyword)).join(", ");
    }

    if (typeof raw === "object") {
        return Object.entries(raw)
            .map(([k, v]) => `${k}: ${getCSSFromStyle(v, presetKeyword)};`)
            .join(" ");
    }

    if (typeof raw !== "string") return String(raw);

    if (raw.startsWith("var:")) {
        const [source, type, name] = raw.slice(4).split("|");
        if (source && type && name) return `var(--wp--${source}--${type}--${name})`;
        return raw;
    }

    if (raw.startsWith("--wp--")) return `var(${raw})`;
    if (presetKeyword) return `var(--wp--preset--${presetKeyword}--${raw})`;

    return raw;
}

const SPECIAL_FIELDS = [
    "gap", "margin", "padding", "border", "box-shadow", "flex", "display",
    "width", "height", "min-height", "max-height", "min-width", "max-width",
    "font-size", "line-height", "color", "background-color", "border-radius",
    "position", "top", "right", "bottom", "left"
];

function parseSpecialProps(props = {}) {
    const result = {};
    Object.entries(props).forEach(([key, val]) => {
        if (val == null) return;

        if (SPECIAL_FIELDS.includes(key)) {
            switch (key) {
                case "margin":
                case "padding":
                case "gap":
                    result[`${key}-top`] = val.top ?? "0px";
                    result[`${key}-right`] = val.right ?? "0px";
                    result[`${key}-bottom`] = val.bottom ?? "0px";
                    result[`${key}-left`] = val.left ?? "0px";
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

// ------------------ STYLE COMPONENT ------------------

export const Style = memo(({layout}) => {
    if (!layout?.uniqueId) return null;
    const selector = `.${layout.uniqueId}`;

    const cssString = useMemo(() => {
        if (!layout) return "";

        const parsed = parseLayoutForCSS(layout);

        const toCss = (props = {}) =>
            Object.entries(props)
                .map(([k, v]) => `${k}: ${getCSSFromStyle(v)};`)
                .join(" ");

        let result = "";

        // Default
        if (Object.keys(parsed.props).length) result += `${selector} { ${toCss(parsed.props)} }`;

        // Breakpoints
        if (parsed.breakpoints) {
            Object.entries(parsed.breakpoints).forEach(([bpKey, bpProps]) => {
                const bp = WPBS?.settings?.breakpoints?.[bpKey];
                if (!bp || !Object.keys(bpProps).length) return;
                result += `@media (max-width: ${bp.size - 1}px) { ${selector} { ${toCss(bpProps)} } }`;
            });
        }

        // Hover
        if (Object.keys(parsed.hover).length) result += `${selector}:hover { ${toCss(parsed.hover)} }`;

        return result;
    }, [layout]);

    if (!cssString) return null;
    return <style>{cssString}</style>;
}, (prev, next) => prev.layout === next.layout);

// ------------------ LAYOUT INSPECTOR ------------------

const Layout = memo(({layout, setLayout}) => {
    const uniqueId = useInstanceId("wpbs");

    useEffect(() => {
        if (!layout?.uniqueId) setLayout(l => ({...l, uniqueId}));
    }, [uniqueId, setLayout]);

    const breakpoints = useMemo(
        () =>
            Object.entries(WPBS?.settings?.breakpoints || {}).map(([key, {label, size}]) => ({
                key, label, size
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
            if (bpKey === "hover") setLayout(l => ({...l, hover: {...l.hover, ...newProps}}));
            else if (bpKey === "props") setLayout(l => ({...l, props: {...l.props, ...newProps}}));
            else setLayout(l => ({
                    ...l,
                    breakpoints: {...l.breakpoints, [bpKey]: {...l.breakpoints[bpKey], ...newProps}}
                }));
        },
        [setLayout]
    );

    const addBreakpoint = useCallback(() => {
        const existing = Object.keys(layout.breakpoints || {});
        const available = breakpoints.map(bp => bp.key).filter(bp => !existing.includes(bp));
        if (!available.length) return;
        setLayout(l => ({...l, breakpoints: {...l.breakpoints, [available[0]]: {}}}));
    }, [breakpoints, setLayout]);

    const removeBreakpoint = useCallback(bpKey => {
        setLayout(l => {
            const {[bpKey]: _, ...rest} = l.breakpoints;
            return {...l, breakpoints: rest};
        });
    }, [setLayout]);

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

// ------------------ FIELDS ------------------

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
    const updateProp = useCallback(p => updateLayoutItem(p, bpKey), [updateLayoutItem, bpKey]);
    const fields = [
        {type: "select", slug: "display", label: "Display", options: DISPLAY_OPTIONS},
        {type: "select", slug: "flex-direction", label: "Direction", options: DIRECTION_OPTIONS},
        {
            type: "box",
            slug: "padding",
            label: "Padding",
            large: true,
            options: {sides: ["top", "right", "bottom", "left"], inputProps: {units: DIMENSION_UNITS}}
        },
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
                <EditComponent {...props} layout={layout} setLayout={setLayout} setCss={setCss}/>
                <InspectorControls group="styles">
                    <Layout layout={layout} setLayout={setLayout}/>
                </InspectorControls>
                <Style layout={layout}/>
            </>
        );
    });
}
