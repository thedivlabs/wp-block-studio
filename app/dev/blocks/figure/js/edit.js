import '../scss/block.scss';
import {
    useBlockProps,
    InspectorControls,
    BlockEdit, MediaUploadCheck, MediaUpload
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "../block.json"
import {LayoutControls, LAYOUT_ATTRIBUTES} from "Components/Layout"
import {
    __experimentalGrid as Grid,
    BaseControl,
    Button, GradientPicker,
    PanelBody,
    SelectControl,
    ToggleControl,
} from "@wordpress/components";
import PreviewThumbnail from "Components/PreviewThumbnail";
import ResponsivePicture from "Components/ResponsivePicture.js";
import React, {useCallback, useEffect, useMemo, useState} from "react";
import Link from "Components/Link";
import {useInstanceId} from '@wordpress/compose';
import {Style, STYLE_ATTRIBUTES} from "Components/Style.js";
import {imageButtonStyle} from "Includes/helper.js";

function blockClasses(attributes = {}) {

    return [
        'wpbs-figure flex items-center justify-center relative max-w-full max-h-full',
        attributes.uniqueId,
    ].filter(x => x).join(' ');
}

const Media = React.memo(({settings, breakpoint, editor = false}) => {

    const mediaClasses = [
        'wpbs-figure__media w-full h-full overflow-hidden rounded-inherit',
    ].filter(x => x).join(' ');

    let mediaStyle = {
        ['mix-blend-mode']: settings.blend || null,
        ['object-fit']: !!settings.contain ? 'contain' : 'cover',
    };

    mediaStyle = {
        ...mediaStyle,
    }

    const Content = () => {

        switch (settings?.type ?? false) {
            case 'image':

                return <ResponsivePicture mobile={settings?.['mobileImage']}
                                          large={settings?.['largeImage']}
                                          settings={{
                                              force: !!settings?.['force'],
                                              eager: !!settings?.['eager'],
                                              resolution: settings?.['resolution'] ?? null,
                                              breakpoint: breakpoint || 'normal',
                                          }} editor={!!editor}></ResponsivePicture>;
            case 'featured-image':
                return !editor ? '%%IMAGE%%' : <div
                    className={'w-full h-full bg-black opacity-30 border border-gray text-sm leading-normal text-center flex justify-center items-center text-white/50'}>FEATURED
                    IMAGE</div>;
            default:
                return false
        }
    }

    if ((settings?.link || settings?.linkPost) && !editor) {
        return <a class={mediaClasses}
                  href={!settings?.linkPost ? settings?.link?.url ?? '#' : '%%PERMALINK%%'}
                  title={settings?.link?.title ?? ''}
                  target={!!settings?.link?.opensInNewTab ? '_blank' : '_self'}
                  rel={settings?.link?.rel ?? ''} style={mediaStyle}>
            <Content/>
        </a>
    } else {
        return <div class={mediaClasses} style={mediaStyle}>
            <Content/>
        </div>;
    }
});

const BLEND_OPTIONS = [
    {label: 'Default', value: ''},
    {label: 'Multiply', value: 'multiply'},
    {label: 'Luminosity', value: 'luminosity'},
    {label: 'Screen', value: 'screen'},
    {label: 'Overlay', value: 'overlay'},
    {label: 'Soft Light', value: 'soft-light'},
    {label: 'Hard Light', value: 'hard-light'},
    {label: 'Difference', value: 'difference'},
    {label: 'Color Burn', value: 'color-burn'},
];

const ORIGIN_OPTIONS = [
    {label: 'Default', value: ''},
    {label: 'Center', value: 'center'},
    {label: 'Top', value: 'top'},
    {label: 'Right', value: 'right'},
    {label: 'Bottom', value: 'bottom'},
    {label: 'Left', value: 'left'},
    {label: 'Top Left', value: 'left top'},
    {label: 'Top Right', value: 'right top'},
    {label: 'Bottom Left', value: 'left bottom'},
    {label: 'Bottom Right', value: 'right bottom'},
];

const RESOLUTION_OPTIONS = [
    {label: 'Default', value: ''},
    {label: 'Thumbnail', value: 'thumbnail'},
    {label: 'Small', value: 'small'},
    {label: 'Medium', value: 'medium'},
    {label: 'Large', value: 'large'},
    {label: 'Extra Large', value: 'xlarge'},
    {label: 'Full', value: 'full'},
];

const MemoSelectControl = React.memo(({label, options, value, callback}) => (
    <SelectControl
        label={label}
        options={options}
        value={value}
        onChange={callback}
        __next40pxDefaultSize
        __nextHasNoMarginBottom
    />
));

function getPreloadMedia(attributes) {

    if (!attributes['wpbs-figure']?.['eager']) {
        return []
    }

    const largeImage = !!attributes['wpbs-figure'].force ? attributes['wpbs-figure']?.largeImage ?? false : attributes['wpbs-figure']?.largeImage ?? attributes['wpbs-figure']?.mobileImage ?? false;
    const mobileImage = !!attributes['wpbs-figure'].force ? attributes['wpbs-figure']?.mobileImage ?? false : attributes['wpbs-figure']?.mobileImage ?? attributes['wpbs-figure']?.largeImage ?? false;
    const resolution = attributes['wpbs-figure'].resolution || 'large';
    const breakpoint = attributes?.['wpbs-breakpoint'] ?? {};

    return [
        {
            media: largeImage,
            resolution: resolution,
            breakpoint: breakpoint?.large ?? 'normal',
            mobile: false
        },
        {
            media: mobileImage,
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
        ...STYLE_ATTRIBUTES,
        'wpbs-figure': {
            type: 'object',
            default: {
                'mobileImage': undefined,
                'largeImage': undefined,
                'eager': undefined,
                'force': undefined,
                'resolution': undefined,
                'contain': undefined,
                'linkPost': undefined,
                'blend': undefined,
                'origin': undefined,
                'overlay': undefined,
                'link': undefined,
            }

        }
    },
    edit: ({attributes, setAttributes, clientId}) => {


        const preloadMedia = useMemo(() => getPreloadMedia(attributes), [attributes['wpbs-figure']]);

        const uniqueId = useInstanceId(registerBlockType, 'wpbs-figure');

        useEffect(() => {
            if (!attributes.uniqueId) {
                setAttributes({uniqueId});
            }
        }, []);

        const updateSettings = useCallback((newValue) => {

            const result = {
                ...attributes['wpbs-figure'],
                ...newValue
            };

            setAttributes({
                'wpbs-figure': result
            });

        }, [setAttributes, attributes['wpbs-figure']])

        const memoBlockClasses = blockClasses(attributes);

        const blockProps = useBlockProps({
            className: memoBlockClasses
        });

        return <>
            <LayoutControls attributes={attributes} setAttributes={setAttributes}/>
            <Style attributes={attributes} setAttributes={setAttributes}
                   deps={['wpbs-figure']}
                   props={{
                       '--figure-type': attributes['wpbs-figure']?.type ?? null,
                       '--overlay': attributes['wpbs-figure']?.overlay ?? null,
                   }}
                   preload={preloadMedia}
            />
            <Link defaultValue={attributes['wpbs-figure']?.link}
                  callback={(newValue) => updateSettings({'link': newValue})}/>
            <InspectorControls group="styles">
                <PanelBody initialOpen={true}>
                    <Grid columns={1} columnGap={15} rowGap={20}>
                        <SelectControl
                            __next40pxDefaultSize
                            label="Type"
                            value={attributes['wpbs-figure']?.type}
                            options={[
                                {label: 'Select', value: ''},
                                {label: 'Image', value: 'image'},
                                {label: 'Featured Image', value: 'featured-image'},
                                {label: 'Lottie', value: 'lottie'},
                                {label: 'Icon', value: 'icon'},
                            ]}
                            onChange={(newValue) => updateSettings({'type': newValue})}
                            __nextHasNoMarginBottom
                        />
                        <Grid columns={1} columnGap={15} rowGap={20}
                              style={{display: !attributes['wpbs-figure']?.type ? 'none' : null}}>

                            <Grid columns={2} columnGap={15} rowGap={20}
                                  style={{display: attributes['wpbs-figure']?.type !== 'image' && attributes['wpbs-figure']?.type !== 'featured-image' ? 'none' : null}}>
                                <BaseControl label={'Mobile Image'} __nextHasNoMarginBottom={true}>
                                    <MediaUploadCheck>
                                        <MediaUpload
                                            title={'Mobile Image'}
                                            onSelect={(newValue) => updateSettings({
                                                'mobileImage': {
                                                    type: newValue.type,
                                                    id: newValue.id,
                                                    url: newValue.url,
                                                    alt: newValue.alt,
                                                    sizes: newValue.sizes,
                                                }
                                            })}
                                            allowedTypes={['image']}
                                            value={attributes['wpbs-figure']?.mobileImage}
                                            render={({open}) => {
                                                return <PreviewThumbnail
                                                    image={attributes['wpbs-figure']?.mobileImage || {}}
                                                    callback={() => updateSettings({'mobileImage': undefined})}
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
                                            onSelect={(newValue) => updateSettings({
                                                'largeImage': {
                                                    type: newValue.type,
                                                    id: newValue.id,
                                                    url: newValue.url,
                                                    alt: newValue.alt,
                                                    sizes: newValue.sizes,
                                                }
                                            })}
                                            allowedTypes={['image']}
                                            value={attributes['wpbs-figure']?.largeImage}
                                            render={({open}) => {
                                                if (attributes['wpbs-figure']?.largeImage) {
                                                    return <PreviewThumbnail
                                                        image={attributes['wpbs-figure'].largeImage}
                                                        callback={() => updateSettings({'largeImage': undefined})}
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


                                <MemoSelectControl
                                    value={attributes['wpbs-figure']?.blend}
                                    label={'Blend'}
                                    options={BLEND_OPTIONS}
                                    callback={(newValue) => updateSettings({blend: newValue})}
                                />

                                <MemoSelectControl
                                    value={attributes['wpbs-figure']?.origin}
                                    label={'Origin'}
                                    options={ORIGIN_OPTIONS}
                                    callback={(newValue) => updateSettings({origin: newValue})}
                                />

                                <MemoSelectControl
                                    value={attributes['wpbs-figure']?.resolution}
                                    label={'Resolution'}
                                    options={RESOLUTION_OPTIONS}
                                    callback={(newValue) => updateSettings({resolution: newValue})}
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
                                    value={attributes['wpbs-figure']?.overlay ?? undefined}
                                    onChange={(newValue) => updateSettings({'overlay': newValue})}
                                />
                            </BaseControl>


                            <Grid columns={2} columnGap={15} rowGap={20}
                                  style={{display: attributes['wpbs-figure']?.type !== 'video' ? 'none' : null}}>

                                <BaseControl label={'Video'} __nextHasNoMarginBottom={true}>
                                    <MediaUploadCheck>
                                        <MediaUpload
                                            title={'Video'}
                                            onSelect={(newValue) => updateSettings({'video': newValue})}
                                            allowedTypes={['video']}
                                            value={attributes['wpbs-figure']?.video}
                                            render={({open}) => {
                                                return <PreviewThumbnail
                                                    image={attributes['wpbs-figure']?.video || {}}
                                                    callback={() => updateSettings({video: undefined})}
                                                    onClick={open}
                                                />;
                                            }}
                                        />
                                    </MediaUploadCheck>
                                </BaseControl>


                            </Grid>


                            <Grid columns={2} columnGap={15} rowGap={20}
                                  style={{padding: '1rem 0'}}>
                                <ToggleControl
                                    label="Eager"
                                    checked={!!attributes['wpbs-figure']?.eager}
                                    onChange={(value) => {
                                        updateSettings({'eager': value});
                                    }}
                                    className={'flex items-center'}
                                    __nextHasNoMarginBottom
                                />
                                <ToggleControl
                                    label="Force"
                                    checked={!!attributes['wpbs-figure']?.force}
                                    onChange={(value) => updateSettings({force: value})}
                                    className={'flex items-center'}
                                    __nextHasNoMarginBottom
                                />
                                <ToggleControl
                                    label="Contain"
                                    checked={!!attributes['wpbs-figure']?.contain}
                                    onChange={(value) => updateSettings({contain: value})}
                                    className={'flex items-center'}
                                    __nextHasNoMarginBottom
                                />
                                {attributes['wpbs-figure']?.type === 'featured-image' && <ToggleControl
                                    label="Link Post"
                                    checked={!!attributes['wpbs-figure']?.linkPost}
                                    onChange={(value) => updateSettings({linkPost: value})}
                                    className="flex items-center"
                                    __nextHasNoMarginBottom
                                />}

                            </Grid>
                        </Grid>
                    </Grid>
                </PanelBody>
            </InspectorControls>


            <figure {...blockProps}>
                <Media settings={attributes['wpbs-figure']} breakpoint={attributes?.['wpbs-breakpoint']?.large}
                       editor={true}/>
            </figure>

        </>;
    },
    save: (props) => {

        const blockProps = useBlockProps.save({
            className: blockClasses(props.attributes),
            'data-wp-interactive': 'wpbs',
            'data-wp-init': 'callbacks.observe'
        });


        return (
            <figure {...blockProps} >
                <Media settings={props.attributes} breakpoint={props.attributes?.['wpbs-breakpoint']?.large}
                       editor={false}/>
            </figure>
        );
    }
})


