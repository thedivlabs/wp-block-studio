import '../scss/block.scss';

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


function blockClasses(attributes = {}) {
    return [
        'wpbs-video flex items-center justify-center relative w-full h-auto aspect-video relative overflow-hidden cursor-pointer',
        attributes.uniqueId,
        attributes['wpbs-modal'] ? 'wpbs-video--modal' : null,
    ].filter(x => x).join(' ');
}

function Media({attributes, editor = false}) {


    const mediaClasses = [
        'wpbs-video__media w-full h-full overflow-hidden relative object-cover object-center',
    ].filter(x => x).join(' ');

    const mediaProps = Object.fromEntries(Object.entries({
        '--overlay': attributes['wpbs-overlay'],
    }).filter(([_, v]) => v != null));

    const vid = (!!attributes['wpbs-shareLink'] ? (new URL(attributes['wpbs-shareLink'])).pathname : '').replace(/^\/+/g, '');
    const posterClasses = 'w-full !h-full absolute top-0 left-0 z-0 object-cover';

    return <div class={mediaClasses} style={mediaProps}>
        <button type={'button'} class={'wpbs-video__button'}>
            <i class="fa-solid fa-circle-play"></i>
        </button>
        {!!attributes['wpbs-posterImage'] ? <ResponsivePicture mobile={attributes['wpbs-posterImage']} settings={{
                resolution: attributes['wpbs-resolution'],
                className: posterClasses,
                eager: attributes['wpbs-eager']
            }} editor={editor}></ResponsivePicture> :
            <img src={'https://i3.ytimg.com/vi/' + vid + '/hqdefault.jpg'} class={posterClasses} alt={''}
                 aria-hidden={'true'} loading={!!attributes['wpbs-eager'] ? 'eager' : 'lazy'}/>}
    </div>
}

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...LAYOUT_ATTRIBUTES,
        ...STYLE_ATTRIBUTES,
        'wpbs-video': {
            type: 'object',
            default: {
                posterImage: undefined,
                eager: undefined,
                modal: undefined,
                overlay: undefined,
                shareLink: undefined,
                platform: undefined,
                title: undefined,
            }
        }
    },
    edit: ({attributes, setAttributes, clientId}) => {

        const uniqueId = useInstanceId(registerBlockType, 'wpbs-video');

        const updateSettings = useCallback((newValue) => {
            const result = {
                ...attributes['wpbs-layout-grid-card'],
                ...newValue
            };

            setAttributes({
                'wpbs-layout-grid-card': result,
            });
        }, [setAttributes, attributes['wpbs-layout-grid-card']]);


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
                                    value={attributes?.['wpbs-video']?.shareLink}
                                    className={'col-span-full'}
                                    onChange={(newValue) => updateSettings({shareLink: newValue})}
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
                                            posterImage: {
                                                type: value.type,
                                                id: value.id,
                                                url: value.url,
                                                alt: value.alt,
                                                sizes: value.sizes,
                                            }
                                        })}
                                        allowedTypes={['image']}
                                        value={attributes?.['wpbs-video']?.posterImage}
                                        render={({open}) => {
                                            return <PreviewThumbnail
                                                image={attributes?.['wpbs-video']?.posterImage || {}}
                                                callback={() => updateSettings({'posterImage': undefined})}
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
                                    checked={!attributes?.['wpbs-video']?.eager}
                                    onChange={(value) => {
                                        updateSettings({'eager': value});

                                        if (value) {
                                            setAttributes({
                                                preload: [
                                                    {
                                                        large: attributes?.['wpbs-video']?.posterImage?.id ?? null,
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
                                    checked={attributes?.['wpbs-video']?.modal}
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
                <Media attributes={attributes} editor={true}/>
            </div>

        </>;
    },
    save: (props) => null
})


