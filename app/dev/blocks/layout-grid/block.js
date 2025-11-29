import {registerBlockType} from '@wordpress/blocks';
import {InspectorControls, useBlockProps, useInnerBlocksProps, InnerBlocks} from '@wordpress/block-editor';
import {useCallback, useMemo} from "@wordpress/element";

import {
    __experimentalGrid as Grid,
    __experimentalNumberControl as NumberControl,
    PanelBody,
    SelectControl, TextControl,
    ToggleControl,
} from "@wordpress/components";
import {isEqual} from 'lodash';
import {useInstanceId} from "@wordpress/compose";

import './scss/block.scss';

const FEED_OPTIONS = [
    {label: 'Select', value: ''},
    {label: 'Wired', value: 'wired'},
];

const DATE_FORMAT_OPTIONS = [
    {label: 'Select', value: ''},
    {label: 'October 8, 2025', value: 'F j, Y'},
    {label: '2025-10-08', value: 'Y-m-d'},
    {label: '10/08/2025', value: 'm/d/Y'},
    {label: '08/10/2025', value: 'd/m/Y'},
    {label: 'Oct 8, 2025', value: 'M j, Y'},
    {label: 'Wed, Oct 8, 2025', value: 'D, M j, Y'},
    {label: 'Wednesday, October 8, 2025', value: 'l, F j, Y'},
    {label: '5:30 PM', value: 'g:i A'},
    {label: '17:30', value: 'H:i'},
    {label: 'October 8, 2025 5:30 PM', value: 'F j, Y g:i A'},
];

const IMAGE_SIZE_OPTIONS = [
    { label: 'Select', value: '' },
    { label: 'Thumbnail', value: 180 },
    { label: 'Small', value: 320 },
    { label: 'Medium', value: 480 },
    { label: 'Large', value: 800 },
];

const blockClassNames = (attributes) => {
    const {settings = {}} = attributes;

    return [
        'wpbs-layout-grid',
        settings?.instanceId ?? null,
        !!settings?.centered ? '--centered' : null,
    ].filter(Boolean).join(' ');
};

const buildCssProps = (settings) => {
    const {
        breakpointSmall = 'xs',
        breakpointLarge = 'normal',
        itemsMobile,
        itemsSmall,
        itemsLarge = 3,
    } = settings;

    // Base CSS props (not breakpoint-specific)
    const cssProps = {
        '--columns': itemsLarge,
    };

    // Responsive breakpoints
    const responsive = {};

    if (itemsMobile) {
        responsive[breakpointSmall] = {'--columns': itemsMobile ?? 1};
    }
    if (itemsSmall) {
        responsive[breakpointLarge] = {'--columns': itemsSmall ?? 2};
    }

    return {
        base: cssProps,
        responsive,
    };
};

const resolvePresetVar = (value) => {
    if (typeof value === 'string' && value.startsWith('var:preset|')) {
        // turn "var:preset|spacing|50" → "var(--wp--preset--spacing--50)"
        const parts = value.replace('var:preset|', '').split('|');
        return `var(--wp--preset--${parts.join('--')})`;
    }
    return value;
};

const Style = ({settings, breakpoints}) => {
    if (!settings?.css?.responsive || !breakpoints || !settings?.instanceId) return null;

    const selector = `.${settings.instanceId}`;

    const baseRules = `.wpbs-layout-grid${selector} {${Object.entries(settings.css.base || {})
        .map(([key, val]) => `${key}:${val};`)
        .join('')}}`;


    const responsiveRules = Object.entries(settings.css.responsive)
        .map(([bpKey, vars]) => {
            const varsStr = Object.entries(vars)
                .map(([key, val]) => `${key}:${val};`)
                .join('');
            return `@media(max-width:${(breakpoints[bpKey]?.size - 1)}px){.wpbs-layout-grid${selector} {${varsStr}}}`;
        })
        .join('');

    return <style>{[baseRules,responsiveRules].join(' ')}</style>;
};

