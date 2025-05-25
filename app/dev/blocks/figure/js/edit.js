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
    Button,
    PanelBody,
    SelectControl,
    ToggleControl,
} from "@wordpress/components";
import PreviewThumbnail from "Components/PreviewThumbnail";
import ResponsivePicture from "Components/ResponsivePicture.js";
import React, {useEffect, useState} from "react";

import {useSettings} from '@wordpress/block-editor';
import Blend from "Components/Blend";
import Origin from "Components/Origin";
import Resolution from "Components/Resolution";
import Overlay from "Components/Overlay";
import Link from "Components/Link";
import {useInstanceId} from '@wordpress/compose';
import {imageButtonStyle} from "Includes/helper";
import {Style, STYLE_ATTRIBUTES} from "Components/Style.js";

function blockClasses(attributes = {}) {

    const {'wpbs-figure': settings = {}} = attributes;

    return [
        'wpbs-figure flex items-center justify-center relative max-w-full max-h-full'
    ].filter(x => x).join(' ');
}

function blockStyles(attributes = {}) {

    const {'wpbs-figure': settings = {}} = attributes;

    return {
        '--figure-type': settings?.type ?? null,
        '--overlay': settings?.overlay ?? null,
    };
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

    const mediaClasses = [
        'wpbs-figure__media w-full h-full overflow-hidden rounded-inherit',
    ].filter(x => x).join(' ');

    let mediaStyle = {
        ['mix-blend-mode']: attributes['wpbs-blend'] || null,
        ['object-fit']: attributes['wpbs-contain'] ? 'contain' : 'cover',
    };

    mediaStyle = {
        ...mediaStyle,
    }

    const Content = () => {

        switch (attributes['wpbs-type']) {
            case 'image':

                return <ResponsivePicture mobile={attributes['wpbs-mobileImage']} large={attributes['wpbs-largeImage']}
                                          settings={getSettings(attributes)} editor={editor}></ResponsivePicture>;
            case 'featured-image':
                return !editor ? '%%IMAGE%%' : <figure
                    className={'w-full h-full bg-black opacity-30 border border-gray text-sm leading-normal text-center flex justify-center items-center text-white/50'}>FEATURED
                    IMAGE</figure>;
            default:
                return false
        }
    }

    if (attributes['wpbs-link'] && !editor) {
        return <a class={mediaClasses}
                  href={!attributes['wpbs-linkPost'] ? attributes['wpbs-link'].url : '%%PERMALINK%%'}
                  title={attributes['wpbs-link'].title}
                  target={attributes['wpbs-link'].opensInNewTab ? '_blank' : '_self'}
                  rel={attributes['wpbs-link'].rel} style={mediaStyle}>
            <Content/>
        </a>
    } else {
        return <div class={mediaClasses} style={mediaStyle}>
            <Content/>
        </div>;
    }
}


registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...LAYOUT_ATTRIBUTES,
        ...STYLE_ATTRIBUTES,
        'wpbs-figure': {
            'wpbs-type': undefined,
            'wpbs-mobileImage': undefined,
            'wpbs-largeImage': undefined,
            'wpbs-breakpoint': undefined,
            'wpbs-eager': undefined,
            'wpbs-force': undefined,
            'wpbs-resolution': undefined,
            'wpbs-contain': undefined,
            'wpbs-linkPost': undefined,
            'wpbs-blend': undefined,
            'wpbs-origin': undefined,
            'wpbs-overlay': undefined,
            'wpbs-link': undefined,
        }
    },
    edit: ({attributes, setAttributes, clientId}) => {

        const breakpoints = WPBS?.settings?.breakpoints ?? {};

        const [settings, setSettings] = useState(attributes['wpbs-figure']);

        const uniqueId = useInstanceId(registerBlockType, 'wpbs-figure');

        useEffect(() => {
            setAttributes({uniqueId: uniqueId});
        }, []);


        const blockProps = useBlockProps({
            className: [blockClasses(attributes), uniqueId].join(' '),
            style: {
                ...blockStyles(attributes),
            }
        });

        return <>
            <BlockEdit key="edit" {...blockProps} />
            <LayoutSettings attributes={attributes} setAttributes={setAttributes}/>
            <Link defaultValue={link} callback={(newValue) => {
                setAttributes({['wpbs-link']: newValue});
                setLink(newValue);
            }}/>
            <InspectorControls group="styles">
                <PanelBody initialOpen={true}>
                    <Grid columns={1} columnGap={15} rowGap={20}>
                        <SelectControl
                            __next40pxDefaultSize
                            label="Type"
                            value={type}
                            options={[
                                {label: 'Select', value: ''},
                                {label: 'Image', value: 'image'},
                                {label: 'Featured Image', value: 'featured-image'},
                                {label: 'Lottie', value: 'lottie'},
                                {label: 'Icon', value: 'icon'},
                            ]}
                            onChange={(value) => {
                                setType(value);
                                setAttributes({['wpbs-type']: value});
                            }}
                            __nextHasNoMarginBottom
                        />
                        <Grid columns={1} columnGap={15} rowGap={20} style={{display: !type ? 'none' : null}}>

                            <Grid columns={2} columnGap={15} rowGap={20}
                                  style={{display: type !== 'image' && type !== 'featured-image' ? 'none' : null}}>
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
                                                    ['wpbs-mobileImage']: {
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
                                                        setAttributes({['wpbs-mobileImage']: undefined});
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
                                                    ['wpbs-largeImage']: {
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
                                                            setAttributes({['wpbs-largeImage']: undefined});
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


                                <Blend defaultValue={attributes['wpbs-blend']} callback={(newValue) => {
                                    setAttributes({['wpbs-blend']: newValue});
                                }}/>
                                <Origin defaultValue={attributes['wpbs-origin']} callback={(newValue) => {
                                    setAttributes({['wpbs-origin']: newValue});
                                }}/>
                                <Resolution defaultValue={attributes['wpbs-resolution']} callback={(newValue) => {
                                    setAttributes({['wpbs-resolution']: newValue});
                                }}/>
                            </Grid>

                            <Overlay defaultValue={attributes['wpbs-overlay']} callback={(newValue) => {
                                setAttributes({['wpbs-overlay']: newValue});
                            }}/>

                            <Grid columns={2} columnGap={15} rowGap={20}
                                  style={{display: type !== 'video' ? 'none' : null}}>

                                <BaseControl label={'Video'} __nextHasNoMarginBottom={true}>
                                    <MediaUploadCheck>
                                        <MediaUpload
                                            title={'Video'}
                                            onSelect={(value) => {
                                                setVideo(value);
                                                setAttributes({['wpbs-video']: value});
                                            }}
                                            allowedTypes={['video']}
                                            value={video}
                                            render={({open}) => {
                                                return <PreviewThumbnail
                                                    image={video || {}}
                                                    callback={() => {
                                                        setVideo(undefined);
                                                        setAttributes({['wpbs-video']: undefined});
                                                    }}
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
                                    checked={eager}
                                    onChange={(value) => {
                                        setEager(value);
                                        setAttributes({['wpbs-eager']: value});

                                        if (value) {
                                            setAttributes({
                                                preload: [
                                                    {
                                                        mobile: !!attributes['wpbs-mobileImage'] ? attributes['wpbs-mobileImage'].id : null,
                                                        large: !!attributes['wpbs-largeImage'] ? attributes['wpbs-largeImage'].id : null,
                                                        size: attributes['wpbs-resolution'] || null
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
                                        setAttributes({['wpbs-force']: value});
                                    }}
                                    className={'flex items-center'}
                                    __nextHasNoMarginBottom
                                />
                                <ToggleControl
                                    label="Contain"
                                    checked={contain}
                                    onChange={(value) => {
                                        setContain(value);
                                        setAttributes({['wpbs-contain']: value});
                                    }}
                                    className={'flex items-center'}
                                    __nextHasNoMarginBottom
                                />
                                {attributes['wpbs-type'] === 'featured-image' && (
                                    <ToggleControl
                                        label="Link Post"
                                        checked={!!linkPost}
                                        onChange={(value) => {
                                            setLinkPost(value);
                                            setAttributes({['wpbs-linkPost']: value});
                                        }}
                                        className="flex items-center"
                                        __nextHasNoMarginBottom
                                    />
                                )}

                            </Grid>
                        </Grid>
                    </Grid>
                </PanelBody>
            </InspectorControls>


            <figure {...blockProps}>
                <Media attributes={attributes} editor={true}/>
                <Style attributes={attributes} setAttributes={setAttributes} uniqueId={uniqueId}
                       selector={'wpbs-figure'}/>
            </figure>

        </>;
    },
    save: (props) => {

        const blockProps = useBlockProps.save({
            className: blockClasses(props.attributes),
            'data-wp-interactive': 'wpbs',
            'data-wp-init': 'callbacks.observe',
            style: {
                ...blockStyles(props.attributes),
            }
        });


        return (
            <figure {...blockProps} >
                <Media attributes={props.attributes} editor={false}/>
            </figure>
        );
    }
})


