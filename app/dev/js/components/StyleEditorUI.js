import { useState, useEffect, useMemo, useCallback } from "@wordpress/element";
import { Field } from "Components/Field";
import _ from "lodash";
import {
    Button,
    __experimentalToolsPanel as ToolsPanel,
} from "@wordpress/components";
import { __ } from "@wordpress/i18n";

const API = window?.WPBS_StyleEditor ?? {};
const { cleanObject } = API;

export const StyleEditorUI = ({ settings, updateStyleSettings }) => {
    const [localLayout, setLocalLayout] = useState(settings);

    // Debounced state updater that accepts commit flag
    const updateLocalLayout = useCallback(() => {
        const debounced = _.debounce((next) => setLocalLayout(next), 900);

        return (nextLayout, commit = false) => {
            if (commit) {
                debounced.cancel();
                setLocalLayout(nextLayout);
            } else {
                debounced(nextLayout);
            }
        };
    }, [setLocalLayout])();

    // Watch raw localLayout and only push meaningful changes to HOC
    useEffect(() => {
        const cleanedLocal = cleanObject(localLayout ?? {}, true);
        const cleanedSettings = cleanObject(settings ?? {}, true);

        // Only trigger update when cleaned versions differ
        if (!_.isEqual(cleanedLocal, cleanedSettings)) {
            updateStyleSettings(localLayout);
        } else {
            console.log(localLayout);
            console.log('nothing to update');
        }
    }, [localLayout, updateStyleSettings]);

    const breakpoints = useMemo(() => {
        const bps = WPBS?.settings?.breakpoints ?? {};
        return Object.entries(bps).map(([key, { label, size }]) => ({
            key,
            label,
            size,
        }));
    }, []);

    // --- Update helpers ------------------------------------------------------

    const updateLayoutItem = useCallback(
        (newProps) => {
            const next = {
                ...localLayout,
                props: { ...localLayout.props, ...newProps },
            };
            updateLocalLayout(next);
        },
        [localLayout, updateLocalLayout]
    );

    const updateHoverItem = useCallback(
        (newProps) => {
            const next = {
                ...localLayout,
                hover: { ...localLayout.hover, ...newProps },
            };
            updateLocalLayout(next);
        },
        [localLayout, updateLocalLayout]
    );

    const updateBreakpointItem = useCallback(
        (updates, bpKey) => {
            const current =
                localLayout.breakpoints?.[bpKey] || { props: {}, background: {} };

            const nextBP = {
                props: { ...current.props },
                background: { ...current.background },
            };

            if (updates.props) Object.assign(nextBP.props, updates.props);
            if (updates.background) Object.assign(nextBP.background, updates.background);

            for (const [key, value] of Object.entries(updates)) {
                if (key !== "props" && key !== "background") nextBP.props[key] = value;
            }

            const next = {
                ...localLayout,
                breakpoints: {
                    ...localLayout.breakpoints,
                    [bpKey]: nextBP,
                },
            };
            updateLocalLayout(next);
        },
        [localLayout, updateLocalLayout]
    );

    // --- Breakpoint management -----------------------------------------------

    const addBreakpointPanel = useCallback(() => {
        const keys = Object.keys(localLayout.breakpoints || {});
        if (keys.length >= 3) return;

        const available = breakpoints
            .map((bp) => bp.key)
            .filter((bp) => !keys.includes(bp));
        if (!available.length) return;

        const newKey = available[0];
        const next = {
            ...localLayout,
            breakpoints: { ...localLayout.breakpoints, [newKey]: {} },
        };

        // structural change → bypass debounce
        updateLocalLayout(next, true);
    }, [breakpoints, localLayout, updateLocalLayout]);

    const removeBreakpointPanel = useCallback(
        (bpKey) => {
            const { [bpKey]: _, ...rest } = localLayout.breakpoints;
            const next = { ...localLayout, breakpoints: rest };
            updateLocalLayout(next, true);
        },
        [localLayout, updateLocalLayout]
    );

    const breakpointKeys = useMemo(() => {
        const keys = Object.keys(localLayout?.breakpoints || {});
        return keys.sort((a, b) => {
            const bpA = breakpoints.find((bp) => bp.key === a);
            const bpB = breakpoints.find((bp) => bp.key === b);
            return (bpA?.size || 0) - (bpB?.size || 0);
        });
    }, [localLayout?.breakpoints, breakpoints]);

    // --- Field maps -----------------------------------------------------------

    const LayoutFields = useMemo(() => {
        const { layoutFieldsMap: map = [] } = window?.WPBS_StyleEditor ?? {};
        return ({ bpKey, settings, suppress = [], updateFn }) =>
            map
                .filter((f) => !suppress.includes(f.slug))
                .map((field) => {
                    const callback = (v) =>
                        updateFn
                            ? updateFn({ [field.slug]: v }, bpKey)
                            : updateLayoutItem({ [field.slug]: v });

                    return (
                        <Field
                            key={`${bpKey || "base"}-${field.slug}`}
                            field={field}
                            settings={settings}
                            callback={callback}
                        />
                    );
                });
    }, [updateLayoutItem, updateBreakpointItem]);

    const HoverFields = useMemo(() => {
        const { hoverFieldsMap: map = [] } = window?.WPBS_StyleEditor ?? {};
        return ({ settings, suppress = [] }) =>
            map
                .filter((f) => !suppress.includes(f.slug))
                .map((field) => (
                    <Field
                        key={field.slug}
                        field={field}
                        settings={settings}
                        callback={(v) => updateHoverItem({ [field.slug]: v })}
                    />
                ));
    }, [updateHoverItem]);

    const BreakpointPanel = useMemo(
        () =>
            ({
                 bpKey,
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
                                    const nextBreakpoints = { ...localLayout.breakpoints };
                                    nextBreakpoints[newKey] = nextBreakpoints[bpKey];
                                    delete nextBreakpoints[bpKey];

                                    const next = {
                                        ...localLayout,
                                        breakpoints: nextBreakpoints,
                                    };
                                    updateLocalLayout(next, true);
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
                                            disabled={
                                                b.key !== bpKey && breakpointKeys.includes(b.key)
                                            }
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
                            settings={localLayout.breakpoints[bpKey]?.props || {}}
                            updateFn={(newProps) =>
                                updateBreakpointItem({ props: newProps }, bpKey)
                            }
                        />
                    </ToolsPanel>
                </div>
            ),
        [localLayout, updateLocalLayout, breakpoints, updateBreakpointItem]
    );

    // --- Render ---------------------------------------------------------------

    return (
        <div className="wpbs-layout-tools">
            <div className="wpbs-layout-tools__panel">
                <ToolsPanel
                    label={__("Layout")}
                    resetAll={() => {
                        const next = { ...localLayout, props: {} };
                        updateLocalLayout(next, true);
                    }}
                >
                    <LayoutFields
                        bpKey="layout"
                        settings={localLayout.props}
                        suppress={["padding", "margin", "gap", "outline"]}
                    />
                </ToolsPanel>
            </div>

            <div className="wpbs-layout-tools__panel">
                <ToolsPanel
                    label={__("Hover")}
                    resetAll={() => {
                        const next = { ...localLayout, hover: {} };
                        updateLocalLayout(next, true);
                    }}
                >
                    <HoverFields
                        settings={localLayout.hover}
                        suppress={["padding", "margin", "gap"]}
                    />
                </ToolsPanel>
            </div>

            {breakpointKeys.map((bpKey) => (
                <BreakpointPanel
                    key={bpKey}
                    bpKey={bpKey}
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