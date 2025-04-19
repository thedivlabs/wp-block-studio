import {
    useBlockProps,
    InspectorControls, PanelColorSettings, BlockEdit,
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "../block.json"
import {Layout, LayoutAttributes, LayoutClasses} from "Components/Layout"
import {
    __experimentalGrid as Grid, PanelBody, SelectControl, TextControl, ToggleControl,
} from "@wordpress/components";
import {useInstanceId} from "@wordpress/compose";
import React, {useEffect, useState} from "react";
import LinkControl from "@wordpress/block-editor/build/components/link-control";


function elementClassNames(attributes = {}) {

    return [
        'wpbs-cta-button inline-flex w-fit max-w-full relative',
        attributes.uniqueId,
        LayoutClasses(attributes)
    ].filter(x => x).join(' ');
}

function Content({attributes}) {


    return <a href={'#'}>AAA</a>;
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
        'wpbs-icon-right': {
            type: 'boolean'
        },
        'wpbs-popup': {
            type: 'string'
        },
        'wpbs-icon-color': {
            type: 'string'
        }
    },
    edit: ({attributes, setAttributes, clientId}) => {

        const uniqueId = useInstanceId(registerBlockType, 'wpbs-cta-button');

        const [link, setLink] = useState(attributes['wpbs-link']);
        const [icon, setIcon] = useState(attributes['wpbs-icon']);
        const [iconRight, setIconRight] = useState(attributes['wpbs-icon-right']);
        const [loop, setLoop] = useState(attributes['wpbs-loop']);
        const [popup, setPopup] = useState(attributes['wpbs-popup']);
        const [iconColor, setIconColor] = useState(attributes['wpbs-icon-color']);

        useEffect(() => {
            setAttributes({uniqueId: uniqueId});
        }, []);

        const blockProps = useBlockProps({
            className: elementClassNames(attributes),
        });


        return (
            <>
                <BlockEdit key="edit" {...blockProps} />
                <InspectorControls group="styles">
                    <PanelBody initialOpen={true}>
                        <Grid columns={1} columnGap={15} rowGap={20}>
                            <LinkControl
                                searchInputPlaceholder="Search here..."
                                label={'Link'}
                                value={link}
                                settings={[
                                    {
                                        id: 'opensInNewTab',
                                        title: 'Open in new tab',
                                    }
                                ]}
                                onChange={(newValue) => {
                                    setLink(newValue);
                                    setAttributes({'wpbs-link': newValue});
                                }}
                                //withCreateSuggestion={true}
                            ></LinkControl>
                            <Grid columns={2} columnGap={15} rowGap={20}>
                                <TextControl
                                    label="Icon"
                                    value={icon}
                                    onChange={(value) => {
                                        setIcon(value);
                                        setAttributes({['wpbs-icon']: value});
                                    }}
                                    __nextHasNoMarginBottom
                                />
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
                            </Grid>
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
                                <ToggleControl
                                    label="Icon on Right"
                                    checked={!!iconRight}
                                    onChange={(value) => {
                                        setIconRight(value);
                                        setAttributes({'wpbs-icon-right': value});
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

                        </Grid>
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


