import {
    useBlockProps,
    InspectorControls,
    BlockEdit, MediaUploadCheck, MediaUpload
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "../block.json"
import {Layout, LayoutAttributes, LayoutClasses} from "Components/Layout"
import {
    __experimentalGrid as Grid,
    BaseControl,
    Button,
    PanelBody,
    SelectControl, TextControl,
    ToggleControl,
} from "@wordpress/components";
import PreviewThumbnail from "Components/PreviewThumbnail";
import Picture from "Components/Picture";
import React, {useEffect, useState} from "react";

import {useSettings} from '@wordpress/block-editor';
import Overlay from "Components/Overlay";
import {imageButtonStyle} from "Inc/helper";
import {useInstanceId} from '@wordpress/compose';
import Resolution from "Components/Resolution";

function blockClasses(attributes = {}) {
    return [
        'wpbs-video flex items-center justify-center relative w-full h-auto aspect-video relative overflow-hidden',
        attributes.uniqueId,
        LayoutClasses(attributes)
    ].filter(x => x).join(' ');
}

const blockAttributes = {
    'wpbs-posterImage': {
        type: 'object'
    },
    'wpbs-eager': {
        type: 'boolean'
    },
    'wpbs-modal': {
        type: 'boolean'
    },
    'wpbs-resolution': {
        type: 'string'
    },
    'wpbs-overlay': {
        type: 'string'
    },
    'wpbs-shareLink': {
        type: 'string'
    },
    'wpbs-platform': {
        type: 'string'
    },
    'wpbs-title': {
        type: 'string'
    },
}

function Media({attributes, editor = false}) {


    const mediaClasses = [
        'wpbs-video__media w-full h-full overflow-hidden relative object-cover object-center',
    ].filter(x => x).join(' ');

    return <div class={mediaClasses}>
        <Picture mobile={attributes['wpbs-posterImage']}
                 settings={{
                     resolution: attributes['wpbs-resolution'],
                     className: 'w-full h-full absolute top-0 left-0 z-0',
                     eager: attributes['wpbs-eager']
                 }} editor={editor}></Picture>
    </div>
}

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...LayoutAttributes,
        ...blockAttributes
    },
    edit: ({attributes, setAttributes, clientId}) => {

        const [{breakpoints}] = useSettings(['custom']);

        const [posterImage, setPosterImage] = useState(attributes['wpbs-posterImage']);
        const [eager, setEager] = useState(attributes['wpbs-eager']);
        const [modal, setModal] = useState(attributes['wpbs-modal']);
        const [overlay, setOverlay] = useState(attributes['wpbs-overlay']);
        const [shareLink, setShareLink] = useState(attributes['wpbs-shareLink']);
        const [platform, setPlatform] = useState(attributes['wpbs-platform']);
        const [title, setTitle] = useState(attributes['wpbs-title']);

        const uniqueId = useInstanceId(registerBlockType, 'wpbs-video');

        useEffect(() => {
            setAttributes({uniqueId: uniqueId});
        }, []);

        const blockProps = useBlockProps({
            className: blockClasses(attributes),
        });

        return <>
            <BlockEdit key="edit" {...blockProps} />
            <InspectorControls group="styles">
                <PanelBody initialOpen={true}>
                    <Grid columns={1} columnGap={15} rowGap={20}>
                        <Grid columns={1} columnGap={15} rowGap={20}>


                            <Grid columns={1} columnGap={15} rowGap={20}>

                                <SelectControl
                                    __next40pxDefaultSize
                                    label="Platform"
                                    value={platform}
                                    options={[
                                        {label: 'Select', value: ''},
                                        {label: 'Youtube', value: 'youtube'},
                                        {label: 'Rumble', value: 'rumble'},
                                        {label: 'Vimeo', value: 'vimeo'},
                                    ]}
                                    onChange={(value) => {
                                        setPlatform(value);
                                        setAttributes({['wpbs-platform']: value});
                                    }}
                                    __nextHasNoMarginBottom
                                />

                                <TextControl
                                    __nextHasNoMarginBottom
                                    __next40pxDefaultSize
                                    label="Share Link"
                                    value={shareLink}
                                    className={'col-span-full'}
                                    onChange={(value) => {
                                        setAttributes({['wpbs-shareLink']: value});
                                        setShareLink(value);
                                    }}
                                />

                                <TextControl
                                    __nextHasNoMarginBottom
                                    __next40pxDefaultSize
                                    label="Title"
                                    value={title}
                                    className={'col-span-full'}
                                    onChange={(value) => {
                                        setAttributes({['wpbs-title']: value});
                                        setTitle(value);
                                    }}
                                />

                            </Grid>

                            <BaseControl label={'Poster Image'} __nextHasNoMarginBottom={true}>
                                <MediaUploadCheck>
                                    <MediaUpload
                                        title={'Poster Image'}
                                        onSelect={(value) => {
                                            setPosterImage({
                                                type: value.type,
                                                id: value.id,
                                                url: value.url,
                                                alt: value.alt,
                                                sizes: value.sizes,
                                            });
                                            setAttributes({
                                                ['wpbs-posterImage']: {
                                                    type: value.type,
                                                    id: value.id,
                                                    url: value.url,
                                                    alt: value.alt,
                                                    sizes: value.sizes,
                                                }
                                            });
                                        }}
                                        allowedTypes={['image']}
                                        value={posterImage}
                                        render={({open}) => {
                                            if (posterImage) {
                                                return <PreviewThumbnail
                                                    image={posterImage || {}}
                                                    callback={() => {
                                                        setPosterImage(undefined);
                                                        setAttributes({['wpbs-posterImage']: undefined});
                                                    }}
                                                    onClick={open}
                                                />;
                                            } else {
                                                return <Button onClick={open} style={imageButtonStyle}>Choose
                                                    Image</Button>
                                            }
                                        }}
                                    />
                                </MediaUploadCheck>
                            </BaseControl>

                            <Resolution defaultValue={attributes['wpbs-resolution']} callback={(newValue) => {
                                setAttributes({['wpbs-resolution']: newValue});
                            }}/>

                            <Grid columns={2} columnGap={15} rowGap={20}
                                  style={{padding: '1rem 0'}}>
                                <ToggleControl
                                    label="Eager"
                                    checked={eager}
                                    onChange={(value) => {
                                        setEager(value);
                                        setAttributes({['wpbs-eager']: value});
                                    }}
                                    className={'flex items-center'}
                                    __nextHasNoMarginBottom
                                />
                                <ToggleControl
                                    label="Modal"
                                    checked={modal}
                                    onChange={(value) => {
                                        setModal(value);
                                        setAttributes({['wpbs-modal']: value});
                                    }}
                                    className={'flex items-center'}
                                    __nextHasNoMarginBottom
                                />

                            </Grid>

                            <Overlay defaultValue={overlay} callback={(newValue) => {
                                setOverlay(newValue);
                                setAttributes({['wpbs-overlay']: newValue});
                            }}/>
                        </Grid>
                    </Grid>
                </PanelBody>
            </InspectorControls>

            <Layout blockProps={blockProps} attributes={attributes} setAttributes={setAttributes}
                    clientId={clientId}></Layout>

            <figure {...blockProps}>
                <Media attributes={attributes} editor={true}/>
            </figure>

        </>;
    },
    save: (props) => {

        const blockProps = useBlockProps.save({
            className: blockClasses(props.attributes),
            'data-wp-interactive': 'wpbs',
            'data-wp-on--click': 'callbacks.videoModal'
        });


        return (
            <figure {...blockProps} >
                <Media attributes={props.attributes} editor={false}/>
            </figure>
        );
    }
})


