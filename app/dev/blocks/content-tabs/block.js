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
import {select, subscribe, useSelect} from '@wordpress/data';
import {store as blockEditorStore} from '@wordpress/block-editor';
import {useInstanceId} from "@wordpress/compose";
import {
    __experimentalUnitControl as UnitControl,
    __experimentalNumberControl as NumberControl,
    PanelBody, TabPanel,
    __experimentalBorderControl as BorderControl,
    __experimentalGrid as Grid,
    ToggleControl, __experimentalBoxControl as BoxControl, TextControl
} from "@wordpress/components";
import React, {useCallback, useMemo} from "react";
import {useUniqueId} from "Includes/helper";
import {DIMENSION_UNITS_TEXT} from "Includes/config";
import {IconControl, MaterialIcon} from "Components/IconControl";


function classNames(attributes = {}, editor = false) {

    return [
        'wpbs-content-tabs',
        'w-full relative',
        !!editor ? 'editor' : null,
        !!attributes['wpbs-content-tabs']?.['collapse'] ? '--collapse' : null,
        !!attributes['wpbs-content-tabs']?.['hide-inactive'] ? '--hide-inactive' : null,
        attributes?.uniqueId ?? '',
    ].filter(x => x).join(' ');
}

function findInnerBlock(blocks, {name, clientId}) {
    for (const block of blocks) {
        if ((name && block.name === name) || (clientId && block.clientId === clientId)) {
            return block;
        }
        if (block.innerBlocks?.length) {
            const found = findInnerBlock(block.innerBlocks, {name, clientId});
            if (found) return found;
        }
    }
    return null;
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

        const uniqueId = useUniqueId(attributes, setAttributes, clientId);

        const {'wpbs-content-tabs': settings = {}} = attributes;

        const updateSettings = useCallback((newValue) => {
            const result = {
                ...settings,
                ...newValue
            };

            setAttributes({
                'wpbs-content-tabs': result
            });

        }, [setAttributes, settings])

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

            <IconControl label={'Icon'} value={settings?.['button-icon']}
                         onChange={(newValue) => updateSettings({'button-icon': newValue})}/>

            <PanelColorSettings
                enableAlpha
                className={'!p-0 !border-0 [&_.components-tools-panel-item]:!m-0'}
                colorSettings={[
                    {
                        slug: 'background-color',
                        label: 'Background Color',
                        value: settings?.['button-color-background'],
                        onChange: (newValue) => updateSettings({'button-color-background': newValue}),
                        isShownByDefault: true
                    },
                    {
                        slug: 'text-color',
                        label: 'Text Color',
                        value: settings?.['button-color-text'],
                        onChange: (newValue) => updateSettings({'button-color-text': newValue}),
                        isShownByDefault: true
                    },
                    {
                        slug: 'icon-color',
                        label: 'Icon Color',
                        value: settings?.['button-color-icon'],
                        onChange: (newValue) => updateSettings({'button-color-icon': newValue}),
                        isShownByDefault: true
                    }
                ]}
            />
            <BorderControl
                __next40pxDefaultSize
                enableAlpha
                enableStyle
                value={settings?.['button-border']}
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
                value={settings?.['button-divider']}
                colors={WPBS?.settings?.colors ?? []}
                __experimentalIsRenderedInSidebar={true}
                label="Divider"
                onChange={(newValue) => updateSettings({'button-divider': newValue})}
                shouldSanitizeBorder
            />
            <BoxControl
                label={'Padding'}
                values={settings?.['button-padding']}
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
                    checked={!!settings?.['button-grow']}
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
                        value: settings?.['button-color-background-hover'],
                        onChange: (newValue) => updateSettings({'button-color-background-hover': newValue}),
                        isShownByDefault: true
                    },
                    {
                        slug: 'text-color-hover',
                        label: 'Text Color',
                        value: settings?.['button-color-text-hover'],
                        onChange: (newValue) => updateSettings({'button-color-text-hover': newValue}),
                        isShownByDefault: true
                    },
                    {
                        slug: 'border-color-hover',
                        label: 'Border Color',
                        value: settings?.['button-color-border-hover'],
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
                        value: settings?.['button-color-background-active'],
                        onChange: (newValue) => updateSettings({'button-color-background-active': newValue}),
                        isShownByDefault: true
                    },
                    {
                        slug: 'text-color-active',
                        label: 'Text Color',
                        value: settings?.['button-color-text-active'],
                        onChange: (newValue) => updateSettings({'button-color-text-active': newValue}),
                        isShownByDefault: true
                    },
                    {
                        slug: 'border-color-active',
                        label: 'Border Color',
                        value: settings?.['button-color-border-active'],
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

        const {'button-border': border, 'button-divider': divider, 'button-padding': padding} = settings;

        const duration = Number(settings?.duration);
        const collapse = !!settings?.collapse;

        const cssProps = useMemo(() => {
            return {
                '--panel-display': collapse ? 'flex' : 'none',
                '--panel-opacity': collapse ? '1' : '0',
                '--fade-duration': duration > 10 ? duration + 'ms' : null,
                '--button-background': settings?.['button-color-background'],
                '--button-text': settings?.['button-color-text'],
                '--button-border': border?.style && border?.color ? `${border.width || '1px'} ${border.style} ${border.color}` : undefined,
                '--button-divider': divider?.style && divider?.color ? `${divider.width || '1px'} ${divider.style} ${divider.color}` : undefined,
                '--button-padding': padding ? `${padding.top || '0px'} ${padding.right || '0px'} ${padding.bottom || '0px'} ${padding.left || '0px'} ` : undefined,
                '--button-background-hover': settings?.['button-color-background-hover'],
                '--button-text-hover': settings?.['button-color-text-hover'],
                '--button-border-hover': settings?.['button-color-border-hover'],
                '--button-background-active': settings?.['button-color-background-active'],
                '--button-text-active': settings?.['button-color-text-active'],
                '--button-border-active': settings?.['button-color-border-active'],
                '--button-icon': !!settings?.['button-icon']?.name ? '"' + settings?.['button-icon']?.name + '"' : null,
                '--button-icon-css': settings?.['button-icon']?.css ?? null,
                '--button-icon-color': settings?.['button-color-icon'],
                '--button-icon-size': settings?.['button-icon-size'],
                'breakpoints': {
                    [attributes?.['wpbs-breakpoint']?.large ?? 'normal']: {
                        '--panel-display': 'none',
                        '--panel-opacity': '0',
                    }
                }
            }
        }, [settings]);

        const innerBlocks = useSelect(
            (select) => select(blockEditorStore).getBlocks(clientId),
            [clientId]
        );

        const {panelBlocks} = useMemo(() => {

            const containerBlock = findInnerBlock(innerBlocks, {name: 'wpbs/content-tabs-container'});

            const panelBlocks = [...containerBlock?.innerBlocks ?? []].filter(x => x.name === 'wpbs/content-tabs-panel').map(panel => {
                return {
                    title: panel?.attributes?.title,
                    clientId: panel?.clientId,
                }
            });

            const panelTitles = panelBlocks.map(x => x.attributes?.title ?? '');

            return {containerBlock, panelBlocks, panelTitles};
        }, [innerBlocks]);

        return <>
            <InspectorControls group="styles">
                <PanelBody title="Options" initialOpen={true}>
                    <Grid columns={2} columnGap={15} rowGap={20}>
                        <ToggleControl
                            label={'Hide'}
                            checked={!!settings?.['hide-inactive']}
                            onChange={(newValue) => updateSettings({'hide-inactive': newValue})}
                            className={'flex items-center'}
                            __nextHasNoMarginBottom
                        />
                        <ToggleControl
                            label={'Collapse'}
                            checked={!!settings?.['collapse']}
                            onChange={(newValue) => updateSettings({'collapse': newValue})}
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
                   deps={['wpbs-content-tabs']} selector={'wpbs-content-tabs'}
                   props={cssProps}
            />
            <BlockContextProvider
                value={{settings,panelBlocks}}
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
            ...(props.attributes?.['wpbs-props'] ?? {})
        });

        const innerBlocksProps = useInnerBlocksProps.save(blockProps);

        return <div {...innerBlocksProps}></div>;
    }
})


