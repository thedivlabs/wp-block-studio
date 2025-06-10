import '../scss/block.scss';

import {
    useBlockProps,
    BlockEdit,
    useInnerBlocksProps, InspectorControls, MediaUploadCheck, MediaUpload
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "../block.json"

import React, {useCallback, useEffect} from "react";
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
import ResponsivePicture from "Components/ResponsivePicture.js";
import {LAYOUT_ATTRIBUTES, LayoutControls} from "Components/Layout"
import {BACKGROUND_ATTRIBUTES, BackgroundControls, BackgroundElement} from "Components/Background"
import {Style, STYLE_ATTRIBUTES} from "Components/Style"

function blockClasses(attributes = {}) {
    return [
        'wpbs-slide',
        (attributes.className || '').split(' ').includes('is-style-image') ? 'wpbs-slide--image' : null,
        'wpbs-has-container swiper-slide !h-auto w-full flex flex-col shrink-0 relative',
        attributes.uniqueId,
    ].filter(x => x).join(' ');
}

function containerClasses(attributes = {}) {
    return 'wpbs-slide__container wpbs-container w-full h-full relative z-20';
}

function BlockContent({isImageSlide, attributes, innerBlocksProps, isEditor = false}) {

    if (isImageSlide) {

        const {
            ['wpbs-imageMobile']: imageMobile,
            ['wpbs-imageLarge']: largeImage,
            ['wpbs-eagerSlide']: eager,
            ['wpbs-forceSlide']: force,
            ['wpbs-resolutionSlide']: resolution,
            ['wpbs-imageSize']: size,
        } = attributes;

        return <ResponsivePicture
            mobile={imageMobile}
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
        </>;
    }
}

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...LAYOUT_ATTRIBUTES,
        ...BACKGROUND_ATTRIBUTES,
        ...STYLE_ATTRIBUTES,
        'wpbs-slide': {
            type: 'object',
            default: {
                imageMobile: undefined,
                imageLarge: undefined,
                imageSize: undefined,
                resolution: undefined,
                eager: undefined,
                force: undefined,
            }
        }
    },
    edit: (props) => {

        const {attributes, setAttributes, clientId} = props;

        const uniqueId = useInstanceId(registerBlockType, 'wpbs-slide');

        useEffect(() => {
            setAttributes({uniqueId: uniqueId});
        }, []);

        const updateSettings = useCallback((newValue, prop) => {
            setAttributes({
                'wpbs-slide': {
                    ...attributes['wpbs-slide'],
                    [prop]: newValue,
                },
            });
        }, [attributes['wpbs-slide'], setAttributes, uniqueId]);

        const blockProps = useBlockProps({
            className: blockClasses(attributes),
        });

        const innerBlocksProps = useInnerBlocksProps({
            className: containerClasses(attributes),
        });

        const isImageSlide = (blockProps.className || '').split(' ').includes('is-style-image');

        return <>
            <BlockEdit key="edit" {...blockProps} />
            <InspectorControls group="styles">
                <PanelBody initialOpen={true} title={'Image'} className={!isImageSlide ? '!hidden' : null}>
                    <Grid columns={1} columnGap={15} rowGap={20}>
                        <Grid columns={2} columnGap={15} rowGap={20}>
                            <BaseControl label={'Mobile Image'} __nextHasNoMarginBottom={true}>
                                <MediaUploadCheck>
                                    <MediaUpload
                                        title={'Mobile Image'}
                                        onSelect={(value) =>
                                            updateSettings({
                                                type: value?.type,
                                                id: value?.id,
                                                url: value?.url,
                                                alt: value?.alt,
                                                sizes: value?.sizes,
                                            }, 'imageMobile')
                                        }
                                        allowedTypes={['image']}
                                        value={attributes['wpbs-slide']?.imageMobile}
                                        render={({open}) => {
                                            return <PreviewThumbnail
                                                image={attributes['wpbs-slide']?.imageMobile || {}}
                                                callback={() => updateSettings(undefined, 'imageMobile')}
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
                                        onSelect={(value) =>
                                            updateSettings({
                                                type: value?.type,
                                                id: value?.id,
                                                url: value?.url,
                                                alt: value?.alt,
                                                sizes: value?.sizes,
                                            }, 'imageLarge')
                                        }
                                        allowedTypes={['image']}
                                        value={attributes['wpbs-slide']?.imageLarge}
                                        render={({open}) => {
                                            return <PreviewThumbnail
                                                image={attributes['wpbs-slide']?.imageLarge || {}}
                                                callback={() =>
                                                    updateSettings(undefined, 'imageLarge')
                                                }
                                                onClick={open}
                                            />;
                                        }}
                                    />

                                </MediaUploadCheck>
                            </BaseControl>
                            <SelectControl
                                __next40pxDefaultSize
                                label="Resolution"
                                value={attributes['wpbs-slide']?.resolution}
                                onChange={(value) => updateSettings(value, 'resolution')}
                                options={[
                                    {label: 'Default', value: ''},
                                    {label: 'Thumbnail', value: 'thumbnail'},
                                    {label: 'Small', value: 'small'},
                                    {label: 'Medium', value: 'medium'},
                                    {label: 'Large', value: 'large'},
                                    {label: 'Extra Large', value: 'xlarge'},
                                    {label: 'Full', value: 'full'},
                                ]}
                                __nextHasNoMarginBottom
                            />

                            <SelectControl
                                __next40pxDefaultSize
                                label="Size"
                                options={[
                                    {label: 'Default', value: 'cover'},
                                    {label: 'Contain', value: 'contain'},
                                    {label: 'Vertical', value: 'auto 100%'},
                                    {label: 'Horizontal', value: '100% auto'},
                                ]}
                                value={attributes['wpbs-slide']?.imageSize}
                                onChange={(value) => updateSettings(value, 'imageSize')}
                                __nextHasNoMarginBottom
                            />
                        </Grid>

                        <Grid columns={2} columnGap={15} rowGap={20}
                              style={{padding: '1rem 0'}}>
                            <ToggleControl
                                label="Eager"
                                checked={!!attributes['wpbs-slide']?.eager}
                                onChange={(value) => updateSettings(value, 'eager')}
                                className={'flex items-center'}
                                __nextHasNoMarginBottom
                            />
                            <ToggleControl
                                label="Force"
                                value={!!attributes['wpbs-slide']?.force}
                                onChange={(value) => updateSettings(value, 'force')}
                                className={'flex items-center'}
                                __nextHasNoMarginBottom
                            />
                        </Grid>
                    </Grid>
                </PanelBody>
            </InspectorControls>
            <LayoutControls attributes={attributes} setAttributes={setAttributes}/>
            <BackgroundControls attributes={attributes} setAttributes={setAttributes}/>
            <Style attributes={attributes} setAttributes={setAttributes}
                   deps={['wpbs-slide']}
                /*preload={{
                    large: [attributes['wpbs-slide']?.imageLarge],
                    mobile: [attributes['wpbs-slide']?.imageMobile],
                    force: !!attributes['wpbs-slide']?.force,
                    resolution: attributes['wpbs-slide']?.resolution,
                }}*/
            />

            <div {...blockProps}>
                <BlockContent isImageSlide={isImageSlide} attributes={attributes} innerBlocksProps={innerBlocksProps}
                              isEditor={true}/>
                <BackgroundElement attributes={props.attributes} editor={true}/>
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
            className: containerClasses(props.attributes),
        });

        const isImageSlide = (blockProps.className || '').split(' ').includes('is-style-image');

        return (

            <div {...blockProps}>
                <BlockContent isImageSlide={isImageSlide} attributes={props.attributes}
                              innerBlocksProps={innerBlocksProps} isEditor={false}/>
                <BackgroundElement attributes={props.attributes} editor={false}/>
            </div>
        );
    }
})


