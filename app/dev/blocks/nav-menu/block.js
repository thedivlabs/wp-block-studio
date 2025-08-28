import "./scss/block.scss";

import {
    useBlockProps,
    InspectorControls, PanelColorSettings
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "./block.json"
import {LAYOUT_ATTRIBUTES, LayoutControls} from "Components/Layout"
import {Style, STYLE_ATTRIBUTES} from "Components/Style"
import React, {useCallback, useMemo} from "react";
import {useSelect} from "@wordpress/data";
import {
    __experimentalBorderControl as BorderControl, __experimentalBoxControl as BoxControl,
    __experimentalGrid as Grid,
    __experimentalNumberControl as NumberControl,
    __experimentalUnitControl as UnitControl, BaseControl,
    PanelBody,
    SelectControl,
    TabPanel, TextControl,
    ToggleControl
} from "@wordpress/components";
import {useSetting} from '@wordpress/block-editor';
import {DIMENSION_UNITS, DIMENSION_UNITS_TEXT, TEXT_DECORATION_OPTIONS} from "Includes/config";
import {useUniqueId} from "Includes/helper";


function blockClassNames(attributes = {}) {

    const {'wpbs-nav-menu': settings = {}} = attributes;

    return [
        'wpbs-nav-menu wpbs-has-container flex flex-wrap',
        !!settings?.['icon-below'] ? '--icon-below' : null,
        !!settings?.['submenu-fade'] ? '--fade' : null,
        !!settings?.['divider'] ? '--divider' : null,
        !!settings?.['submenu-divider'] ? '--submenu-divider' : null,
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
    edit: ({attributes, setAttributes, clientId}) => {

        const uniqueId = useUniqueId(attributes, setAttributes, clientId);

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
                '--color-text-decoration-active': settings?.['color-text-decoration-active'] ?? null,
                '--color-text-decoration': settings?.['color-text-decoration'] ?? null,
                '--decoration': settings?.['text-decoration'] ?? null,
                '--columns': parseInt(settings?.['columns-mobile'] ?? settings?.['columns'] ?? 0) || null,
                '--icon': !!settings?.['icon'] ? '"\\' + settings['icon'] + '"' : null,
                '--icon-space': settings?.['icon-space'] ?? null,
                '--color-background': settings?.['color-background'] ?? null,
                '--color-background-hover': settings?.['color-background-hover'] ?? null,
                '--color-background-active': settings?.['color-background-active'] ?? null,
                '--color-text-active': settings?.['color-text-active'] ?? null,
                '--color-icon': settings?.['color-icon'] ?? null,
                '--link-padding': !!settings?.['link-padding'] ? Object.values(settings['link-padding']).join(' ') : null,
                '--submenu-space': settings?.['submenu-space'] ?? null,
                '--submenu-rounded': settings?.['submenu-rounded'] ?? null,
                '--submenu-padding': settings['submenu-padding'],
                '--submenu-gap': settings?.['submenu-gap'] ?? null,
                '--submenu-icon': !!settings?.['submenu-icon'] ? '"\\' + settings['submenu-icon'] + '"' : null,
                '--submenu-icon-space': settings?.['submenu-icon-space'] ?? null,
                '--color-submenu-background': settings?.['color-submenu-background'] ?? null,
                '--color-submenu-background-hover': settings?.['color-submenu-background-hover'] ?? null,
                '--color-submenu-text-hover': settings?.['color-submenu-text-hover'] ?? null,
                '--color-submenu-text': settings?.['color-submenu-text'] ?? null,
                '--color-submenu-icon': settings?.['color-submenu-icon'] ?? null,
                '--color-submenu-divider-hover': settings?.['color-submenu-divider-hover'] ?? null,
                '--color-submenu-background-active': settings?.['color-submenu-background-active'] ?? null,
                '--color-submenu-text-active': settings?.['color-submenu-text-active'] ?? null,
                '--submenu-link-padding': !!settings?.['submenu-link-padding'] ? Object.values(settings['submenu-link-padding']).join(' ') : null,
                '--submenu-border': !!settings?.['submenu-border'] ? Object.values(settings['submenu-border']).join(' ') : null,
                '--submenu-divider': !!settings?.['submenu-divider'] ? Object.values(settings['submenu-divider']).join(' ') : null,
                breakpoints: {
                    [attributes?.['wpbs-breakpoint']?.large ?? 'normal']: {
                        '--divider': !!settings?.['divider'] ? Object.values(settings['divider']).join(' ') : null,
                        '--columns': parseInt(settings?.['columns'] ?? settings?.['columns-mobile'] ?? 0) || null,
                    }
                }
            }).filter(x => !!x))
        }, [settings, attributes?.['wpbs-breakpoint']?.large]);

        const blockProps = useBlockProps({
            className: blockClassNames(attributes),
        });

        const tabOptions = <Grid columns={1} columnGap={15} rowGap={15}>
            <SelectControl
                label="Menu"
                value={settings?.menu}
                options={[
                    {
                        label: 'Select',
                        value: ''
                    },
                    ...menus.map((menu) => ({
                        label: menu.name,
                        value: menu.id,
                    }))
                ]}
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
                <SelectControl
                    label="Text Decoration"
                    value={settings?.['text-decoration']}
                    options={TEXT_DECORATION_OPTIONS}
                    onChange={(newValue) => updateSettings({'text-decoration': newValue})}
                />
            </Grid>
            <Grid columns={2} columnGap={15} rowGap={15}
                  style={{display: !(attributes?.className ?? '').includes('is-style-columns') ? 'none' : 'grid'}}>
                <NumberControl
                    label="Columns"
                    value={settings?.['columns'] ?? undefined}
                    min={1}
                    onChange={(newValue) => updateSettings({'columns': newValue})}
                    __next40pxDefaultSize
                    __nextHasNoMarginBottom
                />
                <NumberControl
                    label="Columns Mobile"
                    value={settings?.['columns-mobile'] ?? undefined}
                    min={1}
                    onChange={(newValue) => updateSettings({'columns-mobile': newValue})}
                    __next40pxDefaultSize
                    __nextHasNoMarginBottom
                />
                <SelectControl
                    label="Text Decoration"
                    value={settings?.['text-decoration']}
                    options={TEXT_DECORATION_OPTIONS}
                    onChange={(newValue) => updateSettings({'text-decoration': newValue})}
                />
            </Grid>
            <BaseControl label={'Colors'}>
                <PanelColorSettings
                    enableAlpha
                    className={'!p-0 !border-0 [&_.components-tools-panel-item]:!m-0'}
                    colorSettings={[
                        {
                            slug: 'color-background',
                            label: 'Background',
                            value: settings?.['color-background'],
                            onChange: (newValue) => updateSettings({'color-background': newValue}),
                            isShownByDefault: true
                        },
                        {
                            slug: 'color-background-hover',
                            label: 'Background Hover',
                            value: settings?.['color-background-hover'],
                            onChange: (newValue) => updateSettings({'color-background-hover': newValue}),
                            isShownByDefault: true
                        },
                        {
                            slug: 'color-icon',
                            label: 'Icon',
                            value: settings?.['color-icon'],
                            onChange: (newValue) => updateSettings({'color-icon': newValue}),
                            isShownByDefault: true
                        },
                        {
                            slug: 'color-text-decoration',
                            label: 'Text Decoration',
                            value: settings?.['color-text-decoration'],
                            onChange: (newValue) => updateSettings({'color-text-decoration': newValue}),
                            isShownByDefault: true
                        },
                    ]}
                />
            </BaseControl>
            <BoxControl
                label={'Link Padding'}
                values={settings?.['link-padding'] ?? {}}
                sides={['top', 'left']}
                allowReset={false}
                onChange={(newValue) => updateSettings({'link-padding': newValue})}
                __nextHasNoMarginBottom={true}
                splitOnAxis={true}
                inputProps={{
                    min: 0,
                    max: 100,
                    units: DIMENSION_UNITS
                }}
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
                        }
                    ]}
                />

            </BaseControl>
            <BoxControl
                label={'Link Padding'}
                values={settings?.['submenu-link-padding'] ?? {}}
                sides={['top', 'left']}
                allowReset={false}
                onChange={(newValue) => updateSettings({'submenu-link-padding': newValue})}
                __nextHasNoMarginBottom={true}
                splitOnAxis={true}
                inputProps={{
                    min: 0,
                    max: 100,
                    units: DIMENSION_UNITS
                }}
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

        const tabActive = <Grid columns={1} columnGap={15} rowGap={15}>
            <BaseControl label={'Colors'}>
                <PanelColorSettings
                    enableAlpha
                    className={'!p-0 !border-0 [&_.components-tools-panel-item]:!m-0'}
                    colorSettings={[
                        {
                            slug: 'color-background-active',
                            label: 'Background',
                            value: settings?.['color-background-active'],
                            onChange: (newValue) => updateSettings({'color-background-active': newValue}),
                            isShownByDefault: true
                        },
                        {
                            slug: 'color-active-text',
                            label: 'Text',
                            value: settings?.['color-text-active'],
                            onChange: (newValue) => updateSettings({'color-text-active': newValue}),
                            isShownByDefault: true
                        },
                        {
                            slug: 'color-active-text',
                            label: 'Text Decoration',
                            value: settings?.['color-text-decoration-active'],
                            onChange: (newValue) => updateSettings({'color-text-decoration-active': newValue}),
                            isShownByDefault: true
                        },
                        {
                            slug: 'color-submenu-background-active',
                            label: 'Sub-menu Background',
                            value: settings?.['color-submenu-background-active'],
                            onChange: (newValue) => updateSettings({'color-submenu-background-active': newValue}),
                            isShownByDefault: true
                        },
                        {
                            slug: 'color-submenu-text-active',
                            label: 'Sub-menu Text',
                            value: settings?.['color-submenu-text-active'],
                            onChange: (newValue) => updateSettings({'color-submenu-text-active': newValue}),
                            isShownByDefault: true
                        }
                    ]}
                />

            </BaseControl>
        </Grid>;

        const tabs = {
            options: tabOptions,
            submenu: tabSubMenu,
            active: tabActive,
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
                            {
                                name: 'active',
                                title: 'Active',
                                className: 'tab-active'
                            },
                        ]}>
                        {
                            (tab) => (<>{tabs[tab.name]}</>)
                        }
                    </TabPanel>

                </PanelBody>
            </InspectorControls>

            <LayoutControls attributes={attributes} setAttributes={setAttributes}/>
            <Style attributes={attributes} setAttributes={setAttributes} props={cssProps} uniqueId={uniqueId}
                   selector={'wpbs-nav-menu'} deps={['wpbs-nav-menu']}/>

            <div {...blockProps}>
                <ul className={'wpbs-nav-menu-container wpbs-layout-wrapper wpbs-container flex flex-wrap'}>
                    <li className={'menu-item current-menu-item'}>
                        <a href={'#'}>Home</a>
                    </li>
                    <li className={'menu-item menu-item-has-children current-menu-ancestor current-menu-parent active'}>
                        <a href={'#'}>Link 1</a>
                        <ul className={'sub-menu'}>
                            <li className={'menu-item current-menu-item'}>
                                <a href={'#'}>Home</a>
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


