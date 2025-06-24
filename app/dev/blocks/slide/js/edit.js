import '../scss/block.scss';

import {
    useBlockProps,
    BlockEdit,
    useInnerBlocksProps, InspectorControls, MediaUploadCheck, MediaUpload
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "../block.json"

import React, {useCallback, useEffect, useMemo} from "react";
import {useInstanceId} from '@wordpress/compose';
import {
    __experimentalGrid as Grid,
    BaseControl,
    PanelBody,
    SelectControl,
    ToggleControl
} from "@wordpress/components";
import PreviewThumbnail from "Components/PreviewThumbnail.js";
import ResponsivePicture from "Components/ResponsivePicture.js";
import {LAYOUT_ATTRIBUTES, LayoutControls} from "Components/Layout"
import {BACKGROUND_ATTRIBUTES, BackgroundControls, BackgroundElement} from "Components/Background"
import {Style, STYLE_ATTRIBUTES} from "Components/Style"
import {
    IMAGE_SIZE_OPTIONS,
    RESOLUTION_OPTIONS
} from "Includes/config"

function blockClasses(attributes = {}) {
    return [
        'wpbs-slide',
        (attributes.className || '').split(' ').includes('is-style-image') ? 'wpbs-slide--image' : null,
        'wpbs-has-container swiper-slide w-full flex flex-col shrink-0 relative',
        attributes?.uniqueId ?? '',
    ].filter(x => x).join(' ');
}

function containerClasses(attributes = {}) {
    return 'wpbs-slide__container wpbs-container wpbs-layout-wrapper w-full h-full relative z-20';
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

function getPreloadMedia(attributes) {

    const {'wpbs-figure': settings = {}} = attributes;

    /*preload={{
                    large: [attributes['wpbs-slide']?.imageLarge],
                    mobile: [attributes['wpbs-slide']?.imageMobile],
                    force: !!attributes['wpbs-slide']?.force,
                    resolution: attributes['wpbs-slide']?.resolution,
                }}*/

    if (!settings?.eager) {
        return []
    }

    const imageLarge = !!settings.force ? settings?.imageLarge ?? false : settings?.imageLarge ?? settings?.imageMobile ?? false;
    const imageMobile = !!settings.force ? settings?.imageMobile ?? false : settings?.imageMobile ?? settings?.imageLarge ?? false;
    const resolution = settings.resolution || 'large';
    const breakpoint = attributes?.['wpbs-breakpoint'] ?? {};

    return [
        {
            media: imageLarge,
            resolution: resolution,
            breakpoint: breakpoint?.large ?? 'normal',
            mobile: false
        },
        {
            media: imageMobile,
            resolution: resolution,
            breakpoint: breakpoint.mobile ?? 'normal',
            mobile: true
        }
    ].filter(obj => !!obj?.media?.id);


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

        const uniqueId = useInstanceId(registerBlockType, 'wpbs-slide');

        const {attributes, setAttributes, clientId} = props;

        const preloadMedia = useMemo(() => getPreloadMedia(attributes), [attributes['wpbs-slide']]);

        const updateSettings = useCallback((newValue, prop) => {
            setAttributes({
                'wpbs-slide': {
                    ...attributes['wpbs-slide'],
                    [prop]: newValue,
                },
            });
        }, [attributes['wpbs-slide'], setAttributes]);

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
                                                //alt: value?.alt,
                                                //sizes: value?.sizes,
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
                                                //alt: value?.alt,
                                                //sizes: value?.sizes,
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
                                options={RESOLUTION_OPTIONS}
                                __nextHasNoMarginBottom
                            />

                            <SelectControl
                                __next40pxDefaultSize
                                label="Size"
                                options={IMAGE_SIZE_OPTIONS}
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
            <Style attributes={attributes} setAttributes={setAttributes} uniqueId={uniqueId}
                   deps={['wpbs-slide']}
                   preload={preloadMedia}
            />

            <div {...blockProps}>
                <BlockContent isImageSlide={isImageSlide} attributes={attributes} innerBlocksProps={innerBlocksProps}
                              isEditor={true}/>
                <BackgroundElement attributes={props.attributes} editor={true}/>
            </div>

        </>;
    },
    save: (props) => <BackgroundElement attributes={props.attributes} editor={false}/>
})


