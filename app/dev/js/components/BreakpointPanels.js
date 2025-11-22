// BreakpointPanels.js
// Fully working version with correct local state + sorting + add/remove/rename.

import { useState, useEffect, useCallback, useMemo } from "@wordpress/element";
import { Button } from "@wordpress/components";

// ------------------------------------------------------------
// Helper: createPanel
// ------------------------------------------------------------
export function createPanel(builderFn) {
    return function PanelComponent({ bpKey, entry, update }) {
        return builderFn({ bpKey, entry, update });
    };
}

// ------------------------------------------------------------
// BreakpointPanels — structural repeater
// ------------------------------------------------------------
export function BreakpointPanels({ value = {}, onChange, renderFields }) {
    const themeBreakpoints = WPBS?.settings?.breakpoints || {};

    // ----------------------------------------
    // LOCAL STATE (CRITICAL)
    // ----------------------------------------
    const [localBps, setLocalBps] = useState(() => {
        if (!value || typeof value !== "object" || Object.keys(value).length === 0) {
            return { base: {} };
        }
        if (!value.base) return { base: {}, ...value };
        return value;
    });

    // Sync when block updates externally
    useEffect(() => {
        if (!value || typeof value !== "object") return;

        if (Object.keys(value).length === 0) {
            setLocalBps({ base: {} });
            return;
        }

        if (!value.base) {
            setLocalBps({ base: {}, ...value });
            return;
        }

        setLocalBps(value);
    }, [value]);

    // ----------------------------------------
    // Breakpoint list (sorted)
    // ----------------------------------------
    const breakpoints = useMemo(() => {
        return Object.entries(themeBreakpoints).map(([key, bp]) => ({
            key,
            label: bp.label,
            size: bp.size
        }));
    }, [themeBreakpoints]);

    // Ordered keys (base first, then sorted by size)
    const orderedKeys = useMemo(() => {
        return Object.keys(localBps).sort((a, b) => {
            if (a === "base") return -1;
            if (b === "base") return 1;

            const bpA = breakpoints.find(bp => bp.key === a);
            const bpB = breakpoints.find(bp => bp.key === b);
            return (bpA?.size || 0) - (bpB?.size || 0);
        });
    }, [localBps, breakpoints]);

    // ----------------------------------------
    // Update a row
    // ----------------------------------------
    const updateEntry = useCallback(
        (bpKey, data) => {
            const next = {
                ...localBps,
                [bpKey]: { ...localBps[bpKey], ...data }
            };
            setLocalBps(next);
            onChange(next);
        },
        [localBps, onChange]
    );

    // ----------------------------------------
    // Remove / Rename
    // ----------------------------------------
    const removeEntry = useCallback(
        (bpKey, opts = {}) => {
            const next = { ...localBps };
            delete next[bpKey];

            if (opts.transfer && opts.newKey) {
                next[opts.newKey] = opts.transfer;
            }

            setLocalBps(next);
            onChange(next);
        },
        [localBps, onChange]
    );

    // ----------------------------------------
    // Add breakpoint
    // ----------------------------------------
    const addBreakpoint = useCallback(() => {
        const existing = Object.keys(localBps);

        const available = breakpoints
            .map((bp) => bp.key)
            .filter((key) => !existing.includes(key));

        if (!available.length) return;

        const newKey = available[0];

        const next = {
            ...localBps,
            [newKey]: {}
        };

        setLocalBps(next);
        onChange(next);
    }, [localBps, breakpoints, onChange]);

    // ----------------------------------------
    // Render
    // ----------------------------------------
    return (
        <div className="wpbs-layout-tools wpbs-block-controls">

            {orderedKeys.map((bpKey) => {
                const entry = localBps[bpKey] || {};
                const isBase = bpKey === "base";
                const Panel = isBase ? renderFields.base : renderFields.breakpoints;

                return (
                    <div className="wpbs-layout-tools__panel" key={bpKey}>

                        {/* HEADER */}
                        <div className="wpbs-layout-tools__header">
                            {isBase ? (
                                <strong>
                                    {renderFields.base?.label ?? "Base"}
                                </strong>
                            ) : (
                                <Button
                                    isSmall
                                    className="components-button is-small has-icon"
                                    onClick={() => removeEntry(bpKey)}
                                >
                                    <span className="dashicon dashicons-no-alt"></span>
                                </Button>
                            )}

                            {!isBase && (
                                <label className="wpbs-layout-tools__breakpoint">
                                    <select
                                        value={bpKey}
                                        onChange={(e) => {
                                            const newKey = e.target.value;

                                            // prevent duplicate
                                            if (
                                                newKey !== bpKey &&
                                                Object.keys(localBps).includes(newKey)
                                            ) return;

                                            removeEntry(bpKey, {
                                                transfer: entry,
                                                newKey
                                            });
                                        }}
                                    >
                                        {breakpoints.map((bp) => {
                                            const disabled =
                                                bp.key !== bpKey &&
                                                Object.keys(localBps).includes(bp.key);

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
                    borderRadius: 4,
                    width: "100%",
                    textAlign: "center",
                    gridColumn: "1 / -1"
                }}
            >
                Add Breakpoint
            </Button>
        </div>
    );
}