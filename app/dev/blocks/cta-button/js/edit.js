import '../scss/block.scss'

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
import {useSelect} from "@wordpress/data";
import {store as coreStore} from "@wordpress/core-data";


function elementClassNames(attributes = {}) {

    return [
        'wpbs-cta-button',
        attributes.uniqueId,
        LayoutClasses(attributes)
    ].filter(x => x).join(' ');
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

        const popups = useSelect(
            (select) =>
                select(coreStore).getEntityRecords('postType', 'popup', {
                    per_page: -1,
                }),
            []
        );

        console.log(popups);

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
                    {label:'Select', value:''},
                    {label:'Testing', value:'1234'}
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
                    <button className={'wpbs-cta-button__link wp-element-button'}>
                        {attributes['wpbs-link'].title || 'Learn More'}
                    </button>
                </div>
            </>
        )
    },
    save: () => null
})


