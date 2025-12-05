import {useCallback, useMemo} from "@wordpress/element";
import {Button} from "@wordpress/components";

export function BreakpointPanels({value = {}, onChange, render, label}) {
    const themeBreakpoints = WPBS?.settings?.breakpoints || {};

    const {
        breakpoints = {},
        ...baseEntry
    } = value || {};

    const normalizedBaseEntry = {
        props: baseEntry.props || {},
        ...baseEntry,
    };

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
            return (B?.size || 0) - (A?.size || 0);
        });
    }, [breakpoints, breakpointDefs]);

    // FIX #1 — MERGE base entry instead of overwriting
    const updateBase = useCallback(
        (nextEntry) => {
            const merged = {
                ...normalizedBaseEntry,
                ...nextEntry,
                props: {
                    ...(normalizedBaseEntry.props || {}),
                    ...(nextEntry?.props || {}),
                },
                breakpoints,
            };
            onChange(merged);
        },
        [breakpoints, normalizedBaseEntry, onChange]
    );


    // FIX #2 — DEEP MERGE breakpoint entries instead of replacing
    const updateBreakpoint = useCallback(
        (bpKey, nextEntry) => {
            const prev = breakpoints[bpKey] || {};

            const mergedEntry = {
                ...prev,
                ...nextEntry,
                props: {
                    ...(prev.props || {}),
                    ...(nextEntry?.props || {}),
                },
            };

            const nextBreakpoints = {
                ...breakpoints,
                [bpKey]: mergedEntry,
            };

            onChange({
                ...normalizedBaseEntry,
                breakpoints: nextBreakpoints,
            });
        },
        [normalizedBaseEntry, breakpoints, onChange]
    );

    const removeBreakpoint = useCallback(
        (bpKey) => {
            const next = {...breakpoints};
            delete next[bpKey];     // <-- the key change

            onChange({
                ...normalizedBaseEntry,
                breakpoints: next,
            });
        },
        [normalizedBaseEntry, breakpoints, onChange]
    );


    const renameBreakpoint = useCallback(
        (oldKey, newKey) => {
            if (newKey === oldKey) return;
            if (!breakpoints[oldKey]) return;
            if (breakpoints[newKey]) return;

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

    const addBreakpoint = useCallback(() => {
        const existingKeys = Object.keys(breakpoints);

        const available = breakpointDefs
            .map((bp) => bp.key)
            .filter((k) => !existingKeys.includes(k));

        if (!available.length) return;

        const newKey = available[0];

        const nextBreakpoints = {
            ...breakpoints,
            [newKey]: {
                props: {},   // MUST EXIST
            },
        };

        onChange({
            ...normalizedBaseEntry,
            breakpoints: nextBreakpoints,
        });
    }, [normalizedBaseEntry, breakpoints, breakpointDefs, onChange]);

    return (
        <div className="wpbs-layout-tools wpbs-block-controls">
            <div className="wpbs-layout-tools__panel" key="base">
                {label && <div className="wpbs-layout-tools__header">
                    <strong>{label}</strong>
                </div>}

                <div className="wpbs-layout-tools__grid">
                    {render.base({
                        bpKey: "base",
                        entry: normalizedBaseEntry,
                        update: (nextEntry) => updateBase(nextEntry),
                    })}
                </div>
            </div>

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
                                        if (newKey !== bpKey && breakpoints[newKey]) return;
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
                                update: (nextEntry) => updateBreakpoint(bpKey, nextEntry),
                            })}
                        </div>
                    </div>
                );
            })}

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
