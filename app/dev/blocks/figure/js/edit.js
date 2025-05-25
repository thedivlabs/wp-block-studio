import '../scss/block.scss';
import {
    useBlockProps,
    InspectorControls,
    BlockEdit, MediaUploadCheck, MediaUpload
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "../block.json"
import {LayoutControls, LAYOUT_ATTRIBUTES, layoutCss} from "Components/Layout"
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
import React, {useEffect, useState} from "react";
import Link from "Components/Link";
import {useInstanceId} from '@wordpress/compose';
import {Style, STYLE_ATTRIBUTES} from "Components/Style.js";
import {imageButtonStyle} from "Includes/helper.js";

function blockClasses(attributes = {}) {

    const {'wpbs-figure': settings = {}} = attributes;

    return [
        'wpbs-figure flex items-center justify-center relative max-w-full max-h-full',
        attributes.uniqueId,
    ].filter(x => x).join(' ');
}

function getSettings(attributes = {}) {

    const {'wpbs-figure': settings = {}} = attributes;

    return {
        force: !!settings?.['force'],
        eager: !!settings?.['eager'],
        resolution: settings?.['resolution'] ?? null,
        breakpoint: settings?.['breakpoint'] ?? null,
    };
}

function Media({attributes, editor = false, props = {}}) {

    const {'wpbs-figure': settings = {}} = attributes;

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

                return <ResponsivePicture mobile={settings?.['mobileImage']} large={settings?.['largeImage']}
                                          settings={getSettings(attributes)} editor={editor}></ResponsivePicture>;
            case 'featured-image':
                return !editor ? '%%IMAGE%%' : <figure
                    className={'w-full h-full bg-black opacity-30 border border-gray text-sm leading-normal text-center flex justify-center items-center text-white/50'}>FEATURED
                    IMAGE</figure>;
            default:
                return false
        }
    }

    if ((settings?.link || settings?.linkPost) && !editor) {
        return <a class={mediaClasses}
                  href={!settings?.linkPost ? settings.link?.url ?? '#' : '%%PERMALINK%%'}
                  title={settings.link?.title ?? ''}
                  target={!!settings.link?.opensInNewTab ? '_blank' : '_self'}
                  rel={settings.link?.rel ?? ''} style={mediaStyle}>
            <Content/>
        </a>
    } else {
        return <div class={mediaClasses} style={mediaStyle}>
            <Content/>
        </div>;
    }
}

const breakpoints = WPBS?.settings?.breakpoints ?? {};

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


registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...LAYOUT_ATTRIBUTES,
        ...STYLE_ATTRIBUTES,
        'wpbs-figure': {
            'type': undefined,
            'mobileImage': undefined,
            'largeImage': undefined,
            'breakpoint': undefined,
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
    },
    edit: ({attributes, setAttributes, clientId}) => {

        const [settings, setSettings] = useState(attributes['wpbs-figure']);

        const uniqueId = useInstanceId(registerBlockType, 'wpbs-figure');

        useEffect(() => {
            setAttributes({uniqueId: uniqueId});
        }, []);

        function updateSettings(newValue) {

            const result = {
                ...settings,
                ...newValue
            };

            setAttributes({
                'wpbs-figure': result
            });

            setSettings(result);

        }


        const blockProps = useBlockProps({
            className: blockClasses(attributes)
        });

        return <>
            <BlockEdit key="edit" {...blockProps} />
            <LayoutControls attributes={attributes} setAttributes={setAttributes}/>
            <Style attributes={attributes} setAttributes={setAttributes}
                   css={[layoutCss(attributes)]}
                   deps={['wpbs-layout', 'wpbs-figure', attributes?.uniqueId]}
                   props={{
                       '--figure-type': settings?.type ?? null,
                       '--overlay': settings?.overlay ?? null,
                   }}
            />
            <Link defaultValue={settings?.link} callback={(newValue) => updateSettings({'link': newValue})}/>
            <InspectorControls group="styles">
                <PanelBody initialOpen={true}>
                    <Grid columns={1} columnGap={15} rowGap={20}>
                        <SelectControl
                            __next40pxDefaultSize
                            label="Type"
                            value={settings?.type}
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
                        <Grid columns={1} columnGap={15} rowGap={20} style={{display: !settings?.type ? 'none' : null}}>

                            <Grid columns={2} columnGap={15} rowGap={20}
                                  style={{display: settings?.type !== 'image' && settings?.type !== 'featured-image' ? 'none' : null}}>
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
                                            value={settings?.mobileImage}
                                            render={({open}) => {
                                                return <PreviewThumbnail
                                                    image={settings?.mobileImage || {}}
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
                                            value={settings?.largeImage}
                                            render={({open}) => {
                                                if (settings?.largeImage) {
                                                    return <PreviewThumbnail
                                                        image={settings.largeImage}
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
                                    value={settings?.blend}
                                    label={'Blend'}
                                    options={BLEND_OPTIONS}
                                    callback={(newValue) => updateSettings({blend: newValue})}
                                />

                                <MemoSelectControl
                                    value={settings?.origin}
                                    label={'Origin'}
                                    options={ORIGIN_OPTIONS}
                                    callback={(newValue) => updateSettings({origin: newValue})}
                                />

                                <MemoSelectControl
                                    value={settings?.resolution}
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
                                    value={settings?.overlay ?? undefined}
                                    onChange={(newValue) => updateSettings({'overlay': newValue})}
                                />
                            </BaseControl>


                            <Grid columns={2} columnGap={15} rowGap={20}
                                  style={{display: settings?.type !== 'video' ? 'none' : null}}>

                                <BaseControl label={'Video'} __nextHasNoMarginBottom={true}>
                                    <MediaUploadCheck>
                                        <MediaUpload
                                            title={'Video'}
                                            onSelect={(newValue) => updateSettings({'video': newValue})}
                                            allowedTypes={['video']}
                                            value={settings?.video}
                                            render={({open}) => {
                                                return <PreviewThumbnail
                                                    image={settings?.video || {}}
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
                                    checked={!!settings?.eager}
                                    onChange={(value) => {
                                        updateSettings({'eager': value});

                                        if (value) {
                                            setAttributes({
                                                preload: [
                                                    {
                                                        mobile: settings?.mobileImage?.id ?? null,
                                                        large: settings?.largeImage?.id ?? null,
                                                        size: settings?.resolution ?? null
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
                                    checked={!!settings?.force}
                                    onChange={(value) => updateSettings({force: value})}
                                    className={'flex items-center'}
                                    __nextHasNoMarginBottom
                                />
                                <ToggleControl
                                    label="Contain"
                                    checked={!!settings?.contain}
                                    onChange={(value) => updateSettings({contain: value})}
                                    className={'flex items-center'}
                                    __nextHasNoMarginBottom
                                />
                                {settings?.type === 'featured-image' && <ToggleControl
                                    label="Link Post"
                                    checked={!!settings?.linkPost}
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
                <Media attributes={attributes} editor={true}/>
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
                <Media attributes={props.attributes} editor={false}/>
            </figure>
        );
    }
})


