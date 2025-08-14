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
    __experimentalGrid as Grid, PanelBody, TabPanel, TextControl, ToggleControl, SelectControl, BorderControl,
} from "@wordpress/components";
import React, {useCallback, useMemo} from "react";
import {
    DIMENSION_UNITS_TEXT,
    ICON_STYLES,
} from "Includes/config";
import {useUniqueId} from "Includes/helper";
import {useSelect} from "@wordpress/data";


function classNames(attributes = {}) {

    return [
        'wpbs-faq-group',
        'w-full relative',
        !settings?.['animate'] ? '--static' : null,
        !!settings?.['icon-hide'] ? '--no-icon' : null,
        !!settings?.['header-color-hover'] ? '--header-hover' : null,
        !!settings?.['header-text-color-hover'] ? '--header-text-hover' : null,
        !!settings?.['header-color-active'] ? '--header-active' : null,
        !!settings?.['header-text-color-active'] ? '--header-text-active' : null,
        attributes?.uniqueId ?? '',
    ].filter(x => x).join(' ');
}

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...LAYOUT_ATTRIBUTES,
        ...STYLE_ATTRIBUTES,
        'wpbs-faq-group': {
            type: 'object',
            default: {
                'animate': true,
                'tag': 'div',
            }
        }
    },
    edit: ({attributes, setAttributes, clientId}) => {

        const uniqueId = useUniqueId(attributes, setAttributes, clientId);

        const {'wpbs-faq-group': settings = {}} = attributes;

        const updateSettings = useCallback((newValue) => {
            const result = {
                ...settings,
                ...newValue
            };

            setAttributes({
                'wpbs-faq-group': result,
            });

        }, [setAttributes, settings]);

        const faqs = useSelect((select) => {
            return select('core').getEntityRecords('postType', 'faq', {per_page: -1});
        }, []);


        const blockProps = useBlockProps({
            className: classNames(attributes),
        });

        const tabOptions = <Grid columns={1} columnGap={15} rowGap={20}>
            <SelectControl
                label="FAQ Group"
                value={settings?.['faq-id'] ?? ''}
                options={[
                    {label: 'Select', value: ''},
                    {label: 'Current', value: 'current'},
                    ...(faqs || []).map(post => ({
                        label: post.title.rendered,
                        value: String(post.id)
                    }))
                ]}
                onChange={(newValue) => updateSettings({'faq-id': newValue})}
                __nextHasNoMarginBottom={true}
                __next40pxDefaultSize={true}
            />
            <Grid columns={2} columnGap={15} rowGap={20}>

                <TextControl
                    label={'Icon Closed'}
                    value={settings?.['icon-closed']}
                    onChange={(newValue) => updateSettings({'icon-closed': newValue})}
                    __nextHasNoMarginBottom
                />
                <TextControl
                    label={'Icon Open'}
                    value={settings?.['icon-open']}
                    onChange={(newValue) => updateSettings({'icon-open': newValue})}
                    __nextHasNoMarginBottom
                />
                <UnitControl
                    label="Icon Size"
                    value={settings?.['icon-size'] ?? ''}
                    onChange={(val) => updateSettings({'icon-size': val})}
                    units={DIMENSION_UNITS_TEXT}
                    isResetValueOnUnitChange={true}
                    __next40pxDefaultSize
                    __nextHasNoMarginBottom
                />
                <SelectControl
                    label="Icon Style"
                    value={settings?.['icon-style'] ?? ''}
                    options={ICON_STYLES}
                    onChange={(val) => updateSettings({'icon-style': val})}
                    __next40pxDefaultSize
                    __nextHasNoMarginBottom
                />
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

                <BorderControl
                    clearable={true}
                    enableAlpha={true}
                    disableUnits={true}
                    enableStyle={true}
                    __next40pxDefaultSize={true}
                    value={settings?.['divider']}
                    onChange={(newValue) => updateSettings({'divider': newValue})}
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

        const iconOpen = settings?.['icon-open']?.match(/^[a-fA-F0-9]{2,6}$/) ? settings?.['icon-open'] : 'f078';
        const iconClosed = settings?.['icon-closed']?.match(/^[a-fA-F0-9]{2,6}$/) ? settings?.['icon-closed'] : 'f078';

        const ElementTag = settings?.['tag'] ?? 'div';

        const cssProps = useMemo(() => {
            return {
                '--divider': settings?.['divider'],
                '--icon-open': `"\\${iconOpen}"`,
                '--icon-closed': `"\\${iconClosed}"`,
                '--icon-style': settings?.['icon-style'],
                '--icon-size': settings?.['icon-size'],
                '--icon-color': settings?.['icon-color'],
                '--icon-color-hover': settings?.['icon-color-hover'],
                '--header-color-hover': settings?.['header-color-hover'],
                '--header-text-color-hover': settings?.['header-text-color-hover'],
                '--icon-color-active': settings?.['icon-color-active'],
                '--header-color-active': settings?.['header-color-active'],
                '--header-text-color-active': settings?.['header-text-color-active'],
            }
        }, [settings, iconOpen, iconClosed]);

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

                <PanelBody initialOpen={true}>
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
                   uniqueId={uniqueId} selector={'wpbs-faq-group'}
                   deps={['wpbs-faq-group']}
                   props={cssProps}
            />

            <ElementTag role="presentation" {...blockProps} >
                FAQS
            </ElementTag>

        </>;
    },
    save: (props) => null
})


