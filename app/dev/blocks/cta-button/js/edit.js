import '../scss/block.scss'

import {
    useBlockProps,
    InspectorControls, PanelColorSettings, BlockEdit
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "../block.json"
import {LayoutSettings, LayoutAttributes, LayoutClasses} from "Components/Layout"
import {
    __experimentalGrid as Grid,
    PanelBody,
    SelectControl, TabPanel,
    TextControl,
    ToggleControl
} from "@wordpress/components";
import {useInstanceId} from "@wordpress/compose";
import React, {useEffect, useState} from "react";
import Link from "Components/Link.js";
import {useSelect} from "@wordpress/data";
import {store as coreStore} from "@wordpress/core-data";
import {Style,Css} from "Components/Style.js";


function elementClassNames(attributes = {}) {

    return [
        'wpbs-cta-button',
        !!attributes['wpbs-icon'] ? 'wpbs-cta-button--icon' : null,
        !!attributes['wpbs-icon-only'] ? 'wpbs-cta-button--icon-only' : false,
        !!attributes['wpbs-icon-first'] ? 'wpbs-cta-button--icon-first' : false,
        attributes.uniqueId,
        LayoutClasses(attributes)
    ].filter(x => x).join(' ');
}

function elementProps(attributes = {}) {


    return Object.fromEntries(
        Object.entries({
            '--icon-color': attributes['wpbs-icon-color'] || null,
        }).filter(([key, value]) => value)
    );
}
function buttonProps(attributes = {}) {


    return Object.fromEntries(
        Object.entries({
            type:'button',
            title: !!attributes['wpbs-icon-only'] && !!attributes['wpbs-link'] ? attributes['wpbs-link'].title : null,
            //'data-wp-interactive': 'wpbs/cta-button',
            //'data-wp-on--click': 'actions.popup',
            'data-popup': attributes['wpbs-popup'] || null,
        }).filter(([key, value]) => value)
    );
}

const Content = ({attributes,editor=false})=>{

    const {'wpbs-link':link = {}, 'wpbs-icon':icon = ''} = attributes;

    const isPopup = !!attributes['wpbs-popup'];
    const title = link.title || 'Learn More';

    const className = [
        'wpbs-cta-button__link wp-element-button',
    ].filter(x => x).join(' ');

    const iconClass = icon.match(/<i[^>]*class=["']([^"']+)["'][^>]*>/i)?.[1] || '';

    if (isPopup || editor) {
        return (
            <button className={className} {...buttonProps(attributes)}>
                <span>{title}</span>
                {iconClass && <i className={iconClass} />}
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
            {iconClass && <i className={iconClass} />}
        </a>
    );
}

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...LayoutAttributes,
        'wpbs-link': {
            type: 'object'
        },
        'wpbs-icon': {
            type: 'string'
        },
        'wpbs-loop': {
            type: 'boolean'
        },
        'wpbs-icon-first': {
            type: 'boolean'
        },
        'wpbs-popup': {
            type: 'string'
        },
        'wpbs-icon-color': {
            type: 'string'
        },
        'wpbs-icon-only': {
            type: 'boolean'
        }
    },
    edit: ({attributes, setAttributes, clientId}) => {

        const uniqueId = useInstanceId(registerBlockType, 'wpbs-cta-button');

        const [link, setLink] = useState(attributes['wpbs-link']);
        const [icon, setIcon] = useState(attributes['wpbs-icon']);
        const [loop, setLoop] = useState(attributes['wpbs-loop']);
        const [popup, setPopup] = useState(attributes['wpbs-popup']);
        const [iconColor, setIconColor] = useState(attributes['wpbs-icon-color']);
        const [iconFirst, setIconFirst] = useState(attributes['wpbs-icon-first']);
        const [iconOnly, setIconOnly] = useState(attributes['wpbs-icon-only']);

        useEffect(() => {
            setAttributes({uniqueId: uniqueId});
        }, []);

        const popups = useSelect(
            (select) =>
                select(coreStore).getEntityRecords('postType', 'popup', {
                    per_page: -1,
                }),
            []
        );

        const tabOptions = <Grid columns={1} columnGap={15} rowGap={20}>
            <SelectControl
                label={'Popup'}
                value={popup}
                onChange={(value) => {
                    setAttributes({'wpbs-popup': value});
                    setPopup(value);
                }}
                options={[
                    /*...popups?.map((popup) => {
                        return {label: popup.title, value: popup.id}
                    }),*/
                    {label: 'Select', value: ''},
                    {label: 'Testing', value: '1234'}
                ]}
                __next40pxDefaultSize
                __nextHasNoMarginBottom
            />

            <Grid columns={2} columnGap={15} rowGap={20}
                  style={{padding: '1rem 0'}}>
                <ToggleControl
                    label="Loop"
                    checked={!!loop}
                    onChange={(value) => {
                        setLoop(value);
                        setAttributes({'wpbs-loop': value});
                    }}
                    className={'flex items-center'}
                    __nextHasNoMarginBottom
                />
            </Grid>
        </Grid>;
        const tabIcon = <Grid columns={1} columnGap={15} rowGap={20}>
            <TextControl
                label="Icon"
                value={icon}
                onChange={(value) => {
                    setIcon(value);
                    setAttributes({['wpbs-icon']: value});
                }}
                __next40pxDefaultSize
                __nextHasNoMarginBottom
            />
            <Grid columns={2} columnGap={15} rowGap={20}
                  style={{padding: '1rem 0'}}>
                <ToggleControl
                    label="Icon Only"
                    checked={!!iconOnly}
                    onChange={(value) => {
                        setIconOnly(value);
                        setAttributes({'wpbs-icon-only': value});
                    }}
                    className={'flex items-center'}
                    __nextHasNoMarginBottom
                />
                <ToggleControl
                    label="Icon First"
                    checked={!!iconFirst}
                    onChange={(value) => {
                        setIconFirst(value);
                        setAttributes({'wpbs-icon-first': value});
                    }}
                    className={'flex items-center'}
                    __nextHasNoMarginBottom
                />
            </Grid>
            <PanelColorSettings
                enableAlpha
                className={'!p-0 !border-0 [&_.components-tools-panel-item]:!m-0'}
                colorSettings={[
                    {
                        slug: 'icon',
                        label: 'Icon Color',
                        value: iconColor,
                        onChange: (value) => {
                            setAttributes({'wpbs-icon-color': value});
                            setIconColor(value);
                        },
                        isShownByDefault: true
                    }
                ]}
            />

        </Grid>;

        const tabs = {
            options: tabOptions,
            icon: tabIcon
        }

        const blockProps = useBlockProps({
            className: elementClassNames(attributes),
            style: elementProps(attributes)
        });

        return (
            <>
                <BlockEdit key="edit" {...blockProps} />
                <LayoutSettings attributes={attributes} setAttributes={setAttributes} />
                <Link defaultValue={link} callback={(newValue) => {
                    setAttributes({['wpbs-link']: newValue});
                    setLink(newValue);
                }}/>
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
                                (tab) => (<>{tabs[tab.name]}</>)
                            }
                        </TabPanel>
                    </PanelBody>
                </InspectorControls>



                <div {...blockProps}>
                    <Content attributes={attributes} editor={true} />
                </div>
            </>
        )
    },
    save: (props) => {

        const blockProps = useBlockProps.save({
            className: elementClassNames(props.attributes),
            style: elementProps(props.attributes)
        });


        return <div {...blockProps}>
            <Content attributes={props.attributes} />
        </div>;
    }
})

