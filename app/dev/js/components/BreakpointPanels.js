// BreakpointPanels.js
// Structural repeater for base + responsive layouts.
// Controlled by `value` from parent; no local breakpoint state.

import {useCallback, useMemo} from "@wordpress/element";
import {Button} from "@wordpress/components";

// ------------------------------------------------------------
// Helper: createPanel
// ------------------------------------------------------------
export function createPanel(builderFn) {
    return function PanelComponent({bpKey, entry, update}) {
        return builderFn({bpKey, entry, update});
    };
}

// ------------------------------------------------------------
// BreakpointPanels — structural repeater
// ------------------------------------------------------------
export function BreakpointPanels({value = {}, onChange, render, label}) {
    const themeBreakpoints = WPBS?.settings?.breakpoints || {};

    // ----------------------------------------
    // Breakpoint list (sorted by theme size)
    // ----------------------------------------
    const breakpointDefs = useMemo(() => {
        return Object.entries(themeBreakpoints).map(([key, bp]) => ({
            key,
            label: bp.label,
            size: bp.size,
        }));
    }, [themeBreakpoints]);

    // keys present in value
    const bpKeys = useMemo(() => Object.keys(value || {}), [value]);

    // orderedKeys: base first (virtual), then actual breakpoints sorted by size
    const orderedKeys = useMemo(() => {
        const sorted = [...bpKeys].sort((a, b) => {
            const bpA = breakpointDefs.find((bp) => bp.key === a);
            const bpB = breakpointDefs.find((bp) => bp.key === b);
            return (bpA?.size || 0) - (bpB?.size || 0);
        });
        return ["base", ...sorted];
    }, [bpKeys, breakpointDefs]);

    // ----------------------------------------
    // Update a row (non-base only)
    // ----------------------------------------
    const updateEntry = useCallback(
        (bpKey, data) => {
            if (bpKey === "base") return;

            const entry = value[bpKey] || {};
            const prevProps = entry.props || {};
            const nextProps = data.props || {};

            const next = {
                ...value,
                [bpKey]: {
                    ...entry,
                    props: {
                        ...prevProps,
                        ...nextProps,
                    },
                },
            };

            onChange(next);
        },
        [value, onChange]
    );



    // ----------------------------------------
    // Remove / Rename (non-base only)
// ----------------------------------------
    const removeEntry = useCallback(
        (bpKey, opts = {}) => {
            if (bpKey === "base") return;

            const next = {...value};
            const transfer = opts.transfer || null;

            delete next[bpKey];

            if (transfer && opts.newKey) {
                next[opts.newKey] = transfer;
            }

            onChange(next);
        },
        [value, onChange]
    );

    // ----------------------------------------
    // Add breakpoint
    // ----------------------------------------
    const addBreakpoint = useCallback(() => {
        const existing = Object.keys(value || {});

        const available = breakpointDefs
            .map((bp) => bp.key)
            .filter((key) => !existing.includes(key));

        if (!available.length) return;

        const newKey = available[0];

        const next = {
            ...value,
            [newKey]: {},
        };

        onChange(next);
    }, [value, breakpointDefs, onChange]);

    // ----------------------------------------
    // Render
    // ----------------------------------------
    return (
        <div className="wpbs-layout-tools wpbs-block-controls">
            {orderedKeys.map((bpKey) => {
                const isBase = bpKey === "base";
                const entry = isBase ? {} : (value[bpKey] || {});
                const Panel = isBase ? render.base : render.breakpoints;

                return (
                    <div className="wpbs-layout-tools__panel" key={bpKey}>
                        {/* HEADER */}
                        {(isBase && !label) ? null : (
                            <div className="wpbs-layout-tools__header">
                                {isBase ? (
                                    <strong>{label ?? "Base"}</strong>
                                ) : (
                                    <Button
                                        isSmall
                                        size="small"
                                        iconSize={20}
                                        icon="no-alt"
                                        className="components-button is-small has-icon"
                                        onClick={() => removeEntry(bpKey)}
                                    />
                                )}

                                {!isBase && (
                                    <label className="wpbs-layout-tools__breakpoint">
                                        <select
                                            value={bpKey}
                                            onChange={(e) => {
                                                const newKey = e.target.value;

                                                // prevent duplicate keys
                                                if (
                                                    newKey !== bpKey &&
                                                    Object.keys(value || {}).includes(newKey)
                                                ) {
                                                    return;
                                                }

                                                removeEntry(bpKey, {
                                                    transfer: entry,
                                                    newKey,
                                                });
                                            }}
                                        >
                                            {breakpointDefs.map((bp) => {
                                                const disabled =
                                                    bp.key !== bpKey &&
                                                    Object.keys(value || {}).includes(bp.key);

                                                return (
                                                    <option
                                                        key={bp.key}
                                                        value={bp.key}
                                                        disabled={disabled}
                                                    >
                                                        {bp.label} ({bp.size}px)
                                                    </option>
                                                );
                                            })}
                                        </select>
                                    </label>
                                )}
                            </div>
                        )}

                        {/* PANEL CONTENT */}
                        <div className="wpbs-layout-tools__grid">
                            <Panel
                                bpKey={bpKey}
                                entry={entry}
                                update={(data) => updateEntry(bpKey, data)}
                            />
                        </div>
                    </div>
                );
            })}

            {/* ADD BREAKPOINT */}
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