registerBlockType('wpbs/layout-grid', {
    edit: ({attributes, setAttributes}) => {

        const {settings = {}} = attributes;
        const {
            feed,
            itemsMobile,
            itemsSmall,
            itemsLarge,
            breakpointSmall,
            breakpointLarge,
            maxItems,
            dateFormat,
            buttonLabel,
            imageSize,
            centered,
        } = settings;
        const breakpoints = window?.AF?.breakpoints || {};
        const breakpointsOptions = useMemo(() => {
            return [
                {label: 'Select', value: ''},
                ...Object.entries(breakpoints).map(([key, value]) => ({
                    label: value?.label ?? key,
                    value: key
                }))
            ];
        }, [breakpoints]);

        const instanceId = useInstanceId(Object, 'wpbs-layout-grid');

        const blockProps = useBlockProps({
            className: blockClassNames(attributes),
            style: Object.fromEntries(
                Object.entries({
                    '--column-gap': resolvePresetVar(attributes?.style?.spacing?.blockGap?.left),
                    '--row-gap': resolvePresetVar(attributes?.style?.spacing?.blockGap?.top),
                }).filter(([_, v]) => v !== undefined)
            )
        });

        const innerBlocksProps = useInnerBlocksProps(blockProps, {
            allowedBlocks:[
                'wpbs/layout-grid-card',
            ]
        });

        const updateSettings = useCallback(
            (newValue = {}) => {

                const newSettings = {...settings, ...newValue};

                // Only set if something actually changed
                if (!isEqual(settings, newSettings)) {

                    newSettings.css = buildCssProps(newSettings);
                    newSettings.instanceId = instanceId;

                    setAttributes({settings: newSettings});
                }
            },
            [settings, setAttributes]
        );

        return (
            <>
                <InspectorControls>
                    <PanelBody initialOpen={true}>
                        <Grid columns={1} columnGap={10} rowGap={10}>
                            <SelectControl
                                key={'feed'}
                                label={'Feed'}
                                value={feed}
                                onChange={(newValue) => updateSettings({feed: newValue})}
                                options={FEED_OPTIONS}
                                __next40pxDefaultSize
                                __nextHasNoMarginBottom
                            />
                            <Grid columns={3} columnGap={10} rowGap={10}>
                                <NumberControl
                                    key={'itemsMobile'}
                                    label="Mobile"
                                    value={itemsMobile}
                                    onChange={(newValue) => updateSettings({itemsMobile: newValue})}
                                    min={1}
                                    max={4}
                                    __next40pxDefaultSize
                                    __nextHasNoMarginBottom
                                />
                                <NumberControl
                                    key={'itemsSmall'}
                                    label="Small"
                                    value={itemsSmall}
                                    onChange={(newValue) => updateSettings({itemsSmall: newValue})}
                                    min={2}
                                    max={6}
                                    __next40pxDefaultSize
                                    __nextHasNoMarginBottom
                                />
                                <NumberControl
                                    key={'itemsLarge'}
                                    label="Large"
                                    value={itemsLarge}
                                    onChange={(newValue) => updateSettings({itemsLarge: newValue})}
                                    min={2}
                                    max={6}
                                    __next40pxDefaultSize
                                    __nextHasNoMarginBottom
                                />
                            </Grid>
                            <Grid columns={2} columnGap={10} rowGap={10}>
                                <SelectControl
                                    key={'breakpointSmall'}
                                    label="Breakpoint Sm"
                                    value={breakpointSmall}
                                    onChange={(newValue) => updateSettings({breakpointSmall: newValue})}
                                    options={breakpointsOptions}
                                    __next40pxDefaultSize
                                    __nextHasNoMarginBottom
                                />
                                <SelectControl
                                    key={'breakpointLarge'}
                                    label="Breakpoint Lg"
                                    value={breakpointLarge}
                                    onChange={(newValue) => updateSettings({breakpointLarge: newValue})}
                                    options={breakpointsOptions}
                                    __next40pxDefaultSize
                                    __nextHasNoMarginBottom
                                />
                                <NumberControl
                                    key={'maxItems'}
                                    label="Max Items"
                                    value={maxItems}
                                    onChange={(newValue) => updateSettings({maxItems: newValue})}
                                    __next40pxDefaultSize
                                    __nextHasNoMarginBottom
                                />
                                <SelectControl
                                    key="dateFormat"
                                    label="Date Format"
                                    value={dateFormat}
                                    options={DATE_FORMAT_OPTIONS}
                                    onChange={(newValue) => updateSettings({dateFormat: newValue})}
                                    __next40pxDefaultSize
                                    __nextHasNoMarginBottom
                                />
                                <SelectControl
                                    key={'imageSize'}
                                    label="Image Size"
                                    value={imageSize}
                                    onChange={(newValue) => updateSettings({imageSize: newValue})}
                                    options={IMAGE_SIZE_OPTIONS}
                                    __next40pxDefaultSize
                                    __nextHasNoMarginBottom
                                />
                                <TextControl
                                    key={'buttonLabel'}
                                    label={'Button Label'}
                                    value={buttonLabel}
                                    onChange={(newValue) => updateSettings({buttonLabel: newValue})}
                                    __next40pxDefaultSize
                                    __nextHasNoMarginBottom
                                />
                            </Grid>
                            <Grid columns={2} columnGap={10} rowGap={10} style={{marginTop: '15px'}}>
                                <ToggleControl
                                    key={'centered'}
                                    label={'Centered'}
                                    checked={!!centered}
                                    onChange={(newValue) => updateSettings({centered: newValue})}
                                    __next40pxDefaultSize
                                    __nextHasNoMarginBottom
                                />
                            </Grid>

                        </Grid>
                    </PanelBody>
                </InspectorControls>
                <div {...innerBlocksProps} />
                <Style settings={settings} breakpoints={breakpoints}/>
            </>
        );
    },
    save: ({attributes}) => {
        const {settings = {}} = attributes;

        const blockProps = useBlockProps.save({
            className: blockClassNames(attributes),
            'data-wp-interactive': 'wpbs/layout-grid',
            'data-wp-context': JSON.stringify({
                feed: settings?.feed || '',
                dateFormat: settings?.dateFormat || '',
                maxItems: settings?.maxItems || 12,
                imageSize: settings?.imageSize,
            }),
            'data-wp-init': 'actions.init',
            style: Object.fromEntries(
                Object.entries({
                    '--column-gap': resolvePresetVar(attributes?.style?.spacing?.blockGap?.left),
                    '--row-gap': resolvePresetVar(attributes?.style?.spacing?.blockGap?.top),
                    'column-gap': resolvePresetVar(attributes?.style?.spacing?.blockGap?.left),
                    'row-gap': resolvePresetVar(attributes?.style?.spacing?.blockGap?.top),
                }).filter(([_, v]) => v !== undefined)
            )
        });

        /*
        * Return
        * - Block wrapper
        * --- Card template
        * --- Pagination button
        * */

        return (
            <div {...blockProps}>

                <template
                    data-wp-each--item={'state.items'}
                    data-wp-each-key={'context.item.guid'}
                >
                    <InnerBlocks.Content/>
                </template>

                <div className={'wpbs-layout-grid__footer'} data-wp-class--hidden="!state.hasMore">
                <button
                    type="button"
                    class="wp-element-button"
                    data-wp-on--click="actions.loadMore"
                >
                    {settings?.buttonLabel ?? 'Load more'}
                </button>
                </div>
            </div>
        );
    }

});
