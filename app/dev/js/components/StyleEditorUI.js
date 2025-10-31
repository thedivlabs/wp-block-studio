import {memo, useCallback, useEffect, useMemo, useState} from "@wordpress/element";
import {Field} from "Components/Field";
import _ from "lodash";
import {
    Button,
    __experimentalToolsPanel as ToolsPanel,
} from "@wordpress/components";
import {__} from '@wordpress/i18n';


const LayoutFields = memo(function LayoutFields({bpKey, settings, updateLayoutItem, suppress = []}) {
    const updateProp = useCallback(
        (newProps) => updateLayoutItem(newProps, bpKey),
        [updateLayoutItem, bpKey]
    );

    const layoutFieldsMap = useMemo(
        () => window?.WPBS_StyleEditor?.layoutFieldsMap ?? [],
        []
    );

    return layoutFieldsMap.map((field) => <Field field={field}
                                                 settings={settings}
                                                 callback={(newValue) => updateProp({[field.slug]: newValue})}
    />);
});

const HoverFields = memo(function HoverFields({hoverSettings, updateHoverItem, suppress = []}) {
    const updateProp = useCallback(
        (newProps) => updateHoverItem(newProps),
        [updateHoverItem]
    );

    const hoverFieldsMap = useMemo(
        () => window?.WPBS_StyleEditor?.hoverFieldsMap ?? [],
        []
    );

    return hoverFieldsMap.filter((field) => !suppress.includes(field.slug)).map((field) => {
        return <Field field={field}
                      settings={hoverSettings}
                      callback={(newValue) => updateProp({[field.slug]: newValue})}
        />;
    });

});

export const StyleEditorUI = ({props, styleRef, updateStyleSettings}) => {

    const {attributes} = props;

    // Breakpoints config
    const breakpoints = useMemo(() => {
        const bps = WPBS?.settings?.breakpoints ?? {};
        return Object.entries(bps).map(([key, {label, size}]) => ({key, label, size}));
    }, []);

    const initialLayout = attributes['wpbs-style'] || {
        props: {},
        breakpoints: {},
        hover: {},
    };

    // Local editing state (keeps empty values visible until committed)
    const [localLayout, setLocalLayout] = useState(initialLayout);

    // Sync local state if attributes change from outside
    useEffect(() => {
        if (!_.isEqual(localLayout, initialLayout)) {
            setLocalLayout(initialLayout);
        }
    }, [initialLayout]);

    const commit = useCallback(
        (next) => {
            setLocalLayout(next);
            updateStyleSettings(next);
        },
        [updateStyleSettings]
    );


    // Update helpers
    const updateDefaultLayout = useCallback(
        (newProps) => {
            commit({
                ...localLayout,
                props: {...localLayout.props, ...newProps},
            });
        },
        [localLayout, commit]
    );

    const updateHoverItem = useCallback(
        (newProps) => {
            commit({
                ...localLayout,
                hover: {...localLayout.hover, ...newProps},
            });
        },
        [localLayout, commit]
    );

    const updateLayoutItem = useCallback(
        (newProps, bpKey) => {
            commit({
                ...localLayout,
                breakpoints: {
                    ...localLayout.breakpoints,
                    [bpKey]: {
                        ...localLayout.breakpoints[bpKey],
                        ...newProps,
                    },
                },
            });
        },
        [localLayout, commit]
    );

    const addLayoutItem = useCallback(() => {
        const keys = Object.keys(localLayout.breakpoints || {});
        if (keys.length >= 3) return;

        const availableBps = breakpoints
            .map((bp) => bp.key)
            .filter((bp) => !keys.includes(bp));
        if (!availableBps.length) return;

        const newKey = availableBps[0];
        commit({
            ...localLayout,
            breakpoints: {
                ...localLayout.breakpoints,
                [newKey]: {},
            },
        });
    }, [localLayout, breakpoints, commit]);

    const removeLayoutItem = useCallback(
        (bpKey) => {
            const {[bpKey]: removed, ...rest} = localLayout.breakpoints;
            commit({...localLayout, breakpoints: rest});
        },
        [localLayout, commit]
    );

    // Sorted list of breakpoints
    const layoutKeys = useMemo(() => {
        const keys = Object.keys(localLayout?.breakpoints || {});
        return keys.sort((a, b) => {
            const bpA = breakpoints.find((bp) => bp.key === a);
            const bpB = breakpoints.find((bp) => bp.key === b);
            return (bpA?.size || 0) - (bpB?.size || 0);
        });
    }, [localLayout?.breakpoints, breakpoints]);


    return (
        <div className="wpbs-layout-tools__container">
            {/* Default */}
            <ToolsPanel label={__('Layout')} resetAll={() => updateDefaultLayout({})}>
                <LayoutFields
                    bpKey="layout"
                    settings={localLayout.props}
                    updateLayoutItem={updateDefaultLayout}
                    suppress={['padding', 'margin', 'gap']}
                />
            </ToolsPanel>

            {/* Hover */}
            <ToolsPanel label={__('Hover')} resetAll={() => updateHoverItem({})}>
                <HoverFields
                    hoverSettings={localLayout.hover}
                    updateHoverItem={updateHoverItem}
                />
            </ToolsPanel>

            {/* Breakpoints */}
            {layoutKeys.map((bpKey) => {
                const bp = breakpoints.find((b) => b.key === bpKey);
                const size = bp?.size ? `(${bp.size}px)` : '';
                const panelLabel = [bp ? bp.label : bpKey, size].filter(Boolean).join(' ');

                return (
                    <section key={bpKey} className="wpbs-layout-tools__panel active">
                        <div className="wpbs-layout-tools__header">
                            <Button
                                isSmall
                                size="small"
                                iconSize={20}
                                onClick={() => removeLayoutItem(bpKey)}
                                icon="no-alt"
                            />
                            <strong>{panelLabel}</strong>
                        </div>
                        <ToolsPanel label={__('Layout')} resetAll={() => updateLayoutItem({}, bpKey)}
                                    className={'wpbs-layout-tools__grid'}>
                            <label className="wpbs-layout-tools__field --full">
                                <strong>Breakpoint</strong>
                                <div className="wpbs-layout-tools__control">
                                    <select
                                        value={bpKey}
                                        onChange={(e) => {
                                            const newBpKey = e.target.value;
                                            const newBreakpoints = {...localLayout.breakpoints};
                                            newBreakpoints[newBpKey] = newBreakpoints[bpKey];
                                            delete newBreakpoints[bpKey];
                                            commit({...localLayout, breakpoints: newBreakpoints});
                                        }}
                                    >
                                        {breakpoints.map((b) => (
                                            <option
                                                key={b.key}
                                                value={b.key}
                                                disabled={b.key !== bpKey && layoutKeys.includes(b.key)}
                                            >
                                                {b.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </label>
                            <LayoutFields
                                bpKey={bpKey}
                                settings={localLayout.breakpoints[bpKey]}
                                updateLayoutItem={(newProps) => updateLayoutItem(newProps, bpKey)}
                            />
                        </ToolsPanel>
                    </section>
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