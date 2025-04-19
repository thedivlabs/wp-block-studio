import {
    useBlockProps,
    InspectorControls, PanelColorSettings, BlockEdit
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "../block.json"
import {Layout, LayoutAttributes, LayoutClasses} from "Components/Layout"
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
import {BackgroundSettings} from "Components/Background.js";


function elementClassNames(attributes = {}) {

    return [
        'wpbs-cta-button inline-flex w-fit max-w-full relative',
        attributes.uniqueId,
        LayoutClasses(attributes)
    ].filter(x => x).join(' ');
}

function Content({attributes}) {

    const {
        'wpbs-link': link = {},
        'wpbs-loop': loop,
        'wpbs-icon': icon,
        'wpbs-icon-color': iconColor,
        'wpbs-icon-only': iconOnly,
        'wpbs-icon-position': iconPosition,
        'wpbs-popup': popup,

    } = attributes;

    const Title = () => {
        if (!'title' in link) {
            return false
        }

        if (!!iconOnly) {
            return <span className={'screen-reader-text'}>{link.title}</span>;
        } else {
            return link.title || false
        }
    }

    const linkUrl = () => {
        if (!!loop) {
            return link.url || '#';
        } else {
            return '#';
        }
    }

    const classNames = [
        'wpbs-cta-button__link inline-flex items-center text-center',
        iconPosition === 'left' ? 'flex-row-reverse' : 'flex-row'
    ].filter(x => x).join(' ');

    const style = Object.fromEntries(
        Object.entries({
            '--icon': icon || false,
            '--icon-color': iconColor || false,
        }).filter(([key, value]) => value));

    const props = Object.fromEntries(
        Object.entries({
            className: classNames,
            'data-popup': popup || false,
            style: style
        }).filter(([key, value]) => value));

    return <a href={linkUrl} {...props} >
        <Title/>
    </a>;
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
        'wpbs-icon-position': {
            type: 'string'
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
        const [iconPosition, setIconPosition] = useState(attributes['wpbs-icon-position']);
        const [iconOnly, setIconOnly] = useState(attributes['wpbs-icon-only']);

        useEffect(() => {
            setAttributes({uniqueId: uniqueId});
        }, []);

        const tabOptions = <Grid columns={1} columnGap={15} rowGap={20}>
            <SelectControl
                label={'Popup'}
                value={popup}
                onChange={(value) => {
                    setAttributes({'wpbs-popup': value});
                    setPopup(value);
                }}
                options={[]}
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
            <Grid columns={2} columnGap={15} rowGap={20}>
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
                <SelectControl
                    label={'Icon Position'}
                    value={iconPosition}
                    onChange={(value) => {
                        setAttributes({'wpbs-icon-position': value});
                        setIconPosition(value);
                    }}
                    options={[
                        {label: 'Select', value: ''},
                        {label: 'Left', value: 'left'},
                        {label: 'Right', value: 'right'},
                    ]}
                    __next40pxDefaultSize
                    __nextHasNoMarginBottom
                />
            </Grid>
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
        });


        return (
            <>
                <BlockEdit key="edit" {...blockProps} />
                <Link defaultValue={link} callback={(newValue) => {
                    setAttributes({['wpbs-link']: newValue});
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

                <Layout blockProps={blockProps} attributes={attributes} setAttributes={setAttributes}
                        clientId={clientId}></Layout>

                <div {...blockProps}>
                    <Content attributes={attributes}/>
                </div>
            </>
        )
    },
    save: (props) => {


        const blockProps = useBlockProps.save({
            className: elementClassNames(props.attributes),
        });

        return (
            <div {...blockProps}>
                <Content attributes={props.attributes}/>
            </div>
        );
    }
})


