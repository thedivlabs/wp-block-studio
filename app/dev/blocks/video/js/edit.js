import {
    useBlockProps,
    InspectorControls,
    BlockEdit, MediaUploadCheck, MediaUpload
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "../block.json"
import {
    __experimentalGrid as Grid,
    BaseControl,
    Button, GradientPicker,
    PanelBody,
    SelectControl, TextControl,
    ToggleControl,
} from "@wordpress/components";
import PreviewThumbnail from "Components/PreviewThumbnail";
import ResponsivePicture from "Components/ResponsivePicture.js";
import React, {useCallback, useEffect, useState} from "react";

import {RESOLUTION_OPTIONS} from "Includes/config";
import {useInstanceId} from '@wordpress/compose';
import {Style, STYLE_ATTRIBUTES} from "Components/Style"
import {LAYOUT_ATTRIBUTES, LayoutControls} from "Components/Layout"

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...LAYOUT_ATTRIBUTES,
        ...STYLE_ATTRIBUTES,
        'wpbs-video': {
            type: 'object',
            default: {
                poster: undefined,
                eager: undefined,
                modal: undefined,
                overlay: undefined,
                link: undefined,
                platform: undefined,
                title: undefined,
                resolution: undefined,
            }
        }
    },
    edit: ({attributes, setAttributes, clientId}) => {

        const uniqueId = useInstanceId(registerBlockType, 'wpbs-video');

        const updateSettings = useCallback((newValue) => {
            const result = {
                ...attributes['wpbs-video'],
                ...newValue
            };

            setAttributes({
                'wpbs-video': result,
            });
        }, [setAttributes, attributes['wpbs-video']]);


        const blockProps = useBlockProps({
            className: 'wpbs-video flex items-center justify-center relative w-full h-auto aspect-video overflow-hidden cursor-pointer',
            style: {
                '--overlay': attributes?.['wpbs-video']?.overlay ?? 'none'
            }
        });

        const vid = !!attributes['wpbs-video']?.link ? (new URL(attributes['wpbs-video'].link)).pathname.replace(/^\/+/g, '') : '#';
        const posterSrc = attributes?.['wpbs-video']?.poster?.sizes?.[attributes?.['wpbs-video']?.resolution ?? 'medium']?.url ?? 'https://i3.ytimg.com/vi/' + vid + '/hqdefault.jpg';
        
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
                                    value={attributes?.['wpbs-video']?.platform}
                                    options={[
                                        {label: 'Select', value: ''},
                                        {label: 'Youtube', value: 'youtube'},
                                        {label: 'Rumble', value: 'rumble'},
                                        {label: 'Vimeo', value: 'vimeo'},
                                    ]}
                                    onChange={(newValue) => updateSettings({platform: newValue})}
                                    __nextHasNoMarginBottom
                                />

                                <TextControl
                                    __nextHasNoMarginBottom
                                    __next40pxDefaultSize
                                    label="Share Link"
                                    value={attributes?.['wpbs-video']?.link}
                                    className={'col-span-full'}
                                    onChange={(newValue) => updateSettings({link: newValue})}
                                />

                                <TextControl
                                    __nextHasNoMarginBottom
                                    __next40pxDefaultSize
                                    label="Title"
                                    value={attributes?.['wpbs-video']?.title}
                                    className={'col-span-full'}
                                    onChange={(newValue) => updateSettings({title: newValue})}

                                />
                            </Grid>

                            <BaseControl label={'Poster Image'} __nextHasNoMarginBottom={true}>
                                <MediaUploadCheck>
                                    <MediaUpload
                                        title={'Poster Image'}
                                        onSelect={(value) => updateSettings({
                                            poster: {
                                                type: value.type,
                                                id: value.id,
                                                url: value.url,
                                                alt: value.alt,
                                                sizes: value.sizes,
                                            }
                                        })}
                                        allowedTypes={['image']}
                                        value={attributes?.['wpbs-video']?.poster}
                                        render={({open}) => {
                                            return <PreviewThumbnail
                                                image={attributes?.['wpbs-video']?.poster || {}}
                                                callback={() => updateSettings({poster: undefined})}
                                                onClick={open}
                                            />
                                        }}
                                    />
                                </MediaUploadCheck>
                            </BaseControl>

                            <SelectControl
                                label={'Resolution'}
                                options={RESOLUTION_OPTIONS}
                                value={attributes?.['wpbs-video']?.resolution}
                                onChange={(newValue) => updateSettings({resolution: newValue})}
                                __next40pxDefaultSize
                                __nextHasNoMarginBottom
                            />

                            <Grid columns={2} columnGap={15} rowGap={20}
                                  style={{padding: '1rem 0'}}>
                                <ToggleControl
                                    label="Eager"
                                    checked={!!attributes?.['wpbs-video']?.eager}
                                    onChange={(value) => {
                                        updateSettings({'eager': value});

                                        if (value) {
                                            setAttributes({
                                                preload: [
                                                    {
                                                        large: attributes?.['wpbs-video']?.poster?.id ?? null,
                                                        size: attributes['wpbs-video']?.resolution || null
                                                    }
                                                ]
                                            });
                                        }

                                    }}
                                    className={'flex items-center'}
                                    __nextHasNoMarginBottom
                                />
                                <ToggleControl
                                    label="Modal"
                                    checked={!!attributes?.['wpbs-video']?.modal}
                                    onChange={(newValue) => updateSettings({modal: newValue})}
                                    className={'flex items-center'}
                                    __nextHasNoMarginBottom
                                />

                            </Grid>

                            <BaseControl label={'Overlay'} __nextHasNoMarginBottom={true}>
                                <GradientPicker
                                    gradients={[
                                        {
                                            name: 'Transparent',
                                            gradient:
                                                'linear-gradient(rgba(0,0,0,0),rgba(0,0,0,0))',
                                            slug: 'transparent',
                                        },
                                        {
                                            name: 'Light',
                                            gradient:
                                                'linear-gradient(rgba(0,0,0,.3),rgba(0,0,0,.3))',
                                            slug: 'light',
                                        },
                                        {
                                            name: 'Strong',
                                            gradient:
                                                'linear-gradient(rgba(0,0,0,.7),rgba(0,0,0,.7))',
                                            slug: 'Strong',
                                        }
                                    ]}
                                    clearable={true}
                                    value={attributes['wpbs-video']?.overlay ?? undefined}
                                    onChange={(newValue) => updateSettings({'overlay': newValue})}
                                />
                            </BaseControl>

                        </Grid>
                    </Grid>
                </PanelBody>
            </InspectorControls>
            <LayoutControls attributes={attributes} setAttributes={setAttributes}/>
            <Style attributes={attributes} setAttributes={setAttributes} uniqueId={uniqueId}/>


            <div {...blockProps}>
                <div
                    className={'wpbs-video__media w-full h-full overflow-hidden relative hover:after:opacity-50 after:content-[\'\'] after:block after:absolute after:top-0 after:left-0 after:w-full after:h-full after:z-10 after:pointer-events-none after:bg-black/50 after:opacity-100 after:transition-opacity after:duration-300 after:ease-in-out'}>
                    <div
                        className={'wpbs-video__button flex justify-center items-center absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 aspect-square z-20 transition-colors duration-300 text-3xl leading-none text-white opacity-50 rounded-full'}/>
                    <img src={posterSrc}
                         className={'w-full !h-full absolute top-0 left-0 z-0 object-cover object-center'} alt={''}/>
                </div>
            </div>

        </>;
    },
    save: (props) => null
})


