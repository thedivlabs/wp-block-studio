import './scss/block.scss'

import {
    useBlockProps, getColorClassName,
    InspectorControls, PanelColorSettings, BlockEdit, useSetting, getColorObjectByAttributeValues
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "./block.json"
import {LAYOUT_ATTRIBUTES, LayoutControls} from "Components/Layout"
import {
    __experimentalGrid as Grid, __experimentalUnitControl as UnitControl,
    PanelBody,
    SelectControl, TabPanel,
    TextControl,
    ToggleControl
} from "@wordpress/components";
import React, {useCallback, useEffect, useMemo} from "react";
import Link from "Components/Link.js";
import {useSelect} from "@wordpress/data";
import {store as coreStore} from "@wordpress/core-data";
import {Style, STYLE_ATTRIBUTES} from "Components/Style.js";
import {useUniqueId} from "Includes/helper";
import {getCSSFromStyle} from "Components/Style";

function classNames(attributes = {}) {

    const {'wpbs-cta': settings = {}} = attributes;

    return [
        'wpbs-cta-button wp-element-button',
        !!settings?.['icon'] ? '--icon' : null,
        !!settings?.['icon-hide'] ? '--icon-hide' : null,
        !!settings?.['icon-bold'] ? '--icon-bold' : null,
        !!settings?.['icon-only'] ? '--icon-only' : false,
        !!settings?.['icon-first'] ? '--icon-first' : false,
        attributes?.uniqueId ?? '',
    ].filter(x => x).join(' ');
}


registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...LAYOUT_ATTRIBUTES,
        ...STYLE_ATTRIBUTES,
        'wpbs-cta': {
            type: 'object',
            default: {}
        }
    },
    edit: (props) => {

        const {attributes, setAttributes, clientId} = props;

        const uniqueId = useUniqueId(attributes, setAttributes, clientId);

        const {'wpbs-cta': settings = {}, style} = attributes;

        const updateSettings = useCallback((newValue) => {

            const result = {
                ...settings,
                ...newValue,
            }

            setAttributes({
                'wpbs-cta': result
            });

        }, [settings]);

        const POPUP_QUERY = useMemo(() => ({per_page: -1}), []);

        const popups = useSelect(
            (select) => select(coreStore).getEntityRecords('postType', 'popup', POPUP_QUERY),
            [POPUP_QUERY]
        ) || [];

        const popupOptions = useMemo(() => {
            return [
                {label: 'Select', value: ''},
                ...popups.map((popup) => ({
                    label: popup.title?.raw || '(Untitled)',
                    value: popup.id,
                })),
            ];
        }, [popups]);

        const tabOptions = useMemo(() => (
            <Grid columns={1} columnGap={15} rowGap={20}>
                <SelectControl
                    label="Popup"
                    __nextHasNoMarginBottom
                    value={settings?.popup}
                    options={popupOptions}
                    onChange={(newValue) => updateSettings({popup: newValue})}
                />
                <Grid columns={2} columnGap={15} rowGap={20} style={{padding: '1rem 0'}}>
                    <ToggleControl
                        label="Loop"
                        __nextHasNoMarginBottom
                        checked={!!settings?.loop}
                        onChange={(newValue) => updateSettings({loop: newValue})}
                    />
                </Grid>
            </Grid>
        ), [settings, popups]);

        const tabIcon = useMemo(() => (
            <Grid columns={1} columnGap={15} rowGap={20}>
                <Grid columns={2} columnGap={15} rowGap={20}>
                    <TextControl
                        __nextHasNoMarginBottom
                        __next40pxDefaultSize
                        label="Icon"
                        value={settings?.icon}
                        onChange={(newValue) => updateSettings({icon: newValue})}
                    />
                    <UnitControl
                        label="Icon Size"
                        value={settings?.['icon-size']}
                        onChange={(newValue) => updateSettings({'icon-size': newValue})}
                        units={[
                            {value: 'em', label: 'em', default: 0},
                        ]}
                        isResetValueOnUnitChange={true}
                        __next40pxDefaultSize
                        __nextHasNoMarginBottom
                    />
                </Grid>

                <Grid columns={2} columnGap={15} rowGap={20} style={{padding: '1rem 0'}}>
                    <ToggleControl
                        label="Icon Only"
                        __nextHasNoMarginBottom
                        checked={!!settings?.['icon-only']}
                        onChange={(newValue) => updateSettings({'icon-only': newValue})}
                    />
                    <ToggleControl
                        label="Hide Icon"
                        __nextHasNoMarginBottom
                        checked={!!settings?.['icon-hide']}
                        onChange={(newValue) => updateSettings({'icon-hide': newValue})}
                    />
                    <ToggleControl
                        label="Icon First"
                        __nextHasNoMarginBottom
                        checked={!!settings?.['icon-first']}
                        onChange={(newValue) => updateSettings({'icon-first': newValue})}
                    />
                    <ToggleControl
                        label="Bold Icon"
                        __nextHasNoMarginBottom
                        checked={!!settings?.['icon-bold']}
                        onChange={(newValue) => updateSettings({'icon-bold': newValue})}
                    />
                </Grid>
                <PanelColorSettings
                    enableAlpha
                    className={'!p-0 !border-0 [&_.components-tools-panel-item]:!m-0'}
                    colorSettings={[
                        {
                            slug: 'icon',
                            label: 'Icon Color',
                            value: settings?.['icon-color'],
                            onChange: (newValue) => updateSettings({'icon-color': newValue}),
                            isShownByDefault: true
                        }
                    ]}
                />
            </Grid>
        ), [settings]);

        const {title = 'Learn more', openInNewTab = false} = settings?.link ?? {};

        const blockProps = useBlockProps({
            className: classNames(attributes),
            'data-popup': settings?.popup ?? null,
        });

        const anchorProps = {
            title: title,
            href: '%%URL%%',
            target: !!openInNewTab ? "_blank" : "_self",
        }

        const cssProps = useMemo(() => {
            return Object.fromEntries(
                Object.entries({
                    '--icon': !!(settings?.['icon'] ?? null) ? '\"\\' + settings?.['icon'] + '\"' : null,
                    '--icon-size': settings?.['icon-size'] ?? null,
                    '--icon-color': settings?.['icon-color'] || null,
                }).filter(([key, value]) => value != null) // keep only entries with a value
            );
        }, [settings, style]);

        return (
            <>
                <BlockEdit key="edit" {...blockProps} />
                <Link defaultValue={settings?.link}
                      callback={(newValue) => updateSettings({link: newValue})}/>
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
                                    name: 'icon',
                                    title: 'Icon',
                                    className: 'tab-icon',
                                }
                            ]}>
                            {
                                (tab) => (<>{{
                                    options: tabOptions,
                                    icon: tabIcon
                                }[tab.name]}</>)
                            }
                        </TabPanel>
                    </PanelBody>
                </InspectorControls>

                <LayoutControls attributes={attributes} setAttributes={setAttributes}/>
                <Style attributes={attributes} setAttributes={setAttributes}
                       uniqueId={uniqueId}
                       selector={'wpbs-cta-button'}
                       deps={['wpbs-cta']}
                       props={cssProps}
                />

                <div {...blockProps} onClick={(e) => e.preventDefault()}>
                    <a {...anchorProps}>
                        <span>{title}</span>
                    </a>
                </div>
            </>
        )
    },
    save: (props) => {

        const {'wpbs-cta': settings = {}} = props?.attributes ?? {};

        const {title = 'Learn more', openInNewTab = false} = settings?.link ?? {};

        const blockProps = useBlockProps.save({
            className: classNames(props.attributes),
            'data-popup': settings?.popup ?? null,
            ...(props.attributes?.['wpbs-props'] ?? {})
        });

        const anchorProps = {
            title: title,
            href: '%%URL%%',
            target: !!openInNewTab ? "_blank" : "_self",
        }

        return <div {...blockProps}>
            <a {...anchorProps}>
                <span>{title}</span>
            </a>
        </div>;
    }
})

