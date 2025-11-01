import {memo, useCallback, useEffect, useMemo, useState} from "@wordpress/element";
import {Field} from "Components/Field";
import _ from "lodash";
import {
    Button,
    __experimentalToolsPanel as ToolsPanel,
    __experimentalGrid as Grid,
} from "@wordpress/components";
import {__} from '@wordpress/i18n';

export const StyleEditorUI = ({props, styleRef, updateStyleSettings}) => {
    const {attributes} = props;

    // --- Load breakpoints config
    const breakpoints = useMemo(() => {
        const bps = WPBS?.settings?.breakpoints ?? {};
        return Object.entries(bps).map(([key, {label, size}]) => ({key, label, size}));
    }, []);

    // --- Initialize local state from attributes (once)
    const [localLayout, setLocalLayout] = useState(() =>
        attributes['wpbs-style'] || {props: {}, breakpoints: {}, hover: {}}
    );

    // --- Keep local state synced if attributes change externally (undo/redo, etc.)
    useEffect(() => {
        const attrLayout = attributes['wpbs-style'] || {props: {}, breakpoints: {}, hover: {}};
        if (!_.isEqual(localLayout, attrLayout)) {
            setLocalLayout(attrLayout);
        }
    }, [attributes['wpbs-style']]);

    // --- Debounced commit to attributes
    const commitDebounced = useMemo(
        () => _.debounce((next) => updateStyleSettings(next), 600),
        [updateStyleSettings]
    );

    const commitNow = useCallback(
        (next) => {
            setLocalLayout(next);
            updateStyleSettings(next); // immediate save on explicit triggers
        },
        [updateStyleSettings]
    );

    // --- Update helpers modify localLayout only, commit later
    const updateDefaultLayout = useCallback(
        (newProps) => {
            const next = {
                ...localLayout,
                props: {...localLayout.props, ...newProps},
            };
            setLocalLayout(next);
            commitDebounced(next); // debounce persist
        },
        [localLayout, commitDebounced]
    );

    const updateHoverItem = useCallback(
        (newProps) => {
            const next = {
                ...localLayout,
                hover: {...localLayout.hover, ...newProps},
            };
            setLocalLayout(next);
            commitDebounced(next);
        },
        [localLayout, commitDebounced]
    );

    const updateLayoutItem = useCallback(
        (newProps, bpKey) => {
            const next = {
                ...localLayout,
                breakpoints: {
                    ...localLayout.breakpoints,
                    [bpKey]: {
                        ...localLayout.breakpoints[bpKey],
                        ...newProps,
                    },
                },
            };
            setLocalLayout(next);
            commitDebounced(next);
        },
        [localLayout, commitDebounced]
    );

    const addLayoutItem = useCallback(() => {
        const keys = Object.keys(localLayout.breakpoints || {});
        if (keys.length >= 3) return;
        const available = breakpoints.map((bp) => bp.key).filter((bp) => !keys.includes(bp));
        if (!available.length) return;
        const newKey = available[0];
        const next = {
            ...localLayout,
            breakpoints: {...localLayout.breakpoints, [newKey]: {}},
        };
        setLocalLayout(next);
        commitDebounced(next);
    }, [localLayout, breakpoints, commitDebounced]);

    const removeLayoutItem = useCallback(
        (bpKey) => {
            const {[bpKey]: removed, ...rest} = localLayout.breakpoints;
            const next = {...localLayout, breakpoints: rest};
            setLocalLayout(next);
            commitDebounced(next);
        },
        [localLayout, commitDebounced]
    );

    const layoutKeys = useMemo(() => {
        const keys = Object.keys(localLayout?.breakpoints || {});
        return keys.sort((a, b) => {
            const bpA = breakpoints.find((bp) => bp.key === a);
            const bpB = breakpoints.find((bp) => bp.key === b);
            return (bpA?.size || 0) - (bpB?.size || 0);
        });
    }, [localLayout?.breakpoints, breakpoints]);

    // --- Lazy-load field maps from global singleton
    const layoutFieldsMap = useMemo(() => window?.WPBS_StyleEditor?.layoutFieldsMap ?? [], []);
    const hoverFieldsMap = useMemo(() => window?.WPBS_StyleEditor?.hoverFieldsMap ?? [], []);

    // --- Render helpers
    const LayoutFields = ({bpKey, settings, updateLayoutItem, suppress = []}) =>
        layoutFieldsMap
            .filter((f) => !suppress.includes(f.slug))
            .map((field) => (
                <Field
                    key={field.slug}
                    field={field}
                    settings={settings}
                    callback={(v) => updateLayoutItem({[field.slug]: v}, bpKey)}
                />
            ));

    const HoverFields = ({settings}) =>
        hoverFieldsMap.map((field) => (
            <Field
                key={field.slug}
                field={field}
                settings={settings}
                callback={(v) => updateHoverItem({[field.slug]: v})}
            />
        ));

    // --- Render
    return (
        <div className={'wpbs-layout-tools'}>

            {/* Default section */}
            <div className={'wpbs-layout-tools__panel'}>
                <ToolsPanel label={__('Layout')} resetAll={() => commitNow({...localLayout, props: {}})}>
                    <Grid columns={2} columnGap={15} rowGap={20} className={'wpbs-layout-tools__grid'}>
                        <LayoutFields
                            bpKey="layout"
                            settings={localLayout.props}
                            suppress={['padding', 'margin', 'gap']}
                        />
                    </Grid>
                </ToolsPanel>
            </div>
            {/* Hover section */}
            <div className={'wpbs-layout-tools__panel'}>
                <ToolsPanel label={__('Hover')} resetAll={() => commitNow({...localLayout, hover: {}})}>
                    <Grid columns={2} columnGap={15} rowGap={20} className={'wpbs-layout-tools__panel'}>
                        <HoverFields
                            bpKey="hover"
                            settings={localLayout.hover}
                            suppress={['padding', 'margin', 'gap']}
                        />
                    </Grid>
                </ToolsPanel>
            </div>

            {/* Breakpoints */}
            {layoutKeys.map((bpKey) => {

                return (
                    <div className={'wpbs-layout-tools__panel'}>
                        <div className="wpbs-layout-tools__header">
                            <Button
                                isSmall
                                size="small"
                                iconSize={20}
                                onClick={() => removeLayoutItem(bpKey)}
                                icon="no-alt"
                            />
                            <label className="wpbs-layout-tools__breakpoint">
                                <select
                                    id={bpKey}
                                    value={bpKey}
                                    onChange={(e) => {
                                        const newKey = e.target.value;
                                        const nextBreakpoints = {...localLayout.breakpoints};
                                        nextBreakpoints[newKey] = nextBreakpoints[bpKey];
                                        delete nextBreakpoints[bpKey];
                                        const next = {...localLayout, breakpoints: nextBreakpoints};
                                        setLocalLayout(next);
                                        commitDebounced(next);
                                    }}
                                >
                                    {breakpoints.map((b) => {
                                        const size = b?.size ? `(${b.size}px)` : '';
                                        const label = [b ? b.label : bpKey, size].filter(Boolean).join(' ');
                                        return <option
                                            key={b.key}
                                            value={b.key}
                                            disabled={b.key !== bpKey && layoutKeys.includes(b.key)}
                                        >
                                            {label}
                                        </option>
                                    })}
                                </select>
                            </label>
                        </div>
                        <ToolsPanel
                            label={__('Layout')}
                            resetAll={() =>
                                commitNow({
                                    ...localLayout,
                                    breakpoints: {
                                        ...localLayout.breakpoints,
                                        [bpKey]: {},
                                    },
                                })
                            }
                        >
                            <LayoutFields
                                bpKey={bpKey}
                                settings={localLayout.breakpoints[bpKey]}
                                updateLayoutItem={updateLayoutItem}
                            />
                        </ToolsPanel>
                    </div>
                );
            })}

            <Button
                variant="primary"
                onClick={addLayoutItem}
                style={{
                    borderRadius: '4px',
                    width: '100%',
                    textAlign: 'center',
                    gridColumn: '1/-1',
                }}
                disabled={layoutKeys.length >= 3}
            >
                Add Breakpoint
            </Button>

        </div>
    );
};
