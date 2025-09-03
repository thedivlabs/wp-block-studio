import './scss/block.scss';


import {
    useBlockProps,
    InspectorControls,
    BlockEdit, MediaUploadCheck, MediaUpload, PanelColorSettings
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "./block.json"
import {
    __experimentalGrid as Grid,
    __experimentalUnitControl as UnitControl,
    BaseControl,
    Button, GradientPicker,
    PanelBody,
    SelectControl, TextControl,
    ToggleControl,
} from "@wordpress/components";
import PreviewThumbnail from "Components/PreviewThumbnail";
import ResponsivePicture from "Components/ResponsivePicture.js";
import React, {useCallback, useEffect, useMemo, useState} from "react";

import {DIMENSION_UNITS_TEXT, RESOLUTION_OPTIONS} from "Includes/config";
import {useInstanceId} from '@wordpress/compose';
import {Style, STYLE_ATTRIBUTES} from "Components/Style"
import {LAYOUT_ATTRIBUTES, LayoutControls} from "Components/Layout"
import {useUniqueId} from "Includes/helper";
import {IconControl, iconProps} from "Components/IconControl";

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
                lightbox: undefined,
                overlay: undefined,
                link: undefined,
                platform: undefined,
                title: undefined,
                resolution: undefined,
                'button-icon': undefined,
                'icon-color': undefined,
                'title-color': undefined,
            }
        }
    },
    edit: ({attributes, setAttributes, clientId}) => {

        //const uniqueId = useInstanceId(registerBlockType, 'wpbs-video');

        const uniqueId = useUniqueId(attributes, setAttributes, clientId);

        const {'wpbs-video': settings = {}} = attributes;

        const updateSettings = useCallback((newValue) => {
            const result = {
                ...settings,
                ...newValue
            };

            setAttributes({
                'wpbs-video': result,
            });
        }, [setAttributes, settings]);

        const cssProps = Object.fromEntries(Object.entries({
            '--overlay': settings?.overlay ?? 'none',
            ...iconProps(settings?.['button-icon']),
            '--icon-color': settings?.['icon-color'] ?? null,
            '--title-color': settings?.['title-color'] ?? null,
        }).filter(x => x));

        const blockProps = useBlockProps({
            className: 'wpbs-video --disabled flex items-center justify-center relative w-full h-auto overflow-hidden cursor-pointer ' + uniqueId,
        });

        const vid = !!settings?.link ? (new URL(settings.link)).pathname.replace(/^\/+/g, '') : '#';
        const posterSrc = settings?.poster?.sizes?.[settings?.resolution ?? 'medium']?.url ?? 'https://i3.ytimg.com/vi/' + vid + '/hqdefault.jpg';

        return <>
            <BlockEdit key="edit" {...blockProps} />
            <InspectorControls group="styles">
                <PanelBody initialOpen={true}>
                    <Grid columns={1} columnGap={15} rowGap={20}>
                        <SelectControl
                            __next40pxDefaultSize
                            label="Platform"
                            value={settings?.platform}
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
                            value={settings?.link}
                            className={'col-span-full'}
                            onChange={(newValue) => updateSettings({link: newValue})}
                        />

                        <TextControl
                            __nextHasNoMarginBottom
                            __next40pxDefaultSize
                            label="Title"
                            value={settings?.title}
                            className={'col-span-full'}
                            onChange={(newValue) => updateSettings({title: newValue})}

                        />

                        <Grid columns={2} columnGap={15} rowGap={20}>

                            <IconControl label={'Button Icon'} value={settings?.['button-icon']}
                                         onChange={(newValue) => updateSettings({'button-icon': newValue})}/>

                        </Grid>

                        <PanelColorSettings
                            enableAlpha
                            className={'!p-0 !border-0 [&_.components-tools-panel-item]:!m-0'}
                            colorSettings={[
                                {
                                    slug: 'icon-color',
                                    label: 'Icon Color',
                                    value: settings?.['icon-color'],
                                    onChange: (newValue) => updateSettings({'icon-color': newValue}),
                                    isShownByDefault: true
                                },
                                {
                                    slug: 'title-color',
                                    label: 'Title Color',
                                    value: settings?.['title-color'],
                                    onChange: (newValue) => updateSettings({'title-color': newValue}),
                                    isShownByDefault: true
                                }
                            ]}
                        />


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
                                    value={settings?.poster}
                                    render={({open}) => {
                                        return <PreviewThumbnail
                                            image={settings?.poster || {}}
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
                            value={settings?.resolution}
                            onChange={(newValue) => updateSettings({resolution: newValue})}
                            __next40pxDefaultSize
                            __nextHasNoMarginBottom
                        />

                        <Grid columns={2} columnGap={15} rowGap={20}
                              style={{padding: '1rem 0'}}>
                            <ToggleControl
                                label="Eager"
                                checked={!!settings?.eager}
                                onChange={(value) => {
                                    updateSettings({'eager': value});

                                    if (value) {
                                        setAttributes({
                                            preload: [
                                                {
                                                    large: settings?.poster?.id ?? null,
                                                    size: settings?.resolution || null
                                                }
                                            ]
                                        });
                                    }

                                }}
                                className={'flex items-center'}
                                __nextHasNoMarginBottom
                            />
                            <ToggleControl
                                label="Lightbox"
                                checked={!!settings?.lightbox}
                                onChange={(newValue) => updateSettings({lightbox: newValue})}
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
                                value={settings?.overlay ?? undefined}
                                onChange={(newValue) => updateSettings({'overlay': newValue})}
                            />
                        </BaseControl>


                    </Grid>
                </PanelBody>
            </InspectorControls>
            <LayoutControls attributes={attributes} setAttributes={setAttributes}/>
            <Style attributes={attributes} setAttributes={setAttributes} uniqueId={uniqueId} props={cssProps}
                   selector={'wpbs-video'}
                   deps={['wpbs-video']}
            />


            <div {...blockProps}>
                <div
                    className={'wpbs-video__media w-full h-full overflow-hidden relative hover:after:opacity-50 after:content-[\'\'] after:block after:absolute after:top-0 after:left-0 after:w-full after:h-full after:z-10 after:pointer-events-none after:bg-black/50 after:opacity-100 after:transition-opacity after:duration-300 after:ease-in-out'}>
                    {settings?.title && (
                        <div className="wpbs-video__title absolute z-20 top-0 left-0 w-full">
                            <span>
                            {settings.title}
                                </span>
                        </div>
                    )}
                    <div
                        className={'wpbs-video__button wp-element-button pointer-events-none flex justify-center items-center absolute top-1/2 left-1/2 aspect-square z-20 transition-colors duration-300 leading-none'}>
                        <span className={'screen-reader-text'}>Play video</span>
                    </div>
                    <img src={posterSrc}
                         className={'w-full !h-full absolute top-0 left-0 z-0 object-cover object-center'} alt={''}/>
                </div>
            </div>

        </>;
    },
    save: (props) => null
})


