import '../scss/block.scss'

import {
    useBlockProps,
    useInnerBlocksProps, InspectorControls, PanelColorSettings, BlockContextProvider
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "../block.json"

import {Style, STYLE_ATTRIBUTES} from "Components/Style.js";
import {LayoutControls, LAYOUT_ATTRIBUTES} from "Components/Layout"

import {useEffect} from '@wordpress/element';
import {useInstanceId} from "@wordpress/compose";
import {
    __experimentalUnitControl as UnitControl,
    __experimentalGrid as Grid, PanelBody, TabPanel, TextControl, ToggleControl, SelectControl,
} from "@wordpress/components";
import React, {useCallback} from "react";
import {
    DIMENSION_UNITS_TEXT,
    ICON_STYLES,
} from "Includes/config";


function classNames(attributes = {}) {

    return [
        'wpbs-accordion-group',
        'w-full relative',
        !attributes['wpbs-accordion-group']?.['animate'] ? '--static' : null,
        !!attributes['wpbs-accordion-group']?.['icon-hide'] ? '--no-icon' : null,
        !!attributes['wpbs-accordion-group']?.['header-color-hover'] ? '--header-hover' : null,
        !!attributes['wpbs-accordion-group']?.['header-text-color-hover'] ? '--header-text-hover' : null,
        !!attributes['wpbs-accordion-group']?.['header-color-active'] ? '--header-active' : null,
        !!attributes['wpbs-accordion-group']?.['header-text-color-active'] ? '--header-text-active' : null,
        attributes?.uniqueId ?? '',
    ].filter(x => x).join(' ');
}

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...LAYOUT_ATTRIBUTES,
        ...STYLE_ATTRIBUTES,
        'wpbs-accordion-group': {
            type: 'object',
            default: {
                'animate': true,
                'tag': 'div',
            }
        }
    },
    edit: ({attributes, setAttributes, clientId}) => {

        const uniqueId = useInstanceId(registerBlockType, 'wpbs-accordion-group');

        const updateSettings = useCallback((newValue) => {
            const result = {
                ...attributes['wpbs-accordion-group'],
                ...newValue
            };

            setAttributes({
                'wpbs-accordion-group': result,
            });

        }, [setAttributes, attributes['wpbs-accordion-group']])

        const blockProps = useBlockProps({
            className: classNames(attributes),
        });

        const innerBlocksProps = useInnerBlocksProps(blockProps, {
            template: [
                ['wpbs/accordion-group-item'],
            ],
            allowedBlocks: [
                'wpbs/accordion-group-item',
            ],
        });

        const tabOptions = <Grid columns={1} columnGap={15} rowGap={20}>
            <Grid columns={2} columnGap={15} rowGap={20}>
                <TextControl
                    label={'Icon Closed'}
                    value={attributes['wpbs-accordion-group']?.['icon-closed']}
                    onChange={(newValue) => updateSettings({'icon-closed': newValue})}
                    __nextHasNoMarginBottom
                />
                <TextControl
                    label={'Icon Open'}
                    value={attributes['wpbs-accordion-group']?.['icon-open']}
                    onChange={(newValue) => updateSettings({'icon-open': newValue})}
                    __nextHasNoMarginBottom
                />
                <UnitControl
                    label="Icon Size"
                    value={attributes['wpbs-accordion-group']?.['icon-size'] ?? ''}
                    onChange={(val) => updateSettings({'icon-size': val})}
                    units={DIMENSION_UNITS_TEXT}
                    isResetValueOnUnitChange={true}
                    __next40pxDefaultSize
                    __nextHasNoMarginBottom
                />
                <SelectControl
                    label="Icon Style"
                    value={attributes['wpbs-accordion-group']?.['icon-style'] ?? ''}
                    options={ICON_STYLES}
                    onChange={(val) => updateSettings({'icon-style': val})}
                    __next40pxDefaultSize
                    __nextHasNoMarginBottom
                />
            </Grid>
            <Grid columns={2} columnGap={15} rowGap={20}>
                <ToggleControl
                    label={'Animate'}
                    checked={attributes['wpbs-accordion-group']?.['animate'] ?? true}
                    onChange={(newValue) => updateSettings({'animate': newValue})}
                    __nextHasNoMarginBottom
                />
                <ToggleControl
                    label={'Hide Icon'}
                    checked={!!attributes['wpbs-accordion-group']?.['icon-hide']}
                    onChange={(newValue) => updateSettings({'icon-hide': newValue})}
                    __nextHasNoMarginBottom
                />
            </Grid>
            <Grid columns={1} columnGap={0} rowGap={0}>
                <PanelColorSettings
                    enableAlpha
                    className={'!p-0 !border-0 [&_.components-tools-panel-item]:!m-0'}
                    colorSettings={[
                        {
                            slug: 'icon-color',
                            label: 'Icon Color',
                            value: attributes['wpbs-accordion-group']?.['icon-color'],
                            onChange: (newValue) => updateSettings({'icon-color': newValue}),
                            isShownByDefault: true
                        }
                    ]}
                />
            </Grid>
        </Grid>;

        const tabHover = <Grid columns={1} columnGap={0} rowGap={0}>

            <PanelColorSettings
                enableAlpha
                className={'!p-0 !border-0 [&_.components-tools-panel-item]:!m-0'}
                colorSettings={[
                    {
                        slug: 'icon-color-hover',
                        label: 'Icon Color',
                        value: attributes['wpbs-accordion-group']?.['icon-color-hover'],
                        onChange: (newValue) => updateSettings({'icon-color-hover': newValue}),
                        isShownByDefault: true
                    }
                ]}
            />
            <PanelColorSettings
                enableAlpha
                className={'!p-0 !border-0 [&_.components-tools-panel-item]:!m-0'}
                colorSettings={[
                    {
                        slug: 'header-color-hover',
                        label: 'Header Color',
                        value: attributes['wpbs-accordion-group']?.['header-color-hover'],
                        onChange: (newValue) => updateSettings({'header-color-hover': newValue}),
                        isShownByDefault: true
                    }
                ]}
            />
            <PanelColorSettings
                enableAlpha
                className={'!p-0 !border-0 [&_.components-tools-panel-item]:!m-0'}
                colorSettings={[
                    {
                        slug: 'header-text-color-hover',
                        label: 'Header Text Color',
                        value: attributes['wpbs-accordion-group']?.['header-text-color-hover'],
                        onChange: (newValue) => updateSettings({'header-text-color-hover': newValue}),
                        isShownByDefault: true
                    }
                ]}
            />
        </Grid>;

        const tabActive = <Grid columns={1} columnGap={0} rowGap={0}>

            <PanelColorSettings
                enableAlpha
                className={'!p-0 !border-0 [&_.components-tools-panel-item]:!m-0'}
                colorSettings={[
                    {
                        slug: 'icon-color-active',
                        label: 'Icon Color',
                        value: attributes['wpbs-accordion-group']?.['icon-color-active'],
                        onChange: (newValue) => updateSettings({'icon-color-active': newValue}),
                        isShownByDefault: true
                    }
                ]}
            />
            <PanelColorSettings
                enableAlpha
                className={'!p-0 !border-0 [&_.components-tools-panel-item]:!m-0'}
                colorSettings={[
                    {
                        slug: 'header-color-active',
                        label: 'Header Color',
                        value: attributes['wpbs-accordion-group']?.['header-color-active'],
                        onChange: (newValue) => updateSettings({'header-color-active': newValue}),
                        isShownByDefault: true
                    }
                ]}
            />
            <PanelColorSettings
                enableAlpha
                className={'!p-0 !border-0 [&_.components-tools-panel-item]:!m-0'}
                colorSettings={[
                    {
                        slug: 'header-text-color-active',
                        label: 'Header Text Color',
                        value: attributes['wpbs-accordion-group']?.['header-text-color-active'],
                        onChange: (newValue) => updateSettings({'header-text-color-active': newValue}),
                        isShownByDefault: true
                    }
                ]}
            />
        </Grid>;

        const accordionTabs = {
            options: tabOptions,
            hover: tabHover,
            active: tabActive
        }

        const iconOpen = attributes['wpbs-accordion-group']?.['icon-open']?.match(/^[a-fA-F0-9]{2,6}$/) ? attributes['wpbs-accordion-group']?.['icon-open'] : 'f078';
        const iconClosed = attributes['wpbs-accordion-group']?.['icon-closed']?.match(/^[a-fA-F0-9]{2,6}$/) ? attributes['wpbs-accordion-group']?.['icon-closed'] : 'f078';

        const ElementTag = attributes['wpbs-accordion-group']?.['tag'] ?? 'div';

        return <>

            <InspectorControls group="advanced">
                <PanelBody style={{paddingTop: '20px'}}>
                    <SelectControl
                        value={attributes['wpbs-accordion-group']?.['tag']}
                        label={'HTML element'}
                        options={[
                            {label: 'Default (<div>)', value: 'div'},
                            {label: '<ul>', value: 'ul'},
                            {label: '<ol>', value: 'ol'},
                        ]}
                        onChange={(newValue) => updateSettings({tag: newValue})}
                        __next40pxDefaultSize
                        __nextHasNoMarginBottom
                    />
                </PanelBody>
            </InspectorControls>
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
                            (tab) => (<>{accordionTabs[tab.name]}</>)
                        }
                    </TabPanel>
                </PanelBody>
            </InspectorControls>


            <LayoutControls attributes={attributes} setAttributes={setAttributes}/>
            <Style attributes={attributes} setAttributes={setAttributes}
                   uniqueId={uniqueId}
                   deps={['wpbs-accordion-group']}
                   props={{
                       '--icon-open': `"\\${iconOpen}"`,
                       '--icon-closed': `"\\${iconClosed}"`,
                       '--icon-style': attributes['wpbs-accordion-group']?.['icon-style'],
                       '--icon-size': attributes['wpbs-accordion-group']?.['icon-size'],
                       '--icon-color': attributes['wpbs-accordion-group']?.['icon-color'],
                       '--icon-color-hover': attributes['wpbs-accordion-group']?.['icon-color-hover'],
                       '--header-color-hover': attributes['wpbs-accordion-group']?.['header-color-hover'],
                       '--header-text-color-hover': attributes['wpbs-accordion-group']?.['header-text-color-hover'],
                       '--icon-color-active': attributes['wpbs-accordion-group']?.['icon-color-active'],
                       '--header-color-active': attributes['wpbs-accordion-group']?.['header-color-active'],
                       '--text-color-active': attributes['wpbs-accordion-group']?.['text-color-active'],
                   }}
            />

            <BlockContextProvider value={{ElementTag}}>
                <ElementTag role="presentation" {...innerBlocksProps} />
            </BlockContextProvider>

        </>;
    },
    save: (props) => {

        const ElementTag = props.attributes['wpbs-accordion-group']?.['tag'] ?? 'div';

        const blockProps = useBlockProps.save({
            className: classNames(props.attributes),
            'data-wp-interactive': 'wpbs/accordion-group',
            'data-wp-init': 'actions.init',
        });

        const innerBlocksProps = useInnerBlocksProps.save(blockProps);

        return <ElementTag role="presentation" {...innerBlocksProps} />;
    }
})


