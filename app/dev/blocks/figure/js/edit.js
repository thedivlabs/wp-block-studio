import '../scss/block.scss';
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
    SelectControl,
    ToggleControl,
} from "@wordpress/components";
import PreviewThumbnail from "Components/PreviewThumbnail";
import Picture from "Components/Picture";
import React, {useState} from "react";


import {useSettings} from '@wordpress/block-editor';
import Blend from "Components/Blend";
import Origin from "Components/Origin";
import Resolution from "Components/Resolution";
import Overlay from "Components/Overlay";
import Link from "Components/Link";

function classNames(attributes = {}) {

    return [
        'wpbs-figure flex items-center justify-center relative',
        LayoutClasses(attributes)
    ].filter(x => x).join(' ');
}

function blockStyles(attributes = {}) {

    return {
        '--figure-type': attributes.type,
        //'--figure-mask': attributes.mask,
        '--figure-mask-origin': attributes.maskOrigin,
        '--figure-mask-size': attributes.maskSize,
        maskRepeat: 'no-repeat',
        maskImage: 'var(--figure-mask, none)',
        maskSize: attributes['wpbs-maskSize'] || 'contain',
        maskPosition: attributes['wpbs-maskOrigin'] || 'center',
        '--overlay': attributes['wpbs-overlay']
    };
}

const blockAttributes = {
    'wpbs-type': {
        type: 'string'
    },
    'wpbs-mobileImage': {
        type: 'object'
    },
    'wpbs-largeImage': {
        type: 'object'
    },
    'wpbs-breakpoint': {
        type: 'string'
    },
    'wpbs-mobileVideo': {
        type: 'object'
    },
    'wpbs-video': {
        type: 'object'
    },
    'wpbs-maskImage': {
        type: 'object'
    },
    'wpbs-maskImageMobile': {
        type: 'object',
    },
    'wpbs-prop-figure-mask': {
        type: 'string'
    },
    'wpbs-prop-figure-mask-mobile': {
        type: 'string',
    },
    'wpbs-eager': {
        type: 'boolean'
    },
    'wpbs-force': {
        type: 'boolean'
    },
    'wpbs-mask': {
        type: 'boolean'
    },
    'wpbs-resolution': {
        type: 'string'
    },
    'wpbs-contain': {
        type: 'boolean'
    },
    'wpbs-blend': {
        type: 'string'
    },
    'wpbs-origin': {
        type: 'string'
    },
    'wpbs-maskOrigin': {
        type: 'string'
    },
    'wpbs-maskSize': {
        type: 'string'
    },
    'wpbs-overlay': {
        type: 'string'
    },
    'wpbs-link': {
        type: 'object'
    },
    'wpbs-featureImage': {
        type: 'boolean'
    },
}

function getSettings(attributes = {}) {
    return {
        force: attributes['wpbs-force'],
        eager: attributes['wpbs-eager'],
        resolution: attributes['wpbs-resolution'],
        breakpoint: attributes['wpbs-breakpoint'],
    };
}

function Media({attributes, editor = false, props = {}}) {

    const {className: propsClasses} = props;

    const classNames = [
        'wpbs-figure__media w-full h-full overflow-hidden',
        propsClasses
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

                return <Picture mobile={attributes['wpbs-mobileImage']} large={attributes['wpbs-largeImage']}
                                settings={getSettings(attributes)} editor={editor}></Picture>;
            default:
                return false
        }
    }

    if (attributes['wpbs-link'] && !editor) {
        return <a class={classNames} href={attributes['wpbs-link'].url} target={attributes['wpbs-link'].target}
                  rel={attributes['wpbs-link'].rel} style={mediaStyle}>
            <Content/>
        </a>
    } else {
        return <div class={classNames} style={mediaStyle}>
            <Content/>
        </div>;
    }
}


registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...LayoutAttributes,
        ...blockAttributes
    },
    edit: ({attributes, setAttributes, clientId}) => {

        const [{breakpoints}] = useSettings(['custom']);

        const [type, setType] = useState(attributes['wpbs-type']);
        const [mobileImage, setMobileImage] = useState(attributes['wpbs-mobileImage']);
        const [largeImage, setLargeImage] = useState(attributes['wpbs-largeImage']);
        const [video, setVideo] = useState(attributes['wpbs-video']);
        const [maskImage, setMaskImage] = useState(attributes['wpbs-maskImage']);
        const [maskImageMobile, setMaskImageMobile] = useState(attributes['wpbs-maskImageMobile']);
        const [eager, setEager] = useState(attributes['wpbs-eager']);
        const [force, setForce] = useState(attributes['wpbs-force']);
        const [link, setLink] = useState(attributes['wpbs-link']);
        const [contain, setContain] = useState(attributes.contain);

        const [mask, setMask] = useState(attributes['wpbs-mask']);
        const [maskOrigin, setMaskOrigin] = useState(attributes['wpbs-maskOrigin']);
        const [maskSize, setMaskSize] = useState(attributes['wpbs-maskSize']);

        setAttributes({
            ['wpbs-prop-figure-mask']: maskImage && mask === true ? 'url(' + attributes['wpbs-maskImage'].url + ')' : 'none',
        });

        setAttributes({
            ['wpbs-prop-figure-mask-mobile']: maskImageMobile && mask === true ? 'url(' + attributes['wpbs-maskImageMobile'].url + ')' : 'none',
        });

        const buttonStyle = {
            border: '1px dashed lightgray',
            width: '100%',
            height: 'auto',
            aspectRatio: '16/9',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
        };

        const blockProps = useBlockProps({
            className: classNames(attributes),
            //'data-wp-interactive': 'wpbs-figure',
            //'data-wp-run': 'callbacks.isInView',
            style: {
                ...blockStyles(attributes),
            }
        });

        setAttributes({
            ['wpbs-breakpoint']: breakpoints[attributes['wpbs-layout-breakpoint'] || 'normal'],
        });

        return (
            <>
                <BlockEdit key="edit" {...blockProps} />
                <Link defaultValue={link} callback={(newValue) => {
                    setAttributes({['wpbs-link']: newValue});
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
                                    {label: 'Video', value: 'video'},
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
                                      style={{display: type !== 'image' ? 'none' : null}}>
                                    <BaseControl label={'Mobile Image'} __nextHasNoMarginBottom={true}>
                                        <MediaUploadCheck>
                                            <MediaUpload
                                                title={'Mobile Image'}
                                                onSelect={(value) => {
                                                    setMobileImage(value);
                                                    setAttributes({['wpbs-mobileImage']: value});
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
                                                    setLargeImage(value);
                                                    setAttributes({['wpbs-largeImage']: value});
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
                                                        return <Button onClick={open} style={buttonStyle}>Choose
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
                                    <Size defaultValue={attributes['wpbs-size']} callback={(newValue) => {
                                        setAttributes({['wpbs-size']: newValue});
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
                                        label="Mask"
                                        checked={mask}
                                        onChange={(value) => {
                                            setMask(value);
                                            setAttributes({['wpbs-mask']: value});
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

                                </Grid>
                                <Grid columns={2} columnGap={15} rowGap={20}
                                      style={{display: !mask ? 'none' : null}}>
                                    <BaseControl label={'Mask Mobile'} __nextHasNoMarginBottom={true}>
                                        <MediaUploadCheck>
                                            <MediaUpload
                                                title={'Mask Mobile'}
                                                onSelect={(value) => {
                                                    setMaskImageMobile(value);
                                                    setAttributes({
                                                        ['wpbs-maskImageMobile']: value,
                                                    });
                                                }}
                                                allowedTypes={['image']}
                                                value={maskImageMobile}
                                                render={({open}) => {
                                                    return <PreviewThumbnail
                                                        image={maskImageMobile || {}}
                                                        callback={() => {
                                                            setMaskImageMobile(undefined);
                                                            setAttributes({
                                                                ['wpbs-maskImageMobile']: undefined,
                                                            });
                                                        }}
                                                        style={{
                                                            objectFit: 'contain',
                                                            backgroundColor: 'rgba(0,0,0,0.1)',
                                                        }}
                                                        onClick={open}
                                                    />;
                                                }}
                                            />
                                        </MediaUploadCheck>
                                    </BaseControl>
                                    <BaseControl label={'Mask Large'} __nextHasNoMarginBottom={true}>
                                        <MediaUploadCheck>
                                            <MediaUpload
                                                title={'Mask Large'}
                                                onSelect={(value) => {
                                                    setMaskImage(value);
                                                    setAttributes({
                                                        ['wpbs-maskImage']: value,
                                                    });
                                                }}
                                                allowedTypes={['image']}
                                                value={maskImage}
                                                render={({open}) => {
                                                    return <PreviewThumbnail
                                                        image={maskImage || {}}
                                                        callback={() => {
                                                            setMaskImage(undefined);
                                                            setAttributes({
                                                                ['wpbs-maskImage']: undefined,
                                                            });
                                                        }}
                                                        style={{
                                                            objectFit: 'contain',
                                                            backgroundColor: 'rgba(0,0,0,0.1)',
                                                        }}
                                                        onClick={open}
                                                    />;
                                                }}
                                            />
                                        </MediaUploadCheck>
                                    </BaseControl>
                                    <SelectControl
                                        __next40pxDefaultSize
                                        label="Mask Origin"
                                        value={maskOrigin}
                                        options={[
                                            {label: 'Default', value: ''},
                                            {label: 'Center', value: 'center'},
                                            {label: 'Top', value: 'top'},
                                            {label: 'Right', value: 'right'},
                                            {label: 'Bottom', value: 'bottom'},
                                            {label: 'Left', value: 'left'},
                                            {label: 'Top Left', value: 'top left'},
                                            {label: 'Top Right', value: 'top right'},
                                            {label: 'Bottom Left', value: 'bottom left'},
                                            {label: 'Bottom Right', value: 'bottom right'},
                                        ]}
                                        onChange={(value) => {
                                            setMaskOrigin(value);
                                            setAttributes({['wpbs-maskOrigin']: value});
                                        }}
                                        __nextHasNoMarginBottom
                                    />
                                    <SelectControl
                                        __next40pxDefaultSize
                                        label="Mask Size"
                                        value={maskSize}
                                        options={[
                                            {label: 'Default', value: 'contain'},
                                            {label: 'Cover', value: 'cover'},
                                            {label: 'Vertical', value: 'auto 100%'},
                                            {label: 'Horizontal', value: '100% auto'},
                                        ]}
                                        onChange={(value) => {
                                            setMaskSize(value);
                                            setAttributes({['wpbs-maskSize']: value});
                                        }}
                                        __nextHasNoMarginBottom
                                    />

                                </Grid>
                            </Grid>
                        </Grid>
                    </PanelBody>
                </InspectorControls>

                <Layout blockProps={blockProps} attributes={attributes} setAttributes={setAttributes}
                        clientId={clientId}></Layout>

                <figure {...blockProps}>
                    <Media attributes={attributes} editor={true}/>
                </figure>

            </>
        )
    },
    save: (props) => {

        const blockProps = useBlockProps.save({
            className: classNames(props.attributes),
            style: {
                ...blockStyles(props.attributes),
            }
        });


        return (
            <figure {...blockProps} data-wp-interactive="wpbs" data-wp-init="callbacks.observe">
                <Media attributes={props.attributes} editor={false}/>
            </figure>
        );
    }
})


