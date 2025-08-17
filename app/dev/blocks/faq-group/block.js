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
    __experimentalGrid as Grid,
    PanelBody,
    TabPanel,
    TextControl,
    ToggleControl,
    SelectControl,
    BorderControl,
    BaseControl, __experimentalBoxControl as BoxControl,
} from "@wordpress/components";
import React, {useCallback, useMemo} from "react";
import {
    DIMENSION_UNITS,
    DIMENSION_UNITS_TEXT,
    ICON_STYLES,
} from "Includes/config";
import {useUniqueId} from "Includes/helper";
import {useSelect} from "@wordpress/data";


function classNames(attributes = {}) {

    const {'wpbs-faq-group': settings = {}} = attributes;

    return [
        'wpbs-faq-group',
        'w-full relative',
        !settings?.['animate'] ? '--static' : null,
        !!settings?.['icon-hide'] ? '--no-icon' : null,
        !!settings?.['header-color-hover'] ? '--header-hover' : null,
        !!settings?.['header-text-color-hover'] ? '--header-text-hover' : null,
        !!settings?.['header-color-active'] ? '--header-active' : null,
        !!settings?.['header-text-color-active'] ? '--header-text-active' : null,
        !!settings?.['bold-header'] ? '--header-bold' : null,
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
                    label="Header Text"
                    value={settings?.['header-text'] ?? ''}
                    onChange={(val) => updateSettings({'header-text': val})}
                    units={DIMENSION_UNITS_TEXT}
                    isResetValueOnUnitChange={true}
                    __next40pxDefaultSize
                    __nextHasNoMarginBottom
                />
                <UnitControl
                    label="Content Text"
                    value={settings?.['content-text'] ?? ''}
                    onChange={(val) => updateSettings({'content-text': val})}
                    units={DIMENSION_UNITS_TEXT}
                    isResetValueOnUnitChange={true}
                    __next40pxDefaultSize
                    __nextHasNoMarginBottom
                />

                <UnitControl
                    label="Header Line Height"
                    value={settings?.['header-line-height'] ?? ''}
                    onChange={(val) => updateSettings({'header-line-height': val})}
                    units={DIMENSION_UNITS_TEXT}
                    isResetValueOnUnitChange={true}
                    __next40pxDefaultSize
                    __nextHasNoMarginBottom
                />
                <UnitControl
                    label="Content Line Height"
                    value={settings?.['content-line-height'] ?? ''}
                    onChange={(val) => updateSettings({'content-line-height': val})}
                    units={DIMENSION_UNITS_TEXT}
                    isResetValueOnUnitChange={true}
                    __next40pxDefaultSize
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
                <UnitControl
                    label="Item Gap"
                    value={settings?.['item-gap'] ?? ''}
                    onChange={(val) => updateSettings({'item-gap': val})}
                    units={DIMENSION_UNITS}
                    isResetValueOnUnitChange={true}
                    __next40pxDefaultSize
                    __nextHasNoMarginBottom
                />
                <UnitControl
                    label="Item Radius"
                    value={settings?.['item-radius'] ?? ''}
                    onChange={(val) => updateSettings({'item-radius': val})}
                    units={DIMENSION_UNITS}
                    isResetValueOnUnitChange={true}
                    __next40pxDefaultSize
                    __nextHasNoMarginBottom
                />
            </Grid>
            <Grid columns={1} columnGap={15} rowGap={20}>
                <BoxControl
                    label="Header Padding"
                    values={settings?.['header-padding'] ?? {}}
                    sides={['top', 'left', 'right', 'bottom']}
                    onChange={(val) => updateSettings({'header-padding': val})}
                    __nextHasNoMarginBottom={true}
                    inputProps={{
                        min: -300,
                        max: 300,
                        units: DIMENSION_UNITS
                    }}
                />
                <BoxControl
                    label="Content Padding"
                    values={settings?.['content-padding'] ?? {}}
                    sides={['top', 'left', 'right', 'bottom']}
                    onChange={(val) => updateSettings({'content-padding': val})}
                    __nextHasNoMarginBottom={true}
                    inputProps={{
                        min: -300,
                        max: 300,
                        units: DIMENSION_UNITS
                    }}
                />
                <BoxControl
                    label="Item Padding"
                    values={settings?.['item-padding'] ?? {}}
                    sides={['top', 'left', 'right', 'bottom']}
                    onChange={(val) => updateSettings({'item-padding': val})}
                    __nextHasNoMarginBottom={true}
                    inputProps={{
                        min: -300,
                        max: 300,
                        units: DIMENSION_UNITS
                    }}
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
                <ToggleControl
                    label={'Bold Header'}
                    checked={!!settings?.['bold-header']}
                    onChange={(newValue) => updateSettings({'bold-header': newValue})}
                    __nextHasNoMarginBottom
                />
            </Grid>


            <BaseControl label={'Colors'}>
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
                        },
                        {
                            slug: 'header-color',
                            label: 'Header Color',
                            value: settings?.['header-color'],
                            onChange: (newValue) => updateSettings({'header-color': newValue}),
                            isShownByDefault: true
                        },
                        {
                            slug: 'header-text-color',
                            label: 'Header Text Color',
                            value: settings?.['header-text-color'],
                            onChange: (newValue) => updateSettings({'header-text-color': newValue}),
                            isShownByDefault: true
                        },
                        {
                            slug: 'content-color',
                            label: 'Content Color',
                            value: settings?.['content-color'],
                            onChange: (newValue) => updateSettings({'content-color': newValue}),
                            isShownByDefault: true
                        },
                        {
                            slug: 'content-text-color',
                            label: 'Content Text Color',
                            value: settings?.['content-text-color'],
                            onChange: (newValue) => updateSettings({'content-text-color': newValue}),
                            isShownByDefault: true
                        },
                        {
                            slug: 'item-color',
                            label: 'Item Color',
                            value: settings?.['item-color'],
                            onChange: (newValue) => updateSettings({'item-color': newValue}),
                            isShownByDefault: true
                        }
                    ]}
                />
            </BaseControl>

            <BorderControl
                label={'Divider'}
                clearable={true}
                enableAlpha={true}
                colors={WPBS?.settings?.colors}
                disableUnits={true}
                enableStyle={true}
                __next40pxDefaultSize={true}
                value={settings?.['divider']}
                onChange={(newValue) => updateSettings({'divider': newValue})}
            />
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
                    },
                    {
                        slug: 'item-color',
                        label: 'Item Color',
                        value: settings?.['item-color-hover'],
                        onChange: (newValue) => updateSettings({'item-color-hover': newValue}),
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
                    },
                    {
                        slug: 'item-color',
                        label: 'Item Color',
                        value: settings?.['item-color-active'],
                        onChange: (newValue) => updateSettings({'item-color-active': newValue}),
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
                '--divider': Object.values(settings?.['divider'] ?? []).join(' '),
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
                '--header-text-color': settings?.['header-text-color'],
                '--content-text-color': settings?.['content-text-color'],
                '--header-color': settings?.['header-color'],
                '--content-color': settings?.['content-color'],
                '--header-padding': Object.values(settings?.['header-padding'] ?? {}).join(' '),
                '--content-padding': Object.values(settings?.['content-padding'] ?? {}).join(' '),
                '--item-padding': Object.values(settings?.['item-padding'] ?? {}).join(' '),
                '--item-gap': settings?.['item-gap'],
                '--item-radius': settings?.['item-radius'],
                '--item-color': settings?.['item-color'],
                '--item-color-active': settings?.['item-color-active'],
                '--header-text': settings?.['header-text'],
                '--content-text': settings?.['content-text'],
                '--header-line-height': settings?.['header-line-height'],
                '--content-line-height': settings?.['content-line-height'],
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

            <div role="presentation" {...blockProps} >
                <div className={'wpbs-faq-group__item active'}>
                    <div className={'wpbs-faq-group__header'}>
                        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Excepturi, provident?
                        <div className={'wpbs-faq-group__toggle'}/>
                    </div>
                    <div className={'wpbs-faq-group__answer'}>
                        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Amet cupiditate dolorem impedit
                        laborum reiciendis? Aliquam, architecto cum deleniti distinctio ex, ipsum iusto laborum
                        molestiae porro quod rerum, totam voluptas? Maiores!
                    </div>
                </div>
                <div className={'wpbs-faq-group__item'}>
                    <div className={'wpbs-faq-group__header'}>
                        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Excepturi, provident?
                        <div className={'wpbs-faq-group__toggle'}/>
                    </div>
                    <div className={'wpbs-faq-group__answer'}>
                        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Amet cupiditate dolorem impedit
                        laborum reiciendis? Aliquam, architecto cum deleniti distinctio ex, ipsum iusto laborum
                        molestiae porro quod rerum, totam voluptas? Maiores!
                    </div>
                </div>
                <div className={'wpbs-faq-group__item'}>
                    <div className={'wpbs-faq-group__header'}>
                        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Excepturi, provident?
                        <div className={'wpbs-faq-group__toggle'}/>
                    </div>
                    <div className={'wpbs-faq-group__answer'}>
                        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Amet cupiditate dolorem impedit
                        laborum reiciendis? Aliquam, architecto cum deleniti distinctio ex, ipsum iusto laborum
                        molestiae porro quod rerum, totam voluptas? Maiores!
                    </div>
                </div>
                <div className={'wpbs-faq-group__item'}>
                    <div className={'wpbs-faq-group__header'}>
                        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Excepturi, provident?
                        <div className={'wpbs-faq-group__toggle'}/>
                    </div>
                    <div className={'wpbs-faq-group__answer'}>
                        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Amet cupiditate dolorem impedit
                        laborum reiciendis? Aliquam, architecto cum deleniti distinctio ex, ipsum iusto laborum
                        molestiae porro quod rerum, totam voluptas? Maiores!
                    </div>
                </div>
            </div>

        </>;
    },
    save: (props) => null
})


