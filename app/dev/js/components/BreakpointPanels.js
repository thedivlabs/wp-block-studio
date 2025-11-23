// BreakpointPanels.js
// Compatible with:
// {
//   props: { ... },
//   breakpoints: { xs:{...}, md:{...} }
// }
// NO "base" key. NO nested props inside breakpoints.

import {useCallback, useMemo} from "@wordpress/element";
import {Button} from "@wordpress/components";
import _ from "lodash";

// Public helper for custom builder syntax
export function createPanel(builderFn) {
    return function PanelComponent({bpKey, entry, update}) {
        return builderFn({bpKey, entry, update});
    };
}

export function BreakpointPanels({value = {}, onChange, render, label}) {
    const themeBreakpoints = WPBS?.settings?.breakpoints || {};

    // Extract base + breakpoints from value
    const props = value.props || {};
    const breakpoints = value.breakpoints || {};

    // Build sorted breakpoint list
    const breakpointDefs = useMemo(() => {
        return Object.entries(themeBreakpoints).map(([key, bp]) => ({
            key,
            label: bp.label,
            size: bp.size,
        }));
    }, [themeBreakpoints]);

    const orderedBpKeys = useMemo(() => {
        return Object.keys(breakpoints).sort((a, b) => {
            const A = breakpointDefs.find((bp) => bp.key === a);
            const B = breakpointDefs.find((bp) => bp.key === b);
            return (A?.size || 0) - (B?.size || 0);
        });
    }, [breakpoints, breakpointDefs]);

    // ----------------------------------------
    // UPDATE BASE PROPS
    // ----------------------------------------
    const updateBase = (data) => {
        const nextProps = _.merge({}, value.props || {}, data);
        const nextBreakpoints = _.merge({}, value.breakpoints || {});

        onChange({
            props: nextProps,
            breakpoints: nextBreakpoints
        });
    };


    // ----------------------------------------
    // UPDATE BREAKPOINT PROPS
    // ----------------------------------------
    const updateEntry = (bpKey, data) => {
        const prevBreakpoints = value.breakpoints || {};
        const prevEntry = prevBreakpoints[bpKey] || {};

        const nextEntry = _.merge({}, prevEntry, data);

        const nextBreakpoints = _.merge({}, prevBreakpoints, {
            [bpKey]: nextEntry
        });

        const nextProps = _.merge({}, value.props || {});

        onChange({
            props: nextProps,
            breakpoints: nextBreakpoints
        });
    };


    // ----------------------------------------
    // REMOVE OR RENAME A BREAKPOINT ROW
    // ----------------------------------------
    const removeEntry = (bpKey, opts = {}) => {
        const existing = breakpoints[bpKey] || {};
        const next = {...breakpoints};
        delete next[bpKey];

        if (opts.transfer && opts.newKey) {
            next[opts.newKey] = opts.transfer;
        }

        onChange({
            props: {...props},
            breakpoints: next,
        });
    };

    // ----------------------------------------
    // ADD NEW BREAKPOINT
    // ----------------------------------------
    const addBreakpoint = useCallback(() => {
        const existingKeys = Object.keys(breakpoints);

        const available = breakpointDefs
            .map((bp) => bp.key)
            .filter((k) => !existingKeys.includes(k));

        if (!available.length) return;

        const newKey = available[0];

        onChange({
            props: {...props},
            breakpoints: {
                ...breakpoints,
                [newKey]: {},
            },
        });
    }, [props, breakpoints, breakpointDefs, onChange]);

    // ----------------------------------------
    // RENDER
    // ----------------------------------------
    return (
        <div className="wpbs-layout-tools wpbs-block-controls">

            {/* BASE PANEL */}
            <div className="wpbs-layout-tools__panel" key="base">
                <div className="wpbs-layout-tools__header">
                    <strong>{label ?? "Base"}</strong>
                </div>

                <div className="wpbs-layout-tools__grid">
                    {render.base({
                        bpKey: "base",
                        entry: props,
                        update: updateBase,
                    })}
                </div>
            </div>

            {/* BREAKPOINT PANELS */}
            {orderedBpKeys.map((bpKey) => {
                const entry = breakpoints[bpKey] || {};
                const bpDef = breakpointDefs.find((bp) => bp.key === bpKey);

                return (
                    <div className="wpbs-layout-tools__panel" key={bpKey}>

                        <div className="wpbs-layout-tools__header">
                            <Button
                                isSmall
                                icon="no-alt"
                                onClick={() => removeEntry(bpKey)}
                            />

                            <label className="wpbs-layout-tools__breakpoint">
                                <select
                                    value={bpKey}
                                    onChange={(e) => {
                                        const newKey = e.target.value;
                                        if (
                                            newKey !== bpKey &&
                                            breakpoints[newKey]
                                        ) return;

                                        removeEntry(bpKey, {
                                            transfer: entry,
                                            newKey,
                                        });
                                    }}
                                >
                                    {breakpointDefs.map((bp) => (
                                        <option
                                            key={bp.key}
                                            value={bp.key}
                                            disabled={breakpoints[bp.key] && bp.key !== bpKey}
                                        >
                                            {bp.label} ({bp.size}px)
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>

                        <div className="wpbs-layout-tools__grid">
                            {render.breakpoints({
                                bpKey,
                                entry,
                                update: (data) => updateEntry(bpKey, data),
                            })}
                        </div>

                    </div>
                );
            })}

            {/* ADD */}
            <Button
                isPrimary
                onClick={addBreakpoint}
                style={{
                    borderRadius: 0,
                    width: "100%",
                    textAlign: "center",
                    gridColumn: "1 / -1",
                }}
            >
                Add Breakpoint
            </Button>

        </div>
    );
}
