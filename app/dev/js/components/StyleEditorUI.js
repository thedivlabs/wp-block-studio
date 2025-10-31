import {
    ALIGN_OPTIONS,
    CONTAINER_OPTIONS, CONTENT_VISIBILITY_OPTIONS, DIMENSION_UNITS,
    DIRECTION_OPTIONS,
    DISPLAY_OPTIONS, HEIGHT_OPTIONS, JUSTIFY_OPTIONS, OVERFLOW_OPTIONS, POSITION_OPTIONS,
    REVEAL_ANIMATION_OPTIONS,
    REVEAL_EASING_OPTIONS, SHAPE_OPTIONS, TEXT_ALIGN_OPTIONS, WIDTH_OPTIONS, WRAP_OPTIONS
} from "Includes/config";
import {memo, useCallback, useEffect, useMemo, useState} from "@wordpress/element";
import {Field} from "Components/Field";
import _ from "lodash";
import {saveStyle} from "Includes/style-utils";
import {
    Button,
    __experimentalToolsPanel as ToolsPanel,
    __experimentalToolsPanelItem as ToolsPanelItem
} from "@wordpress/components";
import {__} from '@wordpress/i18n';


const layoutFieldsMap = [

    {type: 'select', slug: 'container', label: 'Container', options: CONTAINER_OPTIONS},


    // Reveal / animation
    {
        type: 'composite',
        slug: 'reveal-group',
        label: 'Reveal',
        fields: [
            {type: 'select', slug: 'reveal-anim', label: 'Animation', large: true, options: REVEAL_ANIMATION_OPTIONS},
            {type: 'select', slug: 'reveal-easing', label: 'Easing', options: REVEAL_EASING_OPTIONS},
            {type: 'number', slug: 'reveal-duration', label: 'Duration'},
            {type: 'unit', slug: 'reveal-offset', label: 'Offset'},
            {type: 'unit', slug: 'reveal-distance', label: 'Distance'},
            {type: 'toggle', slug: 'reveal-repeat', label: 'Repeat'},
            {type: 'toggle', slug: 'reveal-mirror', label: 'Mirror'},
        ],
        large: true
    },


    // Header alignment
    {type: 'unit', slug: 'offset-header', label: 'Offset Header'},
    {type: 'toggle', slug: 'align-header', label: 'Align Header'},

    // Display / flex
    {type: 'select', slug: 'display', label: 'Display', options: DISPLAY_OPTIONS},
    {type: 'select', slug: 'flex-direction', label: 'Flex Direction', options: DIRECTION_OPTIONS},
    {type: 'select', slug: 'flex-wrap', label: 'Flex Wrap', options: WRAP_OPTIONS},
    {type: 'select', slug: 'align-items', label: 'Align Items', options: ALIGN_OPTIONS},
    {type: 'select', slug: 'justify-content', label: 'Justify Content', options: JUSTIFY_OPTIONS},

    // Sizing
    {type: 'select', slug: 'aspect-ratio', label: 'Aspect Ratio', options: SHAPE_OPTIONS},
    {type: 'number', slug: 'opacity', label: 'Opacity'},
    {type: 'unit', slug: 'basis', label: 'Flex Basis'},
    {type: 'select', slug: 'width', label: 'Width', options: WIDTH_OPTIONS},
    {type: 'unit', slug: 'width-custom', label: 'Custom Width'},
    {type: 'unit', slug: 'max-width', label: 'Max Width'},
    {type: 'select', slug: 'height', label: 'Height', options: HEIGHT_OPTIONS},
    {type: 'unit', slug: 'height-custom', label: 'Custom Height'},
    {type: 'unit', slug: 'min-height', label: 'Min Height'},
    {type: 'unit', slug: 'min-height-custom', label: 'Custom Min Height'},
    {type: 'unit', slug: 'max-height', label: 'Max Height'},
    {type: 'unit', slug: 'max-height-custom', label: 'Custom Max Height'},
    {type: 'unit', slug: 'offset-height', label: 'Offset Height'},

    {type: 'unit', slug: 'flex-grow', label: 'Flex Grow'},
    {type: 'unit', slug: 'flex-shrink', label: 'Flex Shrink'},

    // Positioning
    {type: 'select', slug: 'position', label: 'Position', options: POSITION_OPTIONS},
    {type: 'number', slug: 'z-index', label: 'Z Index'},
    {
        type: 'composite',
        slug: 'box-position',
        label: 'Box Position',
        fields: [
            {type: 'unit', slug: 'top', label: 'Top'},
            {type: 'unit', slug: 'right', label: 'Right'},
            {type: 'unit', slug: 'bottom', label: 'Bottom'},
            {type: 'unit', slug: 'left', label: 'Left'},
        ],
        large: true
    },

    // Overflow
    {type: 'select', slug: 'overflow', label: 'Overflow', options: OVERFLOW_OPTIONS},
    {type: 'unit', slug: 'aspect-ratio', label: 'Aspect Ratio'},
    {type: 'unit', slug: 'order', label: 'Order'},
    {
        type: 'box',
        slug: 'translate',
        label: 'Translate',
        options: {sides: ['top', 'left'], inputProps: {units: DIMENSION_UNITS}}
    },

    // Misc toggles
    {type: 'toggle', slug: 'outline', label: 'Outline'},
    {type: 'toggle', slug: 'mark-empty', label: 'Mark Empty'},

    // Colors / visibility
    {type: 'color', slug: 'text-decoration-color', label: 'Text Decoration Color'},
    {type: 'select', slug: 'content-visibility', label: 'Content Visibility', options: CONTENT_VISIBILITY_OPTIONS},

    {
        type: 'box', slug: 'padding', label: 'Padding', large: true,
        options: {sides: ['top', 'right', 'bottom', 'left'], inputProps: {units: DIMENSION_UNITS}}
    },
    {
        type: 'box', slug: 'margin', label: 'Margin', large: true,
        options: {sides: ['top', 'right', 'bottom', 'left'], inputProps: {units: DIMENSION_UNITS}}
    },

    {type: 'unit', slug: 'gap', label: 'Gap'},
    {type: 'unit', slug: 'border-radius', label: 'Border Radius'},
    {type: 'unit', slug: 'font-size', label: 'Font Size'},
    {type: 'unit', slug: 'line-height', label: 'Line Height'},
    {type: 'select', slug: 'text-align', label: 'Text Align', options: TEXT_ALIGN_OPTIONS},

    {type: 'color', slug: 'text-color', label: 'Text Color'},
    {type: 'color', slug: 'background-color', label: 'Background Color'},
    {type: 'text', slug: 'box-shadow', label: 'Shadow'},
];

const hoverFieldsMap = [
    {
        type: 'text',
        slug: 'background-color',
        label: 'Background Color'
    },
    {
        type: 'text',
        slug: 'text-color',
        label: 'Text Color'
    },
];

const LayoutFields = memo(function LayoutFields({bpKey, settings, updateLayoutItem, suppress = []}) {
    const updateProp = useCallback(
        (newProps) => updateLayoutItem(newProps, bpKey),
        [updateLayoutItem, bpKey]
    );

    /*const activeFields = useMemo(() => {
        return layoutFieldsMap.filter(
            (field) =>
                !suppress.includes(field.slug) &&
                settings?.[field.slug] !== undefined &&
                settings?.[field.slug] !== null
        );
    }, [settings, suppress]);*/

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
            updateStyleSettings(saveStyle(next, props));
        },
        [props, styleRef]
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