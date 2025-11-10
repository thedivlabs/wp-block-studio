import {
    useState,
    useEffect,
    useMemo,
    useCallback,
    memo
} from "@wordpress/element";
import {
    Button,
    __experimentalToolsPanel as ToolsPanel
} from "@wordpress/components";
import {__} from "@wordpress/i18n";
import _ from "lodash";
import {Field} from "Components/Field";

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
            const callback = (v) =>
                updateFn({[field.slug]: v}, bpKey);

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

    return map
        .filter((f) => !suppress.includes(f.slug))
        .map((field) => (
            <Field
                key={field.slug}
                field={field}
                settings={settings}
                callback={(v) => updateHoverItem({[field.slug]: v})}
            />
        ));
});

/* -------------------------------------------------------------------------- */
/* BreakpointPanel – fully isolated per-breakpoint UI */
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

                // Ensure we always have a breakpoints object
                const currentBreakpoints = localLayout.breakpoints || {};

                // Prevent renaming to an existing key
                if (breakpointKeys.includes(newKey)) return;

                // Clone and move data
                const nextBreakpoints = {...currentBreakpoints};
                nextBreakpoints[newKey] = nextBreakpoints[bpKey];
                delete nextBreakpoints[bpKey];

                const next = {
                    ...localLayout,
                    breakpoints: nextBreakpoints,
                };

                // Commit immediately (structural change)
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
                    />
                </ToolsPanel>
            </div>
        );
    },
    (prev, next) => _.isEqual(prev.data, next.data)
);


/* -------------------------------------------------------------------------- */
/* Main Component */
/* -------------------------------------------------------------------------- */
export const StyleEditorUI = ({settings, updateStyleSettings}) => {
    /* ----------------------------- Local state ----------------------------- */
    const [localLayout, setLocalLayout] = useState(
        settings || {props: {}, breakpoints: {}, hover: {}, background: {}}
    );

    /* --------------------------- Debounced updater ------------------------- */
    const updateLocalLayout = useMemo(() => {
        const debounced = _.debounce((next) => setLocalLayout(next), 600);
        return (nextLayout, commit = false) => {
            if (commit) {
                debounced.cancel();
                setLocalLayout(nextLayout);
            } else {
                debounced(nextLayout);
            }
        };
    }, []);

    useEffect(() => {
        return () => updateLocalLayout.cancel?.();
    }, [updateLocalLayout]);

    /* -------------------------- Sync to HOC props -------------------------- */
    useEffect(() => {
        const cleanedLocal = cleanObject(localLayout ?? {}, true);
        const cleanedSettings = cleanObject(settings ?? {}, true);
        if (!_.isEqual(cleanedLocal, cleanedSettings)) {
            updateStyleSettings(localLayout);
        }
    }, [localLayout, settings, updateStyleSettings]);

    /* ----------------------------- Breakpoints ----------------------------- */
    const breakpoints = useMemo(() => {
        const bps = WPBS?.settings?.breakpoints ?? {};
        return Object.entries(bps).map(([key, {label, size}]) => ({
            key,
            label,
            size,
        }));
    }, []);

    const breakpointKeys = useMemo(() => {
        const keys = Object.keys(localLayout?.breakpoints || {});
        return keys.sort((a, b) => {
            const bpA = breakpoints.find((bp) => bp.key === a);
            const bpB = breakpoints.find((bp) => bp.key === b);
            return (bpA?.size || 0) - (bpB?.size || 0);
        });
    }, [localLayout?.breakpoints, breakpoints]);

    /* ------------------------------ Updaters ------------------------------- */
    const updateLayoutItem = useCallback(
        (newProps) => {
            const next = {
                ...localLayout,
                props: {...localLayout.props, ...newProps},
            };
            updateLocalLayout(next);
        },
        [localLayout, updateLocalLayout]
    );

    const updateHoverItem = useCallback(
        (newProps) => {
            const next = {
                ...localLayout,
                hover: {...localLayout.hover, ...newProps},
            };
            updateLocalLayout(next);
        },
        [localLayout, updateLocalLayout]
    );

    const updateBreakpointItem = useCallback(
        (updates, bpKey) => {
            const current =
                localLayout.breakpoints?.[bpKey] || {props: {}, background: {}};

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

    /* --------------------------- Panel management -------------------------- */
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
            breakpoints: {...localLayout.breakpoints, [newKey]: {}},
        };
        updateLocalLayout(next, true);
    }, [breakpoints, localLayout, updateLocalLayout]);

    const removeBreakpointPanel = useCallback(
        (bpKey) => {
            const {[bpKey]: _, ...rest} = localLayout.breakpoints;
            const next = {...localLayout, breakpoints: rest};
            updateLocalLayout(next, true);
        },
        [localLayout, updateLocalLayout]
    );

    /* ------------------------------- Render -------------------------------- */
    return (
        <div className="wpbs-layout-tools">
            {/* Layout */}
            <div className="wpbs-layout-tools__panel">
                <ToolsPanel
                    label={__("Layout")}
                    resetAll={() => {
                        const next = {...localLayout, props: {}};
                        updateLocalLayout(next, true);
                    }}
                >
                    <LayoutFields
                        bpKey="layout"
                        settings={localLayout.props}
                        suppress={["padding", "margin", "gap", "outline"]}
                        updateFn={(p) => updateLayoutItem(p)}
                    />
                </ToolsPanel>
            </div>

            {/* Hover */}
            <div className="wpbs-layout-tools__panel">
                <ToolsPanel
                    label={__("Hover")}
                    resetAll={() => {
                        const next = {...localLayout, hover: {}};
                        updateLocalLayout(next, true);
                    }}
                >
                    <HoverFields
                        settings={localLayout.hover}
                        suppress={["padding", "margin", "gap"]}
                        updateHoverItem={updateHoverItem}
                    />
                </ToolsPanel>
            </div>

            {/* Breakpoints */}
            {breakpointKeys.map((bpKey) => (
                <BreakpointPanel
                    key={bpKey}
                    bpKey={bpKey}
                    data={localLayout.breakpoints[bpKey] || {props: {}, background: {}}}
                    localLayout={localLayout}  // ✅ make sure this is passed
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
    );
};
