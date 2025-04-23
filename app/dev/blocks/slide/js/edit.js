import '../scss/block.scss';

import {
    useBlockProps,
    BlockEdit,
    useInnerBlocksProps, InspectorControls, MediaUploadCheck, MediaUpload
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "../block.json"
import {LayoutClasses, LayoutSettings} from "Components/Layout"
import {Background, BackgroundSettings, BackgroundAttributes} from "Components/Background";

import React, {useEffect, useState} from "react";
import {useInstanceId} from '@wordpress/compose';
import {
    __experimentalGrid as Grid,
    BaseControl,
    Button,
    PanelBody,
    SelectControl,
    ToggleControl
} from "@wordpress/components";
import PreviewThumbnail from "Components/PreviewThumbnail.js";
import {imageButtonStyle} from "Includes/helper.js";
import Resolution from "Components/Resolution.js";
import ResponsivePicture from "Components/ResponsivePicture.js";
import {Style, styleAttributesFull} from "Components/Style.js";

function blockClasses(attributes = {}) {
    return [
        'wpbs-slide',
        (attributes.className || '').split(' ').includes('is-style-image') ? 'wpbs-slide--image' : null,
        'swiper-slide wpbs-layout-container wpbs-has-container grow w-full !flex flex-col shrink-0 relative',
        attributes.uniqueId,
        LayoutClasses(attributes)
    ].filter(x => x).join(' ');
}

function BlockContent({isImageSlide, attributes, innerBlocksProps, isEditor = false}) {

    if (isImageSlide) {

        const {
            ['wpbs-mobileSlideImage']: mobileImage,
            ['wpbs-largeSlideImage']: largeImage,
            ['wpbs-eagerSlide']: eager,
            ['wpbs-forceSlide']: force,
            ['wpbs-resolutionSlide']: resolution,
            ['wpbs-imageSize']: size,
        } = attributes;

        return <ResponsivePicture
            mobile={mobileImage}
            large={largeImage}
            settings={{
                eager: !!eager,
                force: !!force,
                className: [
                    'w-full h-full !object-cover absolute top-0 left-0'
                ].filter(s => !!s).join(' '),
                sizeLarge: resolution,
            }}
            style={{'object-fit': size}}
            editor={!!isEditor}
        ></ResponsivePicture>;
    } else {
        return <>
            <div {...innerBlocksProps}></div>
            <Background attributes={attributes} editor={!!isEditor}/>
        </>;
    }
}

const blockAttributes = {
    'wpbs-mobileSlideImage': {
        type: 'object'
    },
    'wpbs-largeSlideImage': {
        type: 'object'
    },
    'wpbs-resolutionSlide': {
        type: 'string'
    },
    'wpbs-imageSize': {
        type: 'string',
        default: 'cover'
    },
    'wpbs-eagerSlide': {
        type: 'boolean'
    },
    'wpbs-forceSlide': {
        type: 'boolean'
    },
}

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...styleAttributesFull,
        ...blockAttributes
    },
    edit: (props) => {


        const {attributes, setAttributes, clientId} = props;

        console.log(props);

        const [mobileImage, setMobileImage] = useState(attributes['wpbs-mobileSlideImage']);
        const [largeImage, setLargeImage] = useState(attributes['wpbs-largeSlideImage']);
        const [resolution, setResolution] = useState(attributes['wpbs-resolutionSlide']);
        const [imageSize, setImageSize] = useState(attributes['wpbs-imageSize']);
        const [eager, setEager] = useState(attributes['wpbs-eagerSlide']);
        const [force, setForce] = useState(attributes['wpbs-forceSlide']);

        const uniqueId = useInstanceId(registerBlockType, 'wpbs-slide');

        useEffect(() => {
            setAttributes({uniqueId: uniqueId});
        }, []);

        const blockProps = useBlockProps({
            className: blockClasses(attributes),
        });

        const innerBlocksProps = useInnerBlocksProps({
            className: 'wpbs-slide__container w-full h-auto container relative z-20',
        });

        const isImageSlide = (blockProps.className || '').split(' ').includes('is-style-image');

        return <>
            <BlockEdit key="edit" {...blockProps} />
            <InspectorControls group="styles">
                <BackgroundSettings attributes={attributes || {}} className={isImageSlide ? '!hidden' : null}
                                    pushSettings={setAttributes}></BackgroundSettings>
                <PanelBody initialOpen={true} title={'Image'} className={!isImageSlide ? '!hidden' : null}>
                    <Grid columns={1} columnGap={15} rowGap={20}>
                        <Grid columns={2} columnGap={15} rowGap={20}>
                            <BaseControl label={'Mobile Image'} __nextHasNoMarginBottom={true}>
                                <MediaUploadCheck>
                                    <MediaUpload
                                        title={'Mobile Image'}
                                        onSelect={(value) => {
                                            setMobileImage({
                                                type: value.type,
                                                id: value.id,
                                                url: value.url,
                                                alt: value.alt,
                                                sizes: value.sizes,
                                            });
                                            setAttributes({
                                                ['wpbs-mobileSlideImage']: {
                                                    type: value.type,
                                                    id: value.id,
                                                    url: value.url,
                                                    alt: value.alt,
                                                    sizes: value.sizes,
                                                }
                                            });
                                        }}
                                        allowedTypes={['image']}
                                        value={mobileImage}
                                        render={({open}) => {
                                            return <PreviewThumbnail
                                                image={mobileImage || {}}
                                                callback={() => {
                                                    setMobileImage(undefined);
                                                    setAttributes({['wpbs-mobileSlideImage']: undefined});
                                                }}
                                                onClick={open}
                                            />;
                                        }}
                                    />
                                </MediaUploadCheck>
                            </BaseControl>
                            <BaseControl label={'Large Image'} __nextHasNoMarginBottom={true}>
                                <MediaUploadCheck>
                                    <MediaUpload
                                        title={'Large Image'}
                                        onSelect={(value) => {
                                            setLargeImage({
                                                type: value.type,
                                                id: value.id,
                                                url: value.url,
                                                alt: value.alt,
                                                sizes: value.sizes,
                                            });
                                            setAttributes({
                                                ['wpbs-largeSlideImage']: {
                                                    type: value.type,
                                                    id: value.id,
                                                    url: value.url,
                                                    alt: value.alt,
                                                    sizes: value.sizes,
                                                }
                                            });
                                        }}
                                        allowedTypes={['image']}
                                        value={largeImage}
                                        render={({open}) => {
                                            if (largeImage) {
                                                return <PreviewThumbnail
                                                    image={largeImage || {}}
                                                    callback={() => {
                                                        setLargeImage(undefined);
                                                        setAttributes({['wpbs-largeSlideImage']: undefined});
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

                            <Resolution defaultValue={resolution} callback={(newValue) => {
                                setAttributes({['wpbs-resolutionSlide']: newValue});
                                setResolution(newValue)
                            }}/>
                            <SelectControl
                                __next40pxDefaultSize
                                label="Size"
                                value={imageSize}
                                options={[
                                    {label: 'Default', value: 'cover'},
                                    {label: 'Contain', value: 'contain'},
                                    {label: 'Vertical', value: 'auto 100%'},
                                    {label: 'Horizontal', value: '100% auto'},
                                ]}
                                onChange={(newValue) => {
                                    setAttributes({['wpbs-imageSize']: newValue});
                                    setImageSize(newValue)
                                }}
                                __nextHasNoMarginBottom
                            />
                        </Grid>

                        <Grid columns={2} columnGap={15} rowGap={20}
                              style={{padding: '1rem 0'}}>
                            <ToggleControl
                                label="Eager"
                                checked={eager}
                                onChange={(value) => {
                                    setEager(value);
                                    setAttributes({['wpbs-eagerSlide']: value});

                                    if (value) {
                                        setAttributes({
                                            preload: [
                                                {
                                                    mobile: !!attributes['wpbs-mobileSlideImage'] ? attributes['wpbs-mobileSlideImage'].id : null,
                                                    large: !!attributes['wpbs-largeSlideImage'] ? attributes['wpbs-largeSlideImage'].id : null,
                                                    size: attributes['wpbs-resolutionSlide'] || null
                                                }
                                            ]
                                        });

                                    }
                                }}
                                className={'flex items-center'}
                                __nextHasNoMarginBottom
                            />
                            <ToggleControl
                                label="Force"
                                checked={force}
                                onChange={(value) => {
                                    setForce(value);
                                    setAttributes({['wpbs-forceSlide']: value});
                                }}
                                className={'flex items-center'}
                                __nextHasNoMarginBottom
                            />
                        </Grid>
                    </Grid>
                </PanelBody>
            </InspectorControls>
            <LayoutSettings attributes={attributes} setAttributes={setAttributes} />


            <div {...blockProps}>
                <BlockContent isImageSlide={isImageSlide} attributes={attributes} innerBlocksProps={innerBlocksProps}
                              isEditor={true}/>
                <Style attributes={attributes} setAttributes={setAttributes} uniqueId={uniqueId} selector={'wpbs-slide'} />
            </div>

        </>;
    },
    save: (props) => {

        const blockProps = useBlockProps.save({
            className: blockClasses(props.attributes),
            'data-wp-interactive': 'wpbs-slide',
            'data-wp-init': 'callbacks.observe',
        });

        const innerBlocksProps = useInnerBlocksProps.save({
            className: 'wpbs-slide__container w-full h-auto container relative z-20',
        });

        const isImageSlide = (blockProps.className || '').split(' ').includes('is-style-image');

        return (

            <div {...blockProps}>
                <BlockContent isImageSlide={isImageSlide} attributes={props.attributes}
                              innerBlocksProps={innerBlocksProps} isEditor={false}/>
            </div>
        );
    }
})


