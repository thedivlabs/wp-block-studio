import "./scss/block.scss";

import {
    useBlockProps,
    InspectorControls, PanelColorSettings
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "./block.json"
import {LAYOUT_ATTRIBUTES, LayoutControls} from "Components/Layout"
import {Style, STYLE_ATTRIBUTES} from "Components/Style"
import {useInstanceId} from '@wordpress/compose';
import React, {useCallback, useMemo} from "react";
import {useSelect} from "@wordpress/data";
import {
    __experimentalBorderControl as BorderControl, __experimentalBoxControl as BoxControl,
    __experimentalGrid as Grid,
    __experimentalUnitControl as UnitControl, BaseControl,
    PanelBody,
    SelectControl,
    TabPanel, TextControl,
    ToggleControl
} from "@wordpress/components";
import {useSetting} from '@wordpress/block-editor';
import {DIMENSION_UNITS, DIMENSION_UNITS_TEXT} from "Includes/config";


function blockClassNames(attributes = {}) {

    const {'wpbs-nav-menu': settings = {}} = attributes;

    return [
        'wpbs-nav-menu wpbs-has-container flex flex-wrap',
        !!settings?.['submenu-fade'] ? '--fade' : null,
        attributes?.uniqueId ?? null
    ].filter(x => x).join(' ');
}

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...LAYOUT_ATTRIBUTES,
        ...STYLE_ATTRIBUTES,
        'wpbs-nav-menu': {
            type: 'object',
        }
    },
    edit: ({attributes, setAttributes}) => {

        const uniqueId = useInstanceId(registerBlockType, 'wpbs-nav-menu');

        const {'wpbs-nav-menu': settings = {}} = attributes;
        const themeColors = useSetting('color.palette');
        const menus = useSelect((select) => {
            const core = select('core');

            // Always call the selector to trigger resolution
            const data = core.getMenus?.();

            if (!core.hasFinishedResolution('getMenus')) {
                return []; // Use undefined instead of null
            }

            return data?.map(menu => ({
                id: menu.id,
                name: menu.name,
                slug: menu.slug,
                locations: menu.locations,
            }));
        }, []);

        const updateSettings = useCallback((newValue) => {

            const result = {
                ...settings,
                ...newValue,
            }

            setAttributes({'wpbs-nav-menu': result});

        }, [settings, setAttributes]);

        const cssProps = useMemo(() => {
            return Object.fromEntries(Object.entries({
                '--icon': settings?.['icon'] ?? null,
                '--icon-space': settings?.['icon-space'] ?? null,
                '--color-background-active': settings?.['color-background-active'] ?? null,
                '--color-text-active': settings?.['color-text-active'] ?? null,
                '--link-padding': settings?.['link-padding'] ?? null,
                '--divider': settings?.['divider'] ?? null,
                '--submenu-space': settings?.['submenu-space'] ?? null,
                '--submenu-rounded': settings?.['submenu-rounded'] ?? null,
                '--submenu-padding': settings?.['submenu-padding'] ?? null,
                '--submenu-gap': settings?.['submenu-gap'] ?? null,
                '--submenu-icon': settings?.['submenu-icon'] ?? null,
                '--submenu-icon-space': settings?.['submenu-icon-space'] ?? null,
                '--submenu-color-background': settings?.['submenu-color-background'] ?? null,
                '--submenu-color-background-hover': settings?.['submenu-color-background-hover'] ?? null,
                '--submenu-color-text-hover': settings?.['submenu-color-text-hover'] ?? null,
                '--submenu-color-text': settings?.['submenu-color-text'] ?? null,
                '--submenu-color-icon': settings?.['submenu-color-icon'] ?? null,
                '--submenu-color-divider-hover': settings?.['submenu-color-divider-hover'] ?? null,
                '--submenu-color-background-active': settings?.['submenu-color-background-active'] ?? null,
                '--submenu-color-text-active': settings?.['submenu-color-text-active'] ?? null,
                '--submenu-link-padding': settings?.['submenu-link-padding'] ?? null,
                '--submenu-border': settings?.['submenu-border'] ?? null,
                '--submenu-divider': settings?.['submenu-divider'] ?? null,
            }).filter(x => !!x))
        }, [settings]);

        const blockProps = useBlockProps({
            className: blockClassNames(attributes),
        });

        const tabOptions = <Grid columns={1} columnGap={15} rowGap={15}>
            <SelectControl
                label="Menu"
                value={settings?.menu}
                options={menus.map((menu) => ({
                    label: menu.name,
                    value: menu.id,
                }))}
                onChange={(newValue) => updateSettings({menu: newValue})}
            />
            <Grid columns={2} columnGap={15} rowGap={15}>
                <TextControl
                    __nextHasNoMarginBottom
                    __next40pxDefaultSize
                    label="Icon"
                    value={settings?.['icon'] ?? ''}
                    onChange={(newValue) => updateSettings({'icon': newValue})}
                />
                <UnitControl
                    label="Icon Space"
                    value={settings?.['icon-space'] ?? ''}
                    onChange={(newValue) => updateSettings({'icon-space': newValue})}
                    units={DIMENSION_UNITS_TEXT}
                    isResetValueOnUnitChange={true}
                    __next40pxDefaultSize
                    __nextHasNoMarginBottom
                />
            </Grid>
            <BaseControl label={'Colors'}>
                <PanelColorSettings
                    enableAlpha
                    className={'!p-0 !border-0 [&_.components-tools-panel-item]:!m-0'}
                    colorSettings={[
                        {
                            slug: 'color-background-active',
                            label: 'Background Active',
                            value: settings?.['color-background-active'],
                            onChange: (newValue) => updateSettings({'color-background-active': newValue}),
                            isShownByDefault: true
                        },
                        {
                            slug: 'color-active-text',
                            label: 'Text Active',
                            value: settings?.['color-text-active'],
                            onChange: (newValue) => updateSettings({'color-text-active': newValue}),
                            isShownByDefault: true
                        },
                        {
                            slug: 'color-icon',
                            label: 'Icon',
                            value: settings?.['color-icon'],
                            onChange: (newValue) => updateSettings({'color-icon': newValue}),
                            isShownByDefault: true
                        }
                    ]}
                />
            </BaseControl>
            <BoxControl
                label={'Link Padding'}
                value={settings?.['link-padding'] ?? ''}
                sides={['top', 'left']}
                onChange={(newValue) => updateSettings({'link-padding': newValue})}
                __nextHasNoMarginBottom={true}
            />
            <BorderControl
                __next40pxDefaultSize
                enableAlpha
                enableStyle
                value={settings?.['divider'] || {}}
                colors={themeColors}
                __experimentalIsRenderedInSidebar={true}
                label="Divider"
                onChange={(newValue) => {
                    updateSettings({'divider': newValue})
                }}
                shouldSanitizeBorder
            />
            <Grid columns={2} columnGap={15} rowGap={15}
                  style={{padding: '1rem 0'}}>
                <ToggleControl
                    label="Icon Below"
                    onChange={(newValue) => updateSettings({'icon-below': newValue})}
                    checked={!!settings?.['icon-below']}
                    className={'flex items-center'}
                    __nextHasNoMarginBottom
                />
            </Grid>
        </Grid>;

        const tabSubMenu = <Grid columns={1} columnGap={15} rowGap={15}>
            <Grid columns={2} columnGap={15} rowGap={15}>

                <UnitControl
                    label="Space"
                    value={settings?.['submenu-space'] ?? ''}
                    onChange={(newValue) => updateSettings({'submenu-space': newValue})}
                    units={DIMENSION_UNITS_TEXT}
                    isResetValueOnUnitChange={true}
                    __next40pxDefaultSize
                    __nextHasNoMarginBottom
                />
                <UnitControl
                    label="Rounded"
                    value={settings?.['submenu-rounded'] ?? ''}
                    onChange={(newValue) => updateSettings({'submenu-rounded': newValue})}
                    units={DIMENSION_UNITS_TEXT}
                    isResetValueOnUnitChange={true}
                    __next40pxDefaultSize
                    __nextHasNoMarginBottom
                />
                <UnitControl
                    label="Padding"
                    value={settings?.['submenu-padding'] ?? ''}
                    onChange={(newValue) => updateSettings({'submenu-padding': newValue})}
                    units={DIMENSION_UNITS_TEXT}
                    isResetValueOnUnitChange={true}
                    __next40pxDefaultSize
                    __nextHasNoMarginBottom
                />
                <UnitControl
                    label="Gap"
                    value={settings?.['submenu-gap'] ?? ''}
                    onChange={(newValue) => updateSettings({'submenu-gap': newValue})}
                    units={DIMENSION_UNITS_TEXT}
                    isResetValueOnUnitChange={true}
                    __next40pxDefaultSize
                    __nextHasNoMarginBottom
                />

                <TextControl
                    __nextHasNoMarginBottom
                    __next40pxDefaultSize
                    label="Icon"
                    value={settings?.['submenu-icon'] ?? ''}
                    onChange={(newValue) => updateSettings({'submenu-icon': newValue})}
                />
                <UnitControl
                    label="Icon Space"
                    value={settings?.['submenu-icon-space'] ?? ''}
                    onChange={(newValue) => updateSettings({'submenu-icon-space': newValue})}
                    units={DIMENSION_UNITS_TEXT}
                    isResetValueOnUnitChange={true}
                    __next40pxDefaultSize
                    __nextHasNoMarginBottom
                />

            </Grid>
            <BaseControl label={'Colors'}>
                <PanelColorSettings
                    enableAlpha
                    className={'!p-0 !border-0 [&_.components-tools-panel-item]:!m-0'}
                    colorSettings={[
                        {
                            slug: 'color-submenu-background',
                            label: 'Background',
                            value: settings?.['color-submenu-background'],
                            onChange: (newValue) => updateSettings({'color-submenu-background': newValue}),
                            isShownByDefault: true
                        },
                        {
                            slug: 'color-submenu-background-hover',
                            label: 'Background Hover',
                            value: settings?.['color-submenu-background-hover'],
                            onChange: (newValue) => updateSettings({'color-submenu-background-hover': newValue}),
                            isShownByDefault: true
                        },
                        {
                            slug: 'color-submenu-text',
                            label: 'Text',
                            value: settings?.['color-submenu-text'],
                            onChange: (newValue) => updateSettings({'color-submenu-text': newValue}),
                            isShownByDefault: true
                        },
                        {
                            slug: 'color-submenu-text-hover',
                            label: 'Text Hover',
                            value: settings?.['color-submenu-text-hover'],
                            onChange: (newValue) => updateSettings({'color-submenu-text-hover': newValue}),
                            isShownByDefault: true
                        },
                        {
                            slug: 'color-submenu-icon',
                            label: 'Icon',
                            value: settings?.['color-submenu-icon'],
                            onChange: (newValue) => updateSettings({'color-submenu-icon': newValue}),
                            isShownByDefault: true
                        },
                        {
                            slug: 'color-submenu-background-active',
                            label: 'Background Active',
                            value: settings?.['color-submenu-background-active'],
                            onChange: (newValue) => updateSettings({'color-submenu-background-active': newValue}),
                            isShownByDefault: true
                        },
                        {
                            slug: 'color-submenu-text-active',
                            label: 'Text Active',
                            value: settings?.['color-submenu-text-active'],
                            onChange: (newValue) => updateSettings({'color-submenu-text-active': newValue}),
                            isShownByDefault: true
                        }
                    ]}
                />

            </BaseControl>
            <BoxControl
                label={'Link Padding'}
                value={settings?.['submenu-link-padding'] ?? ''}
                sides={['top', 'left']}
                onChange={(newValue) => updateSettings({'submenu-link-padding': newValue})}
                __nextHasNoMarginBottom={true}
            />
            <BorderControl
                __next40pxDefaultSize
                enableAlpha
                enableStyle
                value={settings?.['submenu-border'] || {}}
                colors={themeColors}
                __experimentalIsRenderedInSidebar={true}
                label="Border"
                onChange={(newValue) => {
                    updateSettings({'submenu-border': newValue})
                }}
                shouldSanitizeBorder
            />
            <BorderControl
                __next40pxDefaultSize
                enableAlpha
                enableStyle
                colors={themeColors}
                value={settings?.['submenu-divider'] || {}}
                __experimentalIsRenderedInSidebar={true}
                label="Divider"
                onChange={(newValue) => {
                    updateSettings({'submenu-divider': newValue})
                }}
                shouldSanitizeBorder
            />
            <Grid columns={2} columnGap={15} rowGap={20}
                  style={{padding: '1rem 0'}}>
                <ToggleControl
                    label="Fade"
                    onChange={(newValue) => updateSettings({'submenu-fade': newValue})}
                    checked={!!settings?.['submenu-fade']}
                    className={'flex items-center'}
                    __nextHasNoMarginBottom
                />
            </Grid>
        </Grid>;

        const tabs = {
            options: tabOptions,
            submenu: tabSubMenu,
        }

        return <>

            <InspectorControls group={'styles'}>

                <PanelBody>
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
                                name: 'submenu',
                                title: 'Sub-Menu',
                                className: 'tab-submenu'
                            },
                        ]}>
                        {
                            (tab) => (<>{tabs[tab.name]}</>)
                        }
                    </TabPanel>

                </PanelBody>
            </InspectorControls>

            <LayoutControls attributes={attributes} setAttributes={setAttributes}/>
            <Style attributes={attributes} setAttributes={setAttributes} props={cssProps} uniqueId={uniqueId}/>

            <div {...blockProps}>
                <ul className={'wpbs-nav-menu-container wpbs-layout-wrapper wpbs-container flex flex-wrap'}>
                    <li className={'menu-item menu-item-has-children'}>
                        <a href={'#'}>Link 1</a>
                        <ul className={'sub-menu'}>
                            <li className={'menu-item'}>
                                <a href={'#'}>Sub-Link 1</a>
                            </li>
                            <li className={'menu-item'}>
                                <a href={'#'}>Sub-Link 2</a>
                            </li>
                            <li className={'menu-item'}>
                                <a href={'#'}>Sub-Link 3</a>
                            </li>
                            <li className={'menu-item'}>
                                <a href={'#'}>Sub-Link 4</a>
                            </li>
                        </ul>
                    </li>
                    <li className={'menu-item menu-item-has-children'}>
                        <a href={'#'}>Link 2</a>
                        <ul className={'sub-menu'}>
                            <li className={'menu-item'}>
                                <a href={'#'}>Sub-Link 1</a>
                            </li>
                            <li className={'menu-item'}>
                                <a href={'#'}>Sub-Link 2</a>
                            </li>
                            <li className={'menu-item'}>
                                <a href={'#'}>Sub-Link 3</a>
                            </li>
                            <li className={'menu-item'}>
                                <a href={'#'}>Sub-Link 4</a>
                            </li>
                        </ul>
                    </li>
                    <li className={'menu-item'}>
                        <a href={'#'}>Link 3</a>
                    </li>
                    <li className={'menu-item'}>
                        <a href={'#'}>Link 4</a>
                    </li>
                </ul>
            </div>
        </>

    },
    save: () => {
        return null;
    }
})


