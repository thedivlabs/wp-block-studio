import './scss/block.scss'

import {
    useBlockProps,
    useInnerBlocksProps, InspectorControls, PanelColorSettings, BlockContextProvider
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "./block.json"

import {Style, STYLE_ATTRIBUTES} from "Components/Style.js";
import {LayoutControls, LAYOUT_ATTRIBUTES} from "Components/Layout"

import {useInstanceId} from "@wordpress/compose";
import {
    __experimentalUnitControl as UnitControl,
    __experimentalGrid as Grid, PanelBody, TabPanel, TextControl, ToggleControl, SelectControl,
} from "@wordpress/components";
import React, {useCallback, useMemo} from "react";
import {
    DIMENSION_UNITS_TEXT,
    ICON_STYLES,
} from "Includes/config";
import {useUniqueId} from "Includes/helper";
import {IconControl, MaterialIcon} from "Components/IconControl";


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

        const uniqueId = useUniqueId(attributes, setAttributes, clientId);

        const {'wpbs-accordion-group': settings = {}} = attributes;

        const updateSettings = useCallback((newValue) => {
            const result = {
                ...settings,
                ...newValue
            };

            setAttributes({
                'wpbs-accordion-group': result,
            });

        }, [setAttributes, settings])

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

                <IconControl label={'Icon Closed'} value={settings?.['icon-closed']}
                             onChange={(newValue) => updateSettings({'icon-closed': newValue})}/>

                <IconControl label={'Icon Open'} value={settings?.['icon-open']}
                             onChange={(newValue) => updateSettings({'icon-open': newValue})}/>

            </Grid>
            <Grid columns={2} columnGap={15} rowGap={20}>
                <ToggleControl
                    label={'Animate'}
                    checked={settings?.['animate'] ?? true}
                    onChange={(newValue) => updateSettings({'animate': newValue})}
                    __nextHasNoMarginBottom
                />
                <ToggleControl
                    label={'Hide Icon'}
                    checked={!!settings?.['icon-hide']}
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
                            value: settings?.['icon-color'],
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
                        value: settings?.['icon-color-hover'],
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
                        value: settings?.['header-color-hover'],
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
                        value: settings?.['header-text-color-hover'],
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
                        value: settings?.['icon-color-active'],
                        onChange: (newValue) => updateSettings({'icon-color-active': newValue}),
                        isShownByDefault: true
                    },
                    {
                        slug: 'header-color-active',
                        label: 'Header Color',
                        value: settings?.['header-color-active'],
                        onChange: (newValue) => updateSettings({'header-color-active': newValue}),
                        isShownByDefault: true
                    },
                    {
                        slug: 'header-text-color-active',
                        label: 'Header Text Color',
                        value: settings?.['header-text-color-active'],
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

        const ElementTag = settings?.['tag'] ?? 'div';

        const cssProps = useMemo(() => {
            return {
                '--icon-open': settings?.['icon-open']?.name ? '"' + settings?.['icon-open'].name + '"' : null,
                '--icon-size': settings?.['icon-open']?.size ? settings?.['icon-open'].size + 'px' : null,
                '--icon-open-css': settings?.['icon-open']?.css,
                '--icon-closed': settings?.['icon-closed']?.name ? '"' + settings?.['icon-closed'].name + '"' : null,
                '--icon-closed-css': settings?.['icon-closed']?.css,
                '--icon-color': settings?.['icon-color'],
                '--icon-color-hover': settings?.['icon-color-hover'],
                '--header-color-hover': settings?.['header-color-hover'],
                '--header-text-color-hover': settings?.['header-text-color-hover'],
                '--icon-color-active': settings?.['icon-color-active'],
                '--header-color-active': settings?.['header-color-active'],
                '--header-text-color-active': settings?.['header-text-color-active'],
            }
        }, [settings]);

        return <>

            <InspectorControls group="advanced">
                <PanelBody style={{paddingTop: '20px'}}>
                    <SelectControl
                        value={settings?.['tag']}
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
                   uniqueId={uniqueId} selector={'wpbs-accordion-group'}
                   deps={['wpbs-accordion-group']}
                   props={cssProps}
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
            ...(props.attributes?.['wpbs-props'] ?? {})
        });

        const innerBlocksProps = useInnerBlocksProps.save(blockProps);

        return <ElementTag role="presentation" {...innerBlocksProps} />;
    }
})


