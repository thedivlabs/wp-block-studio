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
    __experimentalBorderControl as BorderControl,
    __experimentalGrid as Grid,
    __experimentalUnitControl as UnitControl,
    PanelBody,
    SelectControl,
    TabPanel, TextControl,
    ToggleControl
} from "@wordpress/components";
import {useSetting} from '@wordpress/block-editor';


function blockClassNames(attributes = {}) {
    return [
        'wpbs-nav-menu wpbs-has-container flex flex-wrap',
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
            return {};
        }, [settings]);

        const blockProps = useBlockProps({
            className: blockClassNames(attributes),
        });

        const tabOptions = <Grid columns={1} columnGap={15} rowGap={20}>
            <SelectControl
                label="Menu"
                value={settings?.menu}
                options={menus.map((menu) => ({
                    label: menu.name,
                    value: menu.id,
                }))}
                onChange={(newValue) => updateSettings({menu: newValue})}
            />
            <Grid columns={2} columnGap={15} rowGap={20}>
                <TextControl
                    __nextHasNoMarginBottom
                    __next40pxDefaultSize
                    label="Icon"
                    value={settings?.['icon'] ?? ''}
                    onChange={(newValue) => updateSettings({'icon': newValue})}
                />
            </Grid>
            <PanelColorSettings
                enableAlpha
                className={'!p-0 !border-0 [&_.components-tools-panel-item]:!m-0'}
                colorSettings={[
                    {
                        slug: 'color-current',
                        label: 'Current',
                        value: settings?.['color-current'],
                        onChange: (newValue) => updateSettings({'color-current': newValue}),
                        isShownByDefault: true
                    }
                ]}
            />
            <BorderControl
                __next40pxDefaultSize
                enableAlpha
                enableStyle
                value={settings?.['link-border'] || {}}
                colors={themeColors}
                __experimentalIsRenderedInSidebar={true}
                label="Link Border"
                onChange={(newValue) => {
                    updateSettings({'link-border': newValue})
                }}
                shouldSanitizeBorder
            />
            <Grid columns={2} columnGap={15} rowGap={20}
                  style={{padding: '1rem 0'}}>
                <ToggleControl
                    label="Icon Below"
                    onChange={(newValue) => updateSettings({'icon-below': newValue})}
                    checked={!!settings?.['icon-below']}
                    className={'flex items-center'}
                    __nextHasNoMarginBottom
                />
                <ToggleControl
                    label="Dividers"
                    onChange={(newValue) => updateSettings({'dividers': newValue})}
                    checked={!!settings?.['dividers']}
                    className={'flex items-center'}
                    __nextHasNoMarginBottom
                />
            </Grid>
        </Grid>;

        const tabSubMenu = <Grid columns={1} columnGap={15} rowGap={20}>
            <Grid columns={2} columnGap={15} rowGap={20}>
                <TextControl
                    __nextHasNoMarginBottom
                    __next40pxDefaultSize
                    label="Icon"
                    value={settings?.['submenu-icon'] ?? ''}
                    onChange={(newValue) => updateSettings({'submenu-icon': newValue})}
                />
            </Grid>
            <PanelColorSettings
                enableAlpha
                className={'!p-0 !border-0 [&_.components-tools-panel-item]:!m-0'}
                colorSettings={[
                    {
                        slug: 'color-submenu-background',
                        label: 'Background',
                        value: settings?.['color-submenu-background'],
                        onChange: (newValue) => updateSettings({'submenu-color-background': newValue}),
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
                        slug: 'color-submenu-border-hover',
                        label: 'Border Hover',
                        value: settings?.['color-submenu-border-hover'],
                        onChange: (newValue) => updateSettings({'color-submenu-border-hover': newValue}),
                        isShownByDefault: true
                    }
                ]}
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


