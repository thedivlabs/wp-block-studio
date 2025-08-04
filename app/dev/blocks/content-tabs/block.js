import './scss/block.scss'


import {
    useBlockProps,
    useInnerBlocksProps, InspectorControls, PanelColorSettings, BlockContextProvider, InspectorAdvancedControls
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "./block.json"

import {Style, STYLE_ATTRIBUTES} from "Components/Style.js";
import {LayoutControls, LAYOUT_ATTRIBUTES} from "Components/Layout"

import {useState, useEffect} from '@wordpress/element';
import {select, subscribe} from '@wordpress/data';
import {store as blockEditorStore} from '@wordpress/block-editor';
import {useInstanceId} from "@wordpress/compose";
import {
    __experimentalNumberControl as NumberControl,
    PanelBody, TabPanel,
    __experimentalBorderControl as BorderControl,
    __experimentalGrid as Grid,
    ToggleControl, __experimentalBoxControl as BoxControl
} from "@wordpress/components";
import React, {useCallback} from "react";


function classNames(attributes = {}, editor = false) {

    return [
        'wpbs-content-tabs',
        'w-full relative',
        !!editor ? 'editor' : null,
        !!attributes['wpbs-content-tabs']?.['hide-inactive'] ? '--hide-inactive' : null,
        attributes?.uniqueId ?? '',
    ].filter(x => x).join(' ');
}

function shallowEqual(obj1, obj2) {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    if (keys1.length !== keys2.length) return false;
    for (let key of keys1) {
        if (obj1[key] !== obj2[key]) return false;
    }
    return true;
}

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...LAYOUT_ATTRIBUTES,
        ...STYLE_ATTRIBUTES,
        'wpbs-content-tabs': {
            type: 'object',
            default: {}
        }
    },
    edit: ({attributes, setAttributes, clientId}) => {

        const uniqueId = useInstanceId(registerBlockType, 'wpbs-content-tabs');

        const [tabActive, setTabActive] = useState(0);
        const [tabPanels, setTabPanels] = useState([]);
        const [tabOptions, setTabOptions] = useState({});

        const updateSettings = useCallback((newValue) => {
            const result = {
                ...attributes['wpbs-content-tabs'],
                ...newValue
            };

            setAttributes({
                'wpbs-content-tabs': result
            });

        }, [setAttributes, attributes['wpbs-content-tabs']])

        useEffect(() => {

            let unsubscribed = false;

            const {getBlock} = select(blockEditorStore);
            const thisBlock = getBlock(clientId);

            const update = () => {

                if (!thisBlock) {
                    return
                }

                const container = thisBlock.innerBlocks?.find(
                    (child) => child.name === 'wpbs/content-tabs-container'
                );

                if (!container) {
                    return
                }

                const nextPanels = container.innerBlocks
                    .filter((block) => block.name === 'wpbs/content-tabs-panel')
                    .map((panel, i) => ({
                        title: panel.attributes?.title || `Tab ${i + 1}`,
                        clientId: panel.clientId,
                    }));

                // Only update if different
                setTabPanels((prev) => {
                    const isEqual = prev.length === nextPanels.length &&
                        prev.every((p, i) =>
                            p.title === nextPanels[i].title &&
                            p.clientId === nextPanels[i].clientId
                        );
                    return isEqual ? prev : nextPanels;
                });
            };

            update();

            const unsubscribe = subscribe(() => {
                if (!unsubscribed) {
                    update();
                }
            });

            return () => {
                unsubscribed = true;
                unsubscribe();
            };
        }, [clientId]);

        useEffect(() => {
            if (!tabActive && tabPanels?.length > 0) {
                setTabActive(tabPanels[0].clientId);
            }
        }, [tabPanels, tabActive]);

        useEffect(() => {
            const buttonGrow = !!attributes['wpbs-content-tabs']?.['button-grow'];
            const result = {buttonGrow};

            if (!shallowEqual(tabOptions, result)) {
                setTabOptions(result);
            }

        }, [attributes['wpbs-content-tabs']]);


        const blockProps = useBlockProps({
            className: classNames(attributes, true),
        });

        const innerBlocksProps = useInnerBlocksProps(blockProps, {
            template: [
                ['wpbs/content-tabs-navigation'],
                ['wpbs/content-tabs-container'],
            ],
            allowedBlocks: [
                'wpbs/content-tabs-navigation',
                'wpbs/content-tabs-container',
                'wpbs/layout-element',
            ],
        });

        const buttonTabOptions = <Grid columns={1} columnGap={15} rowGap={20}>
            <Grid columns={1} columnGap={0} rowGap={0}>
                <PanelColorSettings
                    enableAlpha
                    className={'!p-0 !border-0 [&_.components-tools-panel-item]:!m-0'}
                    colorSettings={[
                        {
                            slug: 'background-color',
                            label: 'Background Color',
                            value: attributes['wpbs-content-tabs']?.['button-color-background'],
                            onChange: (newValue) => updateSettings({'button-color-background': newValue}),
                            isShownByDefault: true
                        }
                    ]}
                />
                <PanelColorSettings
                    enableAlpha
                    className={'!p-0 !border-0 [&_.components-tools-panel-item]:!m-0'}
                    colorSettings={[
                        {
                            slug: 'text-color',
                            label: 'Text Color',
                            value: attributes['wpbs-content-tabs']?.['button-color-text'],
                            onChange: (newValue) => updateSettings({'button-color-text': newValue}),
                            isShownByDefault: true
                        }
                    ]}
                />
            </Grid>
            <BorderControl
                __next40pxDefaultSize
                enableAlpha
                enableStyle
                disableUnits
                value={attributes['wpbs-content-tabs']?.['button-border']}
                colors={WPBS?.settings?.colors ?? []}
                __experimentalIsRenderedInSidebar={true}
                label="Border"
                onChange={(newValue) => updateSettings({'button-border': newValue})}
                shouldSanitizeBorder
            />
            <BorderControl
                __next40pxDefaultSize
                enableAlpha
                enableStyle
                disableUnits
                value={attributes['wpbs-content-tabs']?.['button-divider']}
                colors={WPBS?.settings?.colors ?? []}
                __experimentalIsRenderedInSidebar={true}
                label="Divider"
                onChange={(newValue) => updateSettings({'button-divider': newValue})}
                shouldSanitizeBorder
            />
            <BoxControl
                label={'Padding'}
                values={attributes['wpbs-content-tabs']?.['button-padding']}
                sides={['top', 'left', 'bottom', 'right']}
                onChange={(newValue) => updateSettings({'button-padding': newValue})}
                inputProps={{
                    units: [
                        {value: 'px', label: 'px', default: 0},
                        {value: 'em', label: 'em', default: 0},
                        {value: 'rem', label: 'rem', default: 0},
                    ]
                }}
                __nextHasNoMarginBottom={true}
            />
            <Grid columns={2} columnGap={15} rowGap={20} style={{marginTop: '10px'}}>
                <ToggleControl
                    label={'Grow'}
                    checked={!!attributes['wpbs-content-tabs']?.['button-grow']}
                    onChange={(newValue) => updateSettings({'button-grow': newValue})}
                    className={'flex items-center'}
                    __nextHasNoMarginBottom
                />
            </Grid>
        </Grid>;
        const buttonTabHover = <Grid columns={1} columnGap={0} rowGap={0}>
            <PanelColorSettings
                enableAlpha
                className={'!p-0 !border-0 [&_.components-tools-panel-item]:!m-0'}
                colorSettings={[
                    {
                        slug: 'background-color-hover',
                        label: 'Background Color',
                        value: attributes['wpbs-content-tabs']?.['button-color-background-hover'],
                        onChange: (newValue) => updateSettings({'button-color-background-hover': newValue}),
                        isShownByDefault: true
                    },
                    {
                        slug: 'text-color-hover',
                        label: 'Text Color',
                        value: attributes['wpbs-content-tabs']?.['button-color-text-hover'],
                        onChange: (newValue) => updateSettings({'button-color-text-hover': newValue}),
                        isShownByDefault: true
                    },
                    {
                        slug: 'border-color-hover',
                        label: 'Border Color',
                        value: attributes['wpbs-content-tabs']?.['button-color-border-hover'],
                        onChange: (newValue) => updateSettings({'button-color-border-hover': newValue}),
                        isShownByDefault: true
                    }
                ]}
            />

        </Grid>;
        const buttonTabActive = <Grid columns={1} columnGap={0} rowGap={0}>
            <PanelColorSettings
                enableAlpha
                className={'!p-0 !border-0 [&_.components-tools-panel-item]:!m-0'}
                colorSettings={[
                    {
                        slug: 'background-color-active',
                        label: 'Background Color',
                        value: attributes['wpbs-content-tabs']?.['button-color-background-active'],
                        onChange: (newValue) => updateSettings({'button-color-background-active': newValue}),
                        isShownByDefault: true
                    },
                    {
                        slug: 'text-color-active',
                        label: 'Text Color',
                        value: attributes['wpbs-content-tabs']?.['button-color-text-active'],
                        onChange: (newValue) => updateSettings({'button-color-text-active': newValue}),
                        isShownByDefault: true
                    },
                    {
                        slug: 'border-color-active',
                        label: 'Border Color',
                        value: attributes['wpbs-content-tabs']?.['button-color-border-active'],
                        onChange: (newValue) => updateSettings({'button-color-border-active': newValue}),
                        isShownByDefault: true
                    }
                ]}
            />
        </Grid>;

        const buttonTabs = {
            options: buttonTabOptions,
            hover: buttonTabHover,
            active: buttonTabActive
        }

        const border = attributes['wpbs-content-tabs']?.['button-border'];
        const divider = attributes['wpbs-content-tabs']?.['button-divider'];
        const padding = attributes['wpbs-content-tabs']?.['button-padding'];
        const duration = Number(attributes['wpbs-content-tabs']?.duration);

        return <>
            <InspectorControls group="styles">
                <PanelBody title="Options" initialOpen={true}>
                    <Grid columns={1} columnGap={15} rowGap={20}>
                        <ToggleControl
                            label={'Hide Inactive'}
                            checked={!!attributes['wpbs-content-tabs']?.['hide-inactive']}
                            onChange={(newValue) => updateSettings({'hide-inactive': newValue})}
                            className={'flex items-center'}
                            __nextHasNoMarginBottom
                        />
                    </Grid>
                </PanelBody>
                <PanelBody title="Button" initialOpen={false}>
                    <TabPanel
                        className="wpbs-editor-tabs"
                        activeClass="active"
                        orientation="horizontal"
                        initialTabName="options"
                        tabs={[
                            {
                                name: 'options',
                                title: 'Options',
                                className: 'tab-options',
                            },
                            {
                                name: 'hover',
                                title: 'Hover',
                                className: 'tab-hover'
                            },
                            {
                                name: 'active',
                                title: 'Active',
                                className: 'tab-active',
                            },
                        ]}>
                        {
                            (tab) => (<>{buttonTabs[tab.name]}</>)
                        }
                    </TabPanel>
                </PanelBody>
            </InspectorControls>
            <InspectorAdvancedControls>
                <Grid columns={2} columnGap={15} rowGap={20} style={{marginTop: '20px'}}>
                    <NumberControl
                        label={'Duration'}
                        value={attributes?.['wpbs-content-tabs']?.['duration']}
                        onChange={(newValue) => updateSettings({'duration': newValue})}
                        min={0}
                        max={900}
                        isDragEnabled={false}
                        isShiftStepEnabled
                        shiftStep={100}
                        step={50}
                    />
                </Grid>
            </InspectorAdvancedControls>
            <LayoutControls attributes={attributes} setAttributes={setAttributes}/>
            <Style attributes={attributes} setAttributes={setAttributes} uniqueId={uniqueId}
                   deps={['wpbs-content-tabs']}
                   props={{
                       '--fade-duration': duration > 10 ? duration + 'ms' : null,
                       '--button-background': attributes['wpbs-content-tabs']?.['button-color-background'],
                       '--button-text': attributes['wpbs-content-tabs']?.['button-color-text'],
                       '--button-border': border?.style && border?.color ? `${border.top || '1px'} ${border.style} ${border.color}` : undefined,
                       '--button-divider': divider?.style && divider?.color ? `${divider.top || '1px'} ${divider.style} ${divider.color}` : undefined,
                       '--button-padding': padding ? `${padding.top || '0px'} ${padding.right || '0px'} ${padding.bottom || '0px'} ${padding.left || '0px'} ` : undefined,
                       '--button-background-hover': attributes['wpbs-content-tabs']?.['button-color-background-hover'],
                       '--button-text-hover': attributes['wpbs-content-tabs']?.['button-color-text-hover'],
                       '--button-border-hover': attributes['wpbs-content-tabs']?.['button-color-border-hover'],
                       '--button-background-active': attributes['wpbs-content-tabs']?.['button-color-background-active'],
                       '--button-text-active': attributes['wpbs-content-tabs']?.['button-color-text-active'],
                       '--button-border-active': attributes['wpbs-content-tabs']?.['button-color-border-active'],
                   }}
            />
            <BlockContextProvider
                value={{
                    tabOptions,
                    tabPanels,
                    tabActive,
                    setTabActive,
                }}
            >
                <div {...innerBlocksProps}></div>
            </BlockContextProvider>

        </>;
    },
    save: (props) => {

        const blockProps = useBlockProps.save({
            className: classNames(props.attributes),
            'data-wp-interactive': 'wpbs/content-tabs',
            'data-wp-init': 'actions.init'
        });

        const innerBlocksProps = useInnerBlocksProps.save(blockProps);

        return <div {...innerBlocksProps}></div>;
    }
})


