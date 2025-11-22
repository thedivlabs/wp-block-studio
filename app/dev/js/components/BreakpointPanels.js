// BreakpointPanels.js
// Fully controlled + stable version
// No internal normalization, no local state fighting the parent.
// Base row is virtual only; ALL breakpoint data lives in `value`.

import {useCallback, useMemo} from "@wordpress/element";
import {Button} from "@wordpress/components";

// public helper
export function createPanel(builderFn) {
    return function PanelComponent({bpKey, entry, update}) {
        return builderFn({bpKey, entry, update});
    };
}

export function BreakpointPanels({value = {}, onChange, render, label}) {
    const themeBreakpoints = WPBS?.settings?.breakpoints || {};

    // ----------------------------------------
    // Breakpoint definitions sorted by size
    // ----------------------------------------
    const breakpointDefs = useMemo(() => {
        return Object.entries(themeBreakpoints).map(([key, bp]) => ({
            key,
            label: bp.label,
            size: bp.size,
        }));
    }, [themeBreakpoints]);

    // keys present in the value
    const bpKeys = useMemo(() => Object.keys(value || {}), [value]);

    // final ordering: base first, then sorted
    const orderedKeys = useMemo(() => {
        const sorted = [...bpKeys].sort((a, b) => {
            const A = breakpointDefs.find((bp) => bp.key === a);
            const B = breakpointDefs.find((bp) => bp.key === b);
            return (A?.size || 0) - (B?.size || 0);
        });
        return ["base", ...sorted];
    }, [bpKeys, breakpointDefs]);

    // ----------------------------------------
    // UPDATE
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
    // REMOVE / RENAME
    // ----------------------------------------
    const removeEntry = useCallback(
        (bpKey, opts = {}) => {
            if (bpKey === "base") return;

            const next = {...value};
            delete next[bpKey];

            if (opts.transfer && opts.newKey) {
                next[opts.newKey] = opts.transfer;
            }

            onChange(next);
        },
        [value, onChange]
    );

    // ----------------------------------------
    // ADD BREAKPOINT
    // ----------------------------------------
    const addBreakpoint = useCallback(() => {
        const existing = Object.keys(value || {});

        const available = breakpointDefs
            .map((bp) => bp.key)
            .filter((k) => !existing.includes(k));

        if (!available.length) return;

        const newKey = available[0];

        const next = {
            ...value,
            [newKey]: {},
        };

        onChange(next);
    }, [value, breakpointDefs, onChange]);

    // ----------------------------------------
    // RENDER
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

                                                if (
                                                    newKey !== bpKey &&
                                                    Object.keys(value || {}).includes(newKey)
                                                ) return;

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

                        {/* CONTENT */}
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
