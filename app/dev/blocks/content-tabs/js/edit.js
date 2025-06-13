import '../scss/block.scss'


import {
    useBlockProps,
    useInnerBlocksProps, InspectorControls, PanelColorSettings, BlockContextProvider
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "../block.json"

import {Style, STYLE_ATTRIBUTES} from "Components/Style.js";
import {LayoutControls, LAYOUT_ATTRIBUTES} from "Components/Layout"

import {useState, useEffect} from '@wordpress/element';
import {select, subscribe} from '@wordpress/data';
import {store as blockEditorStore} from '@wordpress/block-editor';
import {useInstanceId} from "@wordpress/compose";
import {
    PanelBody, TabPanel,
    __experimentalBorderControl as BorderControl,
    __experimentalGrid as Grid,
    __experimentalInputControl as InputControl,
    __experimentalNumberControl as NumberControl,
    __experimentalUnitControl as UnitControl,
    BaseControl,
    ToggleControl, __experimentalBoxControl as BoxControl
} from "@wordpress/components";
import React, {useCallback} from "react";

const DIMENSION_UNITS = [
    {value: 'px', label: 'px', default: 0},
    {value: 'em', label: 'em', default: 0},
    {value: 'rem', label: 'rem', default: 0},
]

function classNames(attributes = {}, editor = false) {

    return [
        'wpbs-content-tabs',
        'w-full relative',
        !!editor ? 'editor' : null,
        attributes.uniqueId,
    ].filter(x => x).join(' ');
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

        const [tabActive, setTabActive] = useState(0);
        const [tabPanels, setTabPanels] = useState([]);

        const uniqueId = useInstanceId(registerBlockType, 'wpbs-content-tabs');

        useEffect(() => {
            setAttributes({
                'uniqueId': uniqueId
            });
        }, []);

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

            const update = () => {
                const {getBlock} = select(blockEditorStore);
                const thisBlock = getBlock(clientId);
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


        const blockProps = useBlockProps({
            className: classNames(attributes, true),
        });

        const innerBlocksProps = useInnerBlocksProps(blockProps, {
            template: [
                ['wpbs/content-tabs-nav'],
                ['wpbs/content-tabs-container'],
            ],
            allowedBlocks: [
                'wpbs/content-tabs-nav',
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
                    units: DIMENSION_UNITS
                }}
                __nextHasNoMarginBottom={true}
            />
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
                    }
                ]}
            />
            <PanelColorSettings
                enableAlpha
                className={'!p-0 !border-0 [&_.components-tools-panel-item]:!m-0'}
                colorSettings={[
                    {
                        slug: 'text-color-hover',
                        label: 'Text Color',
                        value: attributes['wpbs-content-tabs']?.['button-color-text-hover'],
                        onChange: (newValue) => updateSettings({'button-color-text-hover': newValue}),
                        isShownByDefault: true
                    }
                ]}
            />
            <PanelColorSettings
                enableAlpha
                className={'!p-0 !border-0 [&_.components-tools-panel-item]:!m-0'}
                colorSettings={[
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
                    }
                ]}
            />
            <PanelColorSettings
                enableAlpha
                className={'!p-0 !border-0 [&_.components-tools-panel-item]:!m-0'}
                colorSettings={[
                    {
                        slug: 'text-color-active',
                        label: 'Text Color',
                        value: attributes['wpbs-content-tabs']?.['button-color-text-active'],
                        onChange: (newValue) => updateSettings({'button-color-text-active': newValue}),
                        isShownByDefault: true
                    }
                ]}
            />
            <PanelColorSettings
                enableAlpha
                className={'!p-0 !border-0 [&_.components-tools-panel-item]:!m-0'}
                colorSettings={[
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

        return <>
            <InspectorControls group="styles">
                <PanelBody title="Button" initialOpen={true}>
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
            <LayoutControls attributes={attributes} setAttributes={setAttributes}/>
            <Style attributes={attributes} setAttributes={setAttributes}
                   deps={['wpbs-content-tabs']}
            />
            <BlockContextProvider
                value={{
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
            'data-wp-init': 'actions.init',
        });

        const innerBlocksProps = useInnerBlocksProps.save(blockProps);

        return <div {...innerBlocksProps}></div>;
    }
})


