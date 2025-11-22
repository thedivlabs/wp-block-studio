// BreakpointPanels.js (safe version)
// With full normalization so empty objects NEVER break anything.

import {useState, useEffect, useCallback, useMemo} from "@wordpress/element";
import {Button} from "@wordpress/components";

/* ------------------------------------------------------------
 * Helper: createPanel
 * ------------------------------------------------------------ */
export function createPanel(builderFn) {
    return function PanelComponent({bpKey, entry, update}) {
        return builderFn({bpKey, entry, update});
    };
}

/* ------------------------------------------------------------
 * Normalize any entry into a safe shape
 * ------------------------------------------------------------ */
function normalizeEntry(entry) {
    if (!entry || typeof entry !== "object") {
        return {props: {}};
    }
    return {
        props: entry.props || {},
    };
}

/* ------------------------------------------------------------
 * Normalize entire breakpoints object
 * ------------------------------------------------------------ */
function normalizeAll(bps = {}) {
    const out = {};
    for (const [key, val] of Object.entries(bps)) {
        out[key] = normalizeEntry(val);
    }
    return out;
}

/* ------------------------------------------------------------
 * BreakpointPanels — structural repeater
 * ------------------------------------------------------------ */
export function BreakpointPanels({value = {}, onChange, render, label}) {
    const themeBreakpoints = WPBS?.settings?.breakpoints || {};

    /* ----------------------------------------
     * LOCAL STATE (CRITICAL)
     * ---------------------------------------- */
    const [localBps, setLocalBps] = useState(() => {
        // If nothing exists → make base props
        if (!value || typeof value !== "object" || Object.keys(value).length === 0) {
            return {base: {props: {}}};
        }

        // If no base → insert one
        if (!value.base) {
            return {
                base: {props: {}},
                ...normalizeAll(value),
            };
        }

        return normalizeAll(value);
    });

    /* ----------------------------------------
     * EXTERNAL SYNC
     * ---------------------------------------- */
    useEffect(() => {
        if (!value || typeof value !== "object") {
            setLocalBps({base: {props: {}}});
            return;
        }

        if (Object.keys(value).length === 0) {
            setLocalBps({base: {props: {}}});
            return;
        }

        if (!value.base) {
            setLocalBps({
                base: {props: {}},
                ...normalizeAll(value),
            });
            return;
        }

        setLocalBps(normalizeAll(value));
    }, [value]);

    /* ----------------------------------------
     * Breakpoint list (sorted)
     * ---------------------------------------- */
    const breakpoints = useMemo(() => {
        return Object.entries(themeBreakpoints).map(([key, bp]) => ({
            key,
            label: bp.label,
            size: bp.size,
        }));
    }, [themeBreakpoints]);

    /* ----------------------------------------
     * Ordered keys
     * ---------------------------------------- */
    const orderedKeys = useMemo(() => {
        return Object.keys(localBps).sort((a, b) => {
            if (a === "base") return -1;
            if (b === "base") return 1;

            const bpA = breakpoints.find((bp) => bp.key === a);
            const bpB = breakpoints.find((bp) => bp.key === b);
            return (bpA?.size || 0) - (bpB?.size || 0);
        });
    }, [localBps, breakpoints]);

    /* ----------------------------------------
     * Update a row (safe)
     * ---------------------------------------- */
    const updateEntry = useCallback(
        (bpKey, data) => {
            const safeExisting = normalizeEntry(localBps[bpKey]);
            const safeData = normalizeEntry(data);

            const next = {
                ...localBps,
                [bpKey]: {
                    props: {
                        ...safeExisting.props,
                        ...safeData.props,
                    },
                },
            };

            setLocalBps(next);
            onChange(next);
        },
        [localBps, onChange]
    );

    /* ----------------------------------------
     * Remove / Rename
     * ---------------------------------------- */
    const removeEntry = useCallback(
        (bpKey, opts = {}) => {
            const next = {...localBps};
            const transfer = normalizeEntry(opts.transfer);

            delete next[bpKey];

            if (opts.transfer && opts.newKey) {
                next[opts.newKey] = transfer;
            }

            setLocalBps(next);
            onChange(next);
        },
        [localBps, onChange]
    );

    /* ----------------------------------------
     * Add breakpoint
     * ---------------------------------------- */
    const addBreakpoint = useCallback(() => {
        const existing = Object.keys(localBps);

        const available = breakpoints
            .map((bp) => bp.key)
            .filter((key) => !existing.includes(key));

        if (!available.length) return;

        const newKey = available[0];

        const next = {
            ...localBps,
            [newKey]: {props: {}},
        };

        setLocalBps(next);
        onChange(next);
    }, [localBps, breakpoints, onChange]);

    /* ----------------------------------------
     * Render
     * ---------------------------------------- */
    return (
        <div className="wpbs-layout-tools wpbs-block-controls">
            {orderedKeys.map((bpKey) => {
                const entry = normalizeEntry(localBps[bpKey]);
                const isBase = bpKey === "base";
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

                                                if (
                                                    newKey !== bpKey &&
                                                    Object.keys(localBps).includes(newKey)
                                                ) {
                                                    return;
                                                }

                                                removeEntry(bpKey, {
                                                    transfer: entry,
                                                    newKey,
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
