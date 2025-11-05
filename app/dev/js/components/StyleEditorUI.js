import {useCallback, useEffect, useMemo, useState} from "@wordpress/element";
import {Field} from "Components/Field";
import _ from "lodash";
import {
    Button,
    __experimentalToolsPanel as ToolsPanel,
    __experimentalGrid as Grid,
} from "@wordpress/components";
import {__} from "@wordpress/i18n";

const API = window?.WPBS_StyleEditor ?? {};
const {getCSSFromStyle, cleanObject, hasDuplicateId, updateStyleString, parseSpecialProps} = API;

export const StyleEditorUI = ({settings, updateStyleSettings}) => {

    // --- Load breakpoint definitions
    const breakpoints = useMemo(() => {
        const bps = WPBS?.settings?.breakpoints ?? {};
        return Object.entries(bps).map(([key, {label, size}]) => ({key, label, size}));
    }, []);

    // --- Initialize local style state
    const [localLayout, setLocalLayout] = useState(
        settings || {props: {}, breakpoints: {}, hover: {}}
    );

    const [localBp, setLocalBp] = useState(localLayout.breakpoints)

    // --- Push local layout back up to attributes (replaces old setLayoutNow)
    useEffect(() => {

        const debouncedCommit = _.debounce((nextLayout) => {
            if (_.isEqual(cleanObject(nextLayout, true), cleanObject(settings, true))) {
                return
            }
            updateStyleSettings(nextLayout);
        }, 900); // adjust delay as needed

        debouncedCommit(localLayout);

        return () => debouncedCommit.cancel();
    }, [localLayout, settings]);


    // --- Update helpers
    const updateLayoutItem = useCallback((newProps) => {
        setLocalLayout((prev) => ({
            ...prev,
            props: {
                ...prev.props,
                ...newProps,
            },
        }));
    }, [setLocalLayout]);

    const updateHoverItem = useCallback((newProps) => {
        setLocalLayout((prev) => ({
            ...prev,
            hover: {
                ...prev.hover,
                ...newProps,
            },
        }));
    }, [setLocalLayout]);

    const updateBreakpointItem = useCallback((newProps, bpKey) => {
        setLocalLayout((prev) => ({
            ...prev,
            breakpoints: {
                ...prev.breakpoints,
                [bpKey]: {
                    ...prev.breakpoints[bpKey],
                    ...newProps,
                },
            },
        }));
    }, [setLocalLayout]);

    // --- Breakpoint management
    const addBreakpointPanel = useCallback(() => {
        setLocalLayout((prev) => {
            const keys = Object.keys(prev.breakpoints || {});
            if (keys.length >= 3) return prev;

            const available = breakpoints.map((bp) => bp.key).filter((bp) => !keys.includes(bp));
            if (!available.length) return prev;

            const newKey = available[0];
            return {
                ...prev,
                breakpoints: {...prev.breakpoints, [newKey]: {}},
            };
        });
    }, [breakpoints, setLocalLayout]);

    const removeBreakpointPanel = useCallback((bpKey) => {
        setLocalLayout((prev) => {
            const {[bpKey]: _, ...rest} = prev.breakpoints;
            return {...prev, breakpoints: rest};
        });
    }, []);

    const breakpointKeys = useMemo(() => {
        const keys = Object.keys(localLayout?.breakpoints || {});
        return keys.sort((a, b) => {
            const bpA = breakpoints.find((bp) => bp.key === a);
            const bpB = breakpoints.find((bp) => bp.key === b);
            return (bpA?.size || 0) - (bpB?.size || 0);
        });
    }, [localLayout?.breakpoints]);

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
    const BreakpointPanel = useMemo(() => ({
                                               bpKey,
                                               localLayout,
                                               breakpoints,
                                               breakpointKeys,
                                               updateBreakpointItem,
                                               removeBreakpointPanel,
                                           }) => (
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
                            setLocalLayout((prev) => {
                                const nextBreakpoints = {...prev.breakpoints};
                                nextBreakpoints[newKey] = nextBreakpoints[bpKey];
                                delete nextBreakpoints[bpKey];
                                return {...prev, breakpoints: nextBreakpoints};
                            });
                        }}
                    >
                        {breakpoints.map((b) => {
                            const size = b?.size ? `(${b.size}px)` : "";
                            const label = [b?.label ?? bpKey, size]
                                .filter(Boolean)
                                .join(" ");
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
                    updateLayoutItem({
                        ...localLayout,
                        breakpoints: {...localLayout.breakpoints, [bpKey]: {}},
                    })
                }
            >
                <LayoutFields
                    bpKey={bpKey}
                    settings={localLayout.breakpoints[bpKey]}
                    updateFn={updateBreakpointItem}
                />
            </ToolsPanel>
        </div>
    ), []);

    // --- Render
    return (
        <div className="wpbs-layout-tools">
            {/* Default section */}
            <div className="wpbs-layout-tools__panel">
                <ToolsPanel
                    label={__("Layout")}
                    resetAll={() => setLocalLayout(prev => ({
                        ...prev,
                        props: {},
                    }))}>
                    <LayoutFields
                        bpKey="layout"
                        settings={localLayout.props}
                        suppress={["padding", "margin", "gap", "outline"]}
                    />
                </ToolsPanel>
            </div>

            {/* Hover section */}
            <div className="wpbs-layout-tools__panel">
                <ToolsPanel
                    label={__("Hover")}
                    resetAll={() => updateLayoutItem({...localLayout, hover: {}})}
                >
                    <Grid
                        columns={1}
                        columnGap={15}
                        rowGap={20}
                        className="wpbs-layout-tools__panel"
                    >
                        <HoverFields
                            settings={localLayout.hover}
                            suppress={["padding", "margin", "gap"]}
                        />
                    </Grid>
                </ToolsPanel>
            </div>

            {/* Breakpoints */}
            {breakpointKeys.map((bpKey) => (
                <BreakpointPanel
                    key={bpKey}
                    bpKey={bpKey}
                    localLayout={localLayout}
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
