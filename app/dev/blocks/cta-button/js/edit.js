import '../scss/block.scss'

import {
    useBlockProps,
    InspectorControls, PanelColorSettings, BlockEdit
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "../block.json"
import {LAYOUT_ATTRIBUTES, LayoutControls} from "Components/Layout"
import {
    __experimentalGrid as Grid,
    PanelBody,
    SelectControl, TabPanel,
    TextControl,
    ToggleControl
} from "@wordpress/components";
import {useInstanceId} from "@wordpress/compose";
import React, {useCallback, useEffect, useMemo, useState} from "react";
import Link from "Components/Link.js";
import {useSelect} from "@wordpress/data";
import {store as coreStore} from "@wordpress/core-data";
import {Style, STYLE_ATTRIBUTES} from "Components/Style.js";


function classNames(attributes = {}) {

    return [
        'wpbs-cta-button',
        !!attributes['wpbs-cta']['icon'] ? 'wpbs-cta-button--icon' : null,
        !!attributes['wpbs-cta']['icon-only'] ? 'wpbs-cta-button--icon-only' : false,
        !!attributes['wpbs-cta']['icon-first'] ? 'wpbs-cta-button--icon-first' : false,
        attributes.uniqueId,
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

    const iconClass = icon.match(/<i[^>]*class=["']([^"']+)["'][^>]*>/i)?.[1] || '';

    if (isButton || editor) {
        return (
            <button className={className} {...buttonProps(attributes)}>
                <span>{title}</span>
                {iconClass && <i className={iconClass}/>}
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
            {iconClass && <i className={iconClass}/>}
        </a>
    );
}

const POPUP_QUERY = {
    hide_empty: true,
    per_page: -1,
    status: 'publish',
    order: 'asc',
    orderby: 'title',
};

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

        const uniqueId = useInstanceId(registerBlockType, 'wpbs-cta-button');

        const [settings, setSettings] = useState(attributes['wpbs-cta']);

        useEffect(() => {
            setAttributes({uniqueId: uniqueId});
        }, []);


        const MemoSelectControl = React.memo(({label, prop, options}) => (
            <SelectControl
                label={label}
                value={settings?.[prop]}
                onChange={(newValue) => updateSettings({[prop]: newValue})}
                options={options}
                __next40pxDefaultSize
                __nextHasNoMarginBottom
            />
        ));

        const MemoToggleControl = React.memo(({label, prop}) => (
            <ToggleControl
                label={label}
                checked={!!settings?.[prop]}
                onChange={(newValue) => updateSettings({[prop]: newValue})}
                className={'flex items-center'}
                __nextHasNoMarginBottom
            />
        ));

        const MemoTextControl = React.memo(({label, prop}) => (
            <TextControl
                label={label}
                value={settings?.[prop]}
                onChange={(newValue) => updateSettings({[prop]: newValue})}
                __next40pxDefaultSize
                __nextHasNoMarginBottom
            />
        ));

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

        const popups = useSelect(
            (select) => select(coreStore).getEntityRecords('postType', 'popup', POPUP_QUERY),
            []
        ) || [];

        const popupOptions = useMemo(() => {
            if (!popups) return [];
            return [
                {
                    label: 'Select',
                    value: '',
                },
                ...popups.map((popup) => ({
                    label: popup.title?.raw || '(Untitled)',
                    value: popup.id,
                }))];
        }, [popups]);

        const tabOptions = useMemo(() => (
            <Grid columns={1} columnGap={15} rowGap={20}>
                <MemoSelectControl
                    label="Popup"
                    prop={'popup'}
                    options={popupOptions}
                />
                <Grid columns={2} columnGap={15} rowGap={20} style={{padding: '1rem 0'}}>
                    <MemoToggleControl
                        label="Loop"
                        prop={'loop'}
                    />
                </Grid>
            </Grid>
        ), [settings]);

        const tabIcon = useMemo(() => (
            <Grid columns={1} columnGap={15} rowGap={20}>
                <MemoTextControl
                    label="Icon"
                    prop={'icon'}
                />
                <Grid columns={2} columnGap={15} rowGap={20} style={{padding: '1rem 0'}}>
                    <MemoToggleControl
                        label="Icon Only"
                        prop={'icon-only'}
                    />
                    <MemoToggleControl
                        label="Icon First"
                        prop={'icon-first'}
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
                       deps={['wpbs-cta']}
                       props={{
                           '--icon-color': settings?.['icon-color'] || null,
                       }}
                />

                <div {...blockProps}>
                    <Content attributes={attributes} editor={true}/>
                </div>
            </>
        )
    },
    save: (props) => {

        const blockProps = useBlockProps.save({
            className: classNames(props.attributes)
        });

        return <div {...blockProps}>
            <Content attributes={props.attributes}/>
        </div>;
    }
})

