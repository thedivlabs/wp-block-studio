import {useCallback, useMemo} from "@wordpress/element";
import {Button} from "@wordpress/components";

//
// BreakpointPanels
// Patch-based, no slug-based updates.
// Inner panels send patch objects (e.g. { "font-size": "20px" }).
// This file merges those patches into full entries.
//

export function BreakpointPanels({value = {}, onChange, render, label}) {
    const themeBreakpoints = WPBS?.settings?.breakpoints || {};

    //
    // Normalize incoming shape
    //
    const {breakpoints = {}, ...baseEntry} = value || {};

    const normalizedBaseEntry = {
        props: baseEntry.props || {},
        ...baseEntry,
    };

    //
    // Prepare breakpoint list
    //
    const breakpointDefs = useMemo(() => {
        return Object.entries(themeBreakpoints).map(([key, bp]) => ({
            key,
            label: bp.label,
            size: bp.size,
        }));
    }, [themeBreakpoints]);

    // Sort DESCENDING (largest first)
    const orderedBpKeys = useMemo(() => {
        return Object.keys(breakpoints).sort((a, b) => {
            const A = breakpointDefs.find((bp) => bp.key === a);
            const B = breakpointDefs.find((bp) => bp.key === b);
            return (B?.size || 0) - (A?.size || 0);
        });
    }, [breakpoints, breakpointDefs]);

    //
    // Base entry updater (receives FULL ENTRY PATCH)
    //
    const updateBase = useCallback(
        (partialEntry) => {
            const nextEntry = {
                ...normalizedBaseEntry,
                ...partialEntry, // merge patch
                props: {
                    ...(normalizedBaseEntry.props || {}),
                    ...(partialEntry?.props || {}),
                },
            };

            onChange({
                ...nextEntry,
                breakpoints,
            });
        },
        [normalizedBaseEntry, breakpoints, onChange]
    );

    //
    // Breakpoint entry updater (FULL ENTRY PATCH)
    //
    const updateBreakpoint = useCallback(
        (bpKey, partialEntry) => {
            const current = breakpoints[bpKey] || {props: {}};

            const nextEntry = {
                ...current,
                ...partialEntry,
                props: {
                    ...(current.props || {}),
                    ...(partialEntry?.props || {}),
                },
            };

            const nextBreakpoints = {
                ...breakpoints,
                [bpKey]: nextEntry,
            };

            onChange({
                ...normalizedBaseEntry,
                breakpoints: nextBreakpoints,
            });
        },
        [normalizedBaseEntry, breakpoints, onChange]
    );

    //
    // Remove breakpoint
    //
    const removeBreakpoint = useCallback(
        (bpKey) => {
            const next = {...breakpoints};
            delete next[bpKey];

            onChange({
                ...normalizedBaseEntry,
                breakpoints: next,
            });
        },
        [normalizedBaseEntry, breakpoints, onChange]
    );

    //
    // Rename breakpoint
    //
    const renameBreakpoint = useCallback(
        (oldKey, newKey) => {
            if (!breakpoints[oldKey]) return;
            if (breakpoints[newKey]) return;
            if (newKey === oldKey) return;

            const entry = breakpoints[oldKey];

            const next = {...breakpoints};
            delete next[oldKey];
            next[newKey] = entry;

            onChange({
                ...normalizedBaseEntry,
                breakpoints: next,
            });
        },
        [normalizedBaseEntry, breakpoints, onChange]
    );

    //
    // Add new breakpoint
    //
    const addBreakpoint = useCallback(() => {
        const existing = Object.keys(breakpoints);

        const available = breakpointDefs
            .map((bp) => bp.key)
            .filter((k) => !existing.includes(k));

        if (!available.length) return;

        const newKey = available[0];

        const next = {
            ...breakpoints,
            [newKey]: {props: {}},
        };

        onChange({
            ...normalizedBaseEntry,
            breakpoints: next,
        });
    }, [normalizedBaseEntry, breakpoints, breakpointDefs, onChange]);

    //
    // RENDER
    //
    return (
        <div className="wpbs-layout-tools wpbs-block-controls">
            {/* Base Panel */}
            <div className="wpbs-layout-tools__panel" key="base">
                <div className="wpbs-layout-tools__header">
                    <strong>{label ?? "Base"}</strong>
                </div>

                <div className="wpbs-layout-tools__grid">
                    {render.base({
                        bpKey: "base",
                        entry: normalizedBaseEntry,
                        update: updateBase,
                    })}
                </div>
            </div>

            {/* Breakpoint Panels */}
            {orderedBpKeys.map((bpKey) => {
                const raw = breakpoints[bpKey] || {};
                const entry = {
                    props: raw.props || {},
                    ...raw,
                };

                return (
                    <div className="wpbs-layout-tools__panel" key={bpKey}>
                        <div className="wpbs-layout-tools__header">
                            <Button
                                isSmall
                                icon="no-alt"
                                onClick={() => removeBreakpoint(bpKey)}
                            />

                            <label className="wpbs-layout-tools__breakpoint">
                                <select
                                    value={bpKey}
                                    onChange={(e) => {
                                        const newKey = e.target.value;
                                        renameBreakpoint(bpKey, newKey);
                                    }}
                                >
                                    {breakpointDefs.map((bp) => (
                                        <option
                                            key={bp.key}
                                            value={bp.key}
                                            disabled={
                                                breakpoints[bp.key] && bp.key !== bpKey
                                            }
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
                                update: (partial) => updateBreakpoint(bpKey, partial),
                            })}
                        </div>
                    </div>
                );
            })}

            {/* Add Btn */}
            <Button
                isPrimary
                onClick={addBreakpoint}
                style={{
                    borderRadius: 0,
                    width: "100%",
                    textAlign: "center",
                    marginTop: "8px",
                }}
            >
                Add Breakpoint
            </Button>
        </div>
    );
}
