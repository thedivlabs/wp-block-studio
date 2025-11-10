import {memo, useCallback, useMemo} from "@wordpress/element";
import {Field} from "Components/Field";
import _ from "lodash";
import {
    Button,
    __experimentalToolsPanel as ToolsPanel,
    __experimentalGrid as Grid,
    PanelBody,
    SelectControl,
    ToggleControl,
    __experimentalUnitControl as UnitControl,
    RangeControl,
    BaseControl,
    GradientPicker,
} from "@wordpress/components";
import {__} from "@wordpress/i18n";
import {MediaUpload, MediaUploadCheck} from "@wordpress/block-editor";
import PreviewThumbnail from "Components/PreviewThumbnail";
import {Background, BackgroundControls} from "Components/Background";

const API = window?.WPBS_StyleEditor ?? {};
const {cleanObject} = API;

export const StyleEditorUI = ({settings, updateStyleSettings}) => {

    // --- Load breakpoint definitions
    const breakpoints = useMemo(() => {
        const bps = WPBS?.settings?.breakpoints ?? {};
        return Object.entries(bps).map(([key, {label, size}]) => ({key, label, size}));
    }, []);

    // --- Debounced update handler
    const debouncedUpdate = useMemo(
        () => _.debounce((nextLayout) => {
            updateStyleSettings(nextLayout);
        }, 700),
        [updateStyleSettings, settings]
    );

    // --- Update helpers
    const updateLayoutItem = useCallback(
        (newProps) => {
            const nextLayout = {
                ...settings,
                props: {
                    ...settings.props,
                    ...newProps,
                },
            };
            debouncedUpdate(nextLayout);
        },
        [settings, debouncedUpdate]
    );

    const updateHoverItem = useCallback(
        (newProps) => {
            const nextLayout = {
                ...settings,
                hover: {
                    ...settings.hover,
                    ...newProps,
                },
            };
            debouncedUpdate(nextLayout);
        },
        [settings, debouncedUpdate]
    );

    const updateBreakpointItem = useCallback(
        (updates, bpKey) => {
            const current = settings.breakpoints?.[bpKey] || {props: {}, background: {}};
            const next = {
                props: {...current.props},
                background: {...current.background},
            };

            if (updates.props) Object.assign(next.props, updates.props);
            if (updates.background) Object.assign(next.background, updates.background);

            for (const [key, value] of Object.entries(updates)) {
                if (key !== "props" && key !== "background") {
                    next.props[key] = value;
                }
            }

            const nextLayout = {
                ...settings,
                breakpoints: {
                    ...settings.breakpoints,
                    [bpKey]: next,
                },
            };

            debouncedUpdate(nextLayout);
        },
        [settings, debouncedUpdate]
    );

    const updateBackgroundItem = useCallback(
        (newProps) => {
            const nextLayout = {
                ...settings,
                background: {
                    ...settings.background,
                    ...newProps,
                },
            };
            debouncedUpdate(nextLayout);
        },
        [settings, debouncedUpdate]
    );

    // --- Breakpoint management
    const addBreakpointPanel = useCallback(() => {
        const keys = Object.keys(settings.breakpoints || {});
        if (keys.length >= 3) return;

        const available = breakpoints.map((bp) => bp.key).filter((bp) => !keys.includes(bp));
        if (!available.length) return;

        const newKey = available[0];
        const nextLayout = {
            ...settings,
            breakpoints: {...settings.breakpoints, [newKey]: {}},
        };
        debouncedUpdate(nextLayout);
    }, [breakpoints, settings, debouncedUpdate]);

    const removeBreakpointPanel = useCallback(
        (bpKey) => {
            const {[bpKey]: _, ...rest} = settings.breakpoints;
            const nextLayout = {...settings, breakpoints: rest};
            debouncedUpdate(nextLayout);
        },
        [settings, debouncedUpdate]
    );

    const breakpointKeys = useMemo(() => {
        const keys = Object.keys(settings?.breakpoints || {});
        return keys.sort((a, b) => {
            const bpA = breakpoints.find((bp) => bp.key === a);
            const bpB = breakpoints.find((bp) => bp.key === b);
            return (bpA?.size || 0) - (bpB?.size || 0);
        });
    }, [settings?.breakpoints, breakpoints]);

    // --- Layout fields (now properly scoped by bpKey)
    const LayoutFields = useMemo(() => {
        const {layoutFieldsMap: map = []} = window?.WPBS_StyleEditor ?? {};
        return ({bpKey, settings, suppress = [], updateFn}) =>
            map
                .filter((f) => !suppress.includes(f.slug))
                .map((field) => {
                    const callback = (v) =>
                        updateFn
                            ? updateFn({[field.slug]: v}, bpKey)
                            : updateLayoutItem({[field.slug]: v});
                    return (
                        <Field
                            key={`${bpKey || 'base'}-${field.slug}`}
                            field={field}
                            settings={settings}
                            callback={callback}
                        />
                    );
                });
    }, [updateLayoutItem, updateBreakpointItem]);

    // --- Hover fields
    const HoverFields = useMemo(() => {
        const {hoverFieldsMap: map = []} = window?.WPBS_StyleEditor ?? {};
        return ({settings, suppress = []}) =>
            map
                .filter((f) => !suppress.includes(f.slug))
                .map((field) => (
                    <Field
                        key={field.slug}
                        field={field}
                        settings={settings}
                        callback={(v) => updateHoverItem({[field.slug]: v})}
                    />
                ));
    }, [updateHoverItem]);

    // --- Breakpoint panel
    const BreakpointPanel = useMemo(
        () =>
            ({bpKey, settings, breakpoints, breakpointKeys, updateBreakpointItem, removeBreakpointPanel}) => (
                <div className="wpbs-layout-tools__panel">
                    <div className="wpbs-layout-tools__header">
                        <Button
                            isSmall
                            size="small"
                            iconSize={20}
                            onClick={() => removeBreakpointPanel(bpKey)}
                            icon="no-alt"
                        />
                        <label className="wpbs-layout-tools__breakpoint">
                            <select
                                id={bpKey}
                                value={bpKey}
                                onChange={(e) => {
                                    const newKey = e.target.value;
                                    const nextBreakpoints = {...settings.breakpoints};
                                    nextBreakpoints[newKey] = nextBreakpoints[bpKey];
                                    delete nextBreakpoints[bpKey];
                                    const nextLayout = {...settings, breakpoints: nextBreakpoints};
                                    debouncedUpdate(nextLayout);
                                }}
                            >
                                {breakpoints.map((b) => {
                                    const size = b?.size ? `(${b.size}px)` : "";
                                    const label = [b?.label ?? bpKey, size].filter(Boolean).join(" ");
                                    return (
                                        <option
                                            key={b.key}
                                            value={b.key}
                                            disabled={b.key !== bpKey && breakpointKeys.includes(b.key)}
                                        >
                                            {label}
                                        </option>
                                    );
                                })}
                            </select>
                        </label>
                    </div>
                    <ToolsPanel
                        label={__("Layout")}
                        resetAll={() =>
                            debouncedUpdate({
                                ...settings,
                                breakpoints: {...settings.breakpoints, [bpKey]: {}},
                            })
                        }
                    >
                        <LayoutFields
                            bpKey={bpKey}
                            settings={settings.breakpoints[bpKey]?.props || {}}
                            updateFn={(newProps) => updateBreakpointItem({props: newProps}, bpKey)}
                        />
                    </ToolsPanel>
                </div>
            ),
        [debouncedUpdate, breakpoints, updateBreakpointItem]
    );

    // --- Render
    return (
        <div className="wpbs-layout-tools">
            {/* Default section */}
            <div className="wpbs-layout-tools__panel">
                <ToolsPanel
                    label={__("Layout")}
                    resetAll={() =>
                        debouncedUpdate({
                            ...settings,
                            props: {},
                        })
                    }
                >
                    <LayoutFields
                        bpKey="layout"
                        settings={settings.props}
                        suppress={["padding", "margin", "gap", "outline"]}
                    />
                </ToolsPanel>
            </div>

            {/* Hover section */}
            <div className="wpbs-layout-tools__panel">
                <ToolsPanel
                    label={__("Hover")}
                    resetAll={() =>
                        debouncedUpdate({
                            ...settings,
                            hover: {},
                        })
                    }
                >
                    <HoverFields
                        settings={settings.hover}
                        suppress={["padding", "margin", "gap"]}
                    />
                </ToolsPanel>
            </div>

            <div className="wpbs-layout-tools__panel">
                {/* <BackgroundControls settings={settings.background} callback={updateBackgroundItem}/> */}
            </div>

            {/* Breakpoints */}
            {breakpointKeys.map((bpKey) => (
                <BreakpointPanel
                    key={bpKey}
                    bpKey={bpKey}
                    settings={settings}
                    breakpoints={breakpoints}
                    breakpointKeys={breakpointKeys}
                    updateBreakpointItem={updateBreakpointItem}
                    removeBreakpointPanel={removeBreakpointPanel}
                />
            ))}

            <Button
                variant="primary"
                onClick={addBreakpointPanel}
                style={{
                    borderRadius: "4px",
                    width: "100%",
                    textAlign: "center",
                    gridColumn: "1/-1",
                }}
                disabled={breakpointKeys.length >= 3}
            >
                {__("Add Breakpoint")}
            </Button>
        </div>
    );
};