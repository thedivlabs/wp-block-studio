import {
    useState,
    useEffect,
    useMemo,
    useCallback,
    memo
} from "@wordpress/element";
import {
    Button,
    __experimentalToolsPanel as ToolsPanel, PanelBody,
    __experimentalGrid as Grid
} from "@wordpress/components";
import {__} from "@wordpress/i18n";
import _ from "lodash";
import {Field} from "Components/Field";
import {BackgroundControls} from "./Background";
import {InspectorControls} from "@wordpress/block-editor";
import {AdvancedControls} from "Components/AdvancedControls";

const API = window?.WPBS_StyleEditor ?? {};
const {cleanObject} = API;

/* -------------------------------------------------------------------------- */
/* LayoutFields – controlled, memoized mapper */
/* -------------------------------------------------------------------------- */
const LayoutFields = memo(({bpKey, settings, suppress = [], updateFn}) => {
    const {layoutFieldsMap: map = []} = window?.WPBS_StyleEditor ?? {};

    return map
        .filter((f) => !suppress.includes(f.slug))
        .map((field) => {
            const callback = (v) => updateFn({[field.slug]: v}, bpKey);

            return (
                <Field
                    key={`${bpKey || "base"}-${field.slug}`}
                    field={field}
                    settings={settings}
                    callback={callback}
                />
            );
        });
});

/* -------------------------------------------------------------------------- */
/* HoverFields – controlled, memoized mapper */
/* -------------------------------------------------------------------------- */
const HoverFields = memo(({settings, suppress = [], updateHoverItem}) => {
    const {hoverFieldsMap: map = []} = window?.WPBS_StyleEditor ?? {};

    return (
        <Grid columns={2} rowGap={15}>
            {map
                .filter((f) => !suppress.includes(f.slug))
                .map((field) => (
                    <Field
                        key={field.slug}
                        field={field}
                        settings={settings}
                        callback={(v) => updateHoverItem(v)}
                        isToolsPanel={false}
                    />
                ))}
        </Grid>
    );
});

/* -------------------------------------------------------------------------- */
/* BreakpointPanel – isolated per-breakpoint UI */
/* -------------------------------------------------------------------------- */
const BreakpointPanel = memo(
    ({
         bpKey,
         data,
         localLayout = {breakpoints: {}},
         breakpoints,
         breakpointKeys,
         updateLocalLayout,
         updateBreakpointItem,
         removeBreakpointPanel,
     }) => {

        const handleChangeKey = useCallback(
            (newKey) => {
                if (!newKey || newKey === bpKey) return;

                const currentBreakpoints = localLayout.breakpoints || {};

                if (breakpointKeys.includes(newKey)) return;

                const nextBreakpoints = {...currentBreakpoints};
                nextBreakpoints[newKey] = nextBreakpoints[bpKey];
                delete nextBreakpoints[bpKey];

                const next = {
                    ...localLayout,
                    breakpoints: nextBreakpoints,
                };

                updateLocalLayout(next, true);
            },
            [bpKey, localLayout, breakpointKeys, updateLocalLayout]
        );

        return (
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
                            onChange={(e) => handleChangeKey(e.target.value)}
                        >
                            {breakpoints.map((b) => {
                                const size = b?.size ? `(${b.size}px)` : "";
                                const label = [b?.label ?? bpKey, size].filter(Boolean).join(" ");
                                const isDisabled =
                                    b.key !== bpKey && breakpointKeys.includes(b.key);
                                return (
                                    <option key={b.key} value={b.key} disabled={isDisabled}>
                                        {label}
                                    </option>
                                );
                            })}
                        </select>
                    </label>
                </div>

                <ToolsPanel
                    label={__("Layout")}
                    resetAll={() => {
                        const next = {
                            ...localLayout,
                            breakpoints: {
                                ...localLayout.breakpoints,
                                [bpKey]: {},
                            },
                        };
                        updateLocalLayout(next, true);
                    }}
                >
                    <LayoutFields
                        bpKey={bpKey}
                        settings={data?.props || {}}
                        updateFn={(newProps) =>
                            updateBreakpointItem({props: newProps}, bpKey)
                        }
                        suppress={[
                            "container",
                            "reveal-anim",
                            "reveal-offset",
                            "reveal-delay",
                            "reveal-duration",
                            "reveal-easing",
                            "reveal-distance",
                        ]}
                    />
                </ToolsPanel>

                <BackgroundControls
                    settings={data?.background || {}}
                    callback={(newProps) =>
                        updateBreakpointItem({background: newProps}, bpKey)
                    }
                    isBreakpoint={true}
                />
            </div>
        );
    },
    (prev, next) => _.isEqual(prev.data, next.data)
);

/* -------------------------------------------------------------------------- */
/* Main Component */
/* -------------------------------------------------------------------------- */
export const StyleEditorUI = ({settings, updateStyleSettings}) => {

    /* ------------------------------------------------------------------ */
    /*  LOCAL STATE — initialized from settings ONCE, then fully decoupled */
    /* ------------------------------------------------------------------ */
    const [localProps, setLocalProps] = useState(settings?.props || {});
    const [localHover, setLocalHover] = useState(settings?.hover || {});
    const [localBackground, setLocalBackground] = useState(settings?.background || {});
    const [localAdvanced, setLocalAdvanced] = useState(settings?.advanced || {});
    const [localBreakpoints, setLocalBreakpoints] = useState(settings?.breakpoints || {});


    /* ----------------------------------------------- */
    /*  Structural updater (used by BreakpointPanel)   */
    /* ----------------------------------------------- */
    const updateLocalLayout = useCallback((nextLayout) => {
        const safe = nextLayout || {};
        setLocalProps(safe.props || {});
        setLocalHover(safe.hover || {});
        setLocalBackground(safe.background || {});
        setLocalAdvanced(safe.advanced || {});
        setLocalBreakpoints(safe.breakpoints || {});
    }, []);


    /* ------------------------------------------------------------------ */
    /*  Derived localLayout object */
    /* ------------------------------------------------------------------ */
    const localLayout = useMemo(
        () => ({
            props: localProps,
            hover: localHover,
            background: localBackground,
            advanced: localAdvanced,
            breakpoints: localBreakpoints,
        }),
        [localProps, localHover, localBackground, localAdvanced, localBreakpoints]
    );

    /* ------------------------------------------------------------------ */
    /*  IMPORTANT: NO SYNC FROM `settings` AFTER MOUNT                     */
    /* ------------------------------------------------------------------ */
    // The effect below is intentionally removed.
    // StyleEditorUI owns its own state and never rehydrates from props.
    //
    // useEffect(() => {
    //     setLocalProps(settings.props);
    //     setLocalHover(settings.hover);
    //     ...
    // }, [settings]);

    /* ------------------------------------------------------------------ */
    /*  Debounced commit to HOC                                           */
    /* ------------------------------------------------------------------ */
    const debouncedCommit = useMemo(
        () => _.debounce((next) => updateStyleSettings(next), 400),
        [updateStyleSettings]
    );

    useEffect(() => {
        debouncedCommit(localLayout);
        return () => debouncedCommit.cancel();
    }, [localLayout, debouncedCommit]);

    /* ------------------------------------------------------------------ */
    /* Update helpers — modify local state only                           */
    /* ------------------------------------------------------------------ */
    const updateLayoutItem = useCallback((newProps) => {
        setLocalProps((prev) => ({...prev, ...newProps}));
    }, []);

    const updateHoverItem = useCallback((newProps) => {
        setLocalHover((prev) => ({...prev, ...newProps}));
    }, []);

    const updateAdvancedItem = useCallback((newProps) => {
        setLocalAdvanced((prev) => ({...prev, ...newProps}));
    }, []);

    const updateBackgroundItem = useCallback((newProps, reset = false) => {
        setLocalBackground((prev) =>
            reset ? {} : {...prev, ...newProps}
        );
    }, []);

    const updateBreakpointItem = useCallback((updates, bpKey) => {
        setLocalBreakpoints((prev) => {
            const current = prev[bpKey] || {props: {}, background: {}};

            const nextBP = {
                props: {...current.props},
                background: {...current.background},
            };

            if (updates.props) Object.assign(nextBP.props, updates.props);
            if (updates.background) Object.assign(nextBP.background, updates.background);

            for (const [key, value] of Object.entries(updates)) {
                if (key !== "props" && key !== "background") {
                    nextBP.props[key] = value;
                }
            }

            return {
                ...prev,
                [bpKey]: nextBP,
            };
        });
    }, []);

    /* ------------------------------------------------------------------ */
    /* Breakpoint panel management                                        */
    /* ------------------------------------------------------------------ */
    const breakpoints = useMemo(() => {
        const bps = WPBS?.settings?.breakpoints ?? {};
        return Object.entries(bps).map(([key, {label, size}]) => ({
            key, label, size
        }));
    }, []);

    const breakpointKeys = useMemo(() => {
        return Object.keys(localBreakpoints || {}).sort((a, b) => {
            const bpA = breakpoints.find((bp) => bp.key === a);
            const bpB = breakpoints.find((bp) => bp.key === b);
            return (bpA?.size || 0) - (bpB?.size || 0);
        });
    }, [localBreakpoints, breakpoints]);

    const addBreakpointPanel = useCallback(() => {
        setLocalBreakpoints((prev) => {
            const keys = Object.keys(prev);
            if (keys.length >= 3) return prev;

            const available = breakpoints
                .map((bp) => bp.key)
                .filter((key) => !keys.includes(key));

            if (!available.length) return prev;

            return {...prev, [available[0]]: {}};
        });
    }, [breakpoints]);

    const removeBreakpointPanel = useCallback((bpKey) => {
        setLocalBreakpoints((prev) => {
            const {[bpKey]: _, ...rest} = prev;
            return rest;
        });
    }, []);

    /* ------------------------------------------------------------------ */
    /* Render UI                                                          */
    /* ------------------------------------------------------------------ */
    return (
        <>
            <InspectorControls group="advanced">
                <AdvancedControls settings={localAdvanced} callback={updateAdvancedItem}/>
            </InspectorControls>

            <InspectorControls group="styles">
                <div className="wpbs-layout-tools">

                    {/* Layout */}
                    <div className="wpbs-layout-tools__panel">
                        <ToolsPanel
                            label={__("Layout")}
                            resetAll={() => setLocalProps({})}
                        >
                            <LayoutFields
                                bpKey="layout"
                                settings={localProps}
                                suppress={[
                                    "padding",
                                    "margin",
                                    "gap",
                                    "outline",
                                    "radius",
                                    "font-size",
                                    "text-align",
                                    "box-shadow",
                                ]}
                                updateFn={updateLayoutItem}
                            />
                        </ToolsPanel>

                        <BackgroundControls
                            settings={localBackground}
                            callback={(newProps, reset) =>
                                updateBackgroundItem(newProps, reset)
                            }
                        />
                    </div>

                    {/* Hover */}
                    <div className="wpbs-layout-tools__panel">
                        <PanelBody
                            title={__("Hover")}
                            initialOpen={Object.keys(localHover).length > 0}
                            className="wpbs-hover-controls"
                        >
                            <HoverFields
                                settings={localHover}
                                updateHoverItem={updateHoverItem}
                            />
                        </PanelBody>
                    </div>

                    {/* Breakpoints */}
                    {breakpointKeys.map((bpKey) => (
                        <BreakpointPanel
                            key={bpKey}
                            bpKey={bpKey}
                            data={localBreakpoints[bpKey] || {props: {}, background: {}}}
                            localLayout={localLayout}
                            breakpoints={breakpoints}
                            breakpointKeys={breakpointKeys}
                            updateLocalLayout={updateLocalLayout}
                            updateBreakpointItem={updateBreakpointItem}
                            removeBreakpointPanel={removeBreakpointPanel}
                        />
                    ))}

                    {/* Add Breakpoint */}
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
            </InspectorControls>
        </>
    );
};
