import './scss/block.scss'

import {
    useBlockProps,
    InspectorControls, PanelColorSettings, BlockEdit
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
import React, {useCallback, useMemo, useState} from "react";
import Link from "Components/Link.js";
import {useSelect} from "@wordpress/data";
import {store as coreStore} from "@wordpress/core-data";
import {Style, STYLE_ATTRIBUTES} from "Components/Style.js";
import {useUniqueId} from "Includes/helper";


function classNames(attributes = {}) {

    const {'wpbs-cta': settings = {}} = attributes;

    return [
        'wpbs-cta-button',
        !!settings?.['icon'] ? '--icon' : null,
        !!settings?.['icon-hide'] ? '--icon-hide' : null,
        !!settings?.['icon-bold'] ? '--icon-bold' : null,
        !!settings?.['icon-only'] ? '--icon-only' : false,
        !!settings?.['icon-first'] ? '--icon-first' : false,
        attributes?.uniqueId ?? '',
    ].filter(x => x).join(' ');
}

function buttonProps(attributes = {}) {


    return Object.fromEntries(
        Object.entries({
            type: 'button',
            title: !!attributes['wpbs-cta']['icon-only'] && !!attributes['wpbs-cta']['link'] ? attributes['wpbs-cta']['link']?.title ?? null : null,
            //'data-wp-interactive': 'wpbs/cta-button',
            //'data-wp-on--click': 'actions.popup',
            'data-popup': attributes['wpbs-cta']?.['popup'] ?? null,
        }).filter(([key, value]) => value)
    );
}

const Content = ({attributes, editor = false}) => {

    const {link = {}, icon = '', popup = false} = attributes['wpbs-cta'];

    const isButton = !!popup;
    const title = link?.title ?? 'Learn More';

    const className = [
        'wpbs-cta-button__link wp-element-button',
    ].filter(x => x).join(' ');

    if (isButton || editor) {
        return (
            <button className={className} {...buttonProps(attributes)}>
                <span>{title}</span>
            </button>
        );
    }

    const anchorProps = {
        target: !!link.openInNewTab ? "_blank" : "_self",
    }

    const href = '%%URL%%';

    return (
        <a href={href} className={className} {...anchorProps} >
            <span>{title}</span>
        </a>
    );
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
    edit: ({attributes, setAttributes, clientId}) => {

        const uniqueId = useUniqueId(attributes, setAttributes, clientId);

        const [settings, setSettings] = useState(attributes['wpbs-cta']);

        const updateSettings = useCallback((newValue) => {

            const result = {
                ...attributes['wpbs-cta'],
                ...newValue,
            }

            setAttributes({
                'wpbs-cta': result
            });

            setSettings(result);

        }, [attributes['wpbs-cta']]);

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

        const blockProps = useBlockProps({
            className: classNames(attributes),
        });


        const cssProps = useMemo(() => {
            return Object.fromEntries(
                Object.entries({
                    '--icon': !!(settings?.['icon'] ?? null) ? '\"\\' + settings?.['icon'] + '\"' : null,
                    '--icon-size': settings?.['icon-size'] ?? null,
                    '--icon-color': settings?.['icon-color'] || null,
                }).filter(([key, value]) => value != null) // keep only entries with a value
            );
        }, [settings]);

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

                <div {...blockProps}>
                    <Content attributes={attributes} editor={true}/>
                </div>
            </>
        )
    },
    save: (props) => {

        const blockProps = useBlockProps.save({
            className: classNames(props.attributes),
            ...(props.attributes?.['wpbs-props'] ?? {})
        });

        return <div {...blockProps}>
            <Content attributes={props.attributes}/>
        </div>;
    }
})

