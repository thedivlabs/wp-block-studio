import {useCallback, useMemo} from "@wordpress/element";
import {Button} from "@wordpress/components";
import _ from "lodash";

export function BreakpointPanels({value = {}, onChange, render, label}) {
    const themeBreakpoints = WPBS?.settings?.breakpoints || {};

    // Unpack layout namespaces
    const {
        props = {},
        hover = {},
        breakpoints = {},
        ...rest
    } = value || {};

    // Build base entry object for Option A
    const baseEntry = { props, hover };

    // Sorted breakpoint list
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

    // ------------------------------------------------------------
    // UPDATE BASE OR BREAKPOINT ENTRY (props + hover together)
    // ------------------------------------------------------------
    const updateEntry = useCallback(
        (bpKey, patch, reset = false) => {
            if (bpKey === "base") {
                const next = reset
                    ? { props: {}, hover: {} }
                    : _.merge({}, baseEntry, patch);

                onChange({
                    ...rest,
                    props: next.props,
                    hover: next.hover,
                    breakpoints,
                });

                return;
            }

            const prev = breakpoints[bpKey] || { props: {}, hover: {} };
            const next = reset ? { props: {}, hover: {} } : _.merge({}, prev, patch);

            onChange({
                ...rest,
                props,
                hover,
                breakpoints: {
                    ...breakpoints,
                    [bpKey]: next,
                },
            });
        },
        [baseEntry, props, hover, breakpoints, rest, onChange]
    );

    // ------------------------------------------------------------
    // RENDER
    // ------------------------------------------------------------
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
                        entry: baseEntry,
                        update: (patch, reset = false) =>
                            updateEntry("base", patch, reset),
                    })}
                </div>
            </div>

            {/* BREAKPOINT PANELS */}
            {orderedBpKeys.map((bpKey) => {
                const entry = breakpoints[bpKey] || { props: {}, hover: {} };

                return (
                    <div className="wpbs-layout-tools__panel" key={bpKey}>
                        <div className="wpbs-layout-tools__header">

                            <Button
                                isSmall
                                icon="no-alt"
                                onClick={() => {
                                    const next = {...breakpoints};
                                    delete next[bpKey];

                                    onChange({
                                        ...rest,
                                        props,
                                        hover,
                                        breakpoints: next,
                                    });
                                }}
                            />

                            <label className="wpbs-layout-tools__breakpoint">
                                <select
                                    value={bpKey}
                                    onChange={(e) => {
                                        const newKey = e.target.value;

                                        if (newKey !== bpKey && breakpoints[newKey]) return;

                                        const next = {...breakpoints};
                                        delete next[bpKey];
                                        next[newKey] = entry;

                                        onChange({
                                            ...rest,
                                            props,
                                            hover,
                                            breakpoints: next,
                                        });
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
                                update: (patch, reset = false) =>
                                    updateEntry(bpKey, patch, reset),
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
