import {
    useBlockProps,
    InspectorControls,
    BlockEdit, MediaUploadCheck, MediaUpload,
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "../block.json"
import {Layout, LayoutAttributes, LayoutClasses} from "Components/Layout"
import {
    __experimentalGrid as Grid, BaseControl, Button, PanelBody, SelectControl, TabPanel, ToggleControl,
} from "@wordpress/components";
import PreviewThumbnail from "Components/PreviewThumbnail";
import Picture from "Components/Picture";
import React, {useState} from "react";


function classNames(attributes = {}) {

    return [
        'wpbs-figure',
        LayoutClasses(attributes)
    ].filter(x => x).join(' ');
}

const blockAttributes = {
    type: {
        type: 'string'
    },
    mobileImage: {
        type: 'object'
    },
    largeImage: {
        type: 'object'
    },
    mobileVideo: {
        type: 'object'
    },
    largeVideo: {
        type: 'object'
    },
    maskImageMobile: {
        type: 'object'
    },
    maskImageLarge: {
        type: 'object'
    },
    eager: {
        type: 'boolean'
    },
    force: {
        type: 'boolean'
    },
    mask: {
        type: 'boolean'
    },
    resolution: {
        type: 'string'
    },
    size: {
        type: 'string'
    },
    blend: {
        type: 'string'
    },
    origin: {
        type: 'string'
    },
    maskOrigin: {
        type: 'string'
    },
    maskSize: {
        type: 'string'
    },
    overlay: {
        type: 'string'
    },
    link: {
        type: 'object'
    },
    featureImage: {
        type: 'boolean'
    },
}

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...LayoutAttributes,
        ...blockAttributes
    },
    edit: ({attributes, setAttributes, clientId}) => {


        const [type, setType] = useState(attributes.type);
        const [mobileImage, setMobileImage] = useState(attributes.mobileImage);
        const [largeImage, setLargeImage] = useState(attributes.largeImage);
        const [mobileVideo, setMobileVideo] = useState(attributes.mobileVideo);
        const [largeVideo, setLargeVideo] = useState(attributes.largeVideo);
        const [maskImageMobile, setMaskImageMobile] = useState(attributes.maskImageMobile);
        const [maskImageLarge, setMaskImageLarge] = useState(attributes.maskImageLarge);
        const [eager, setEager] = useState(attributes.eager);
        const [force, setForce] = useState(attributes.force);
        const [link, setLink] = useState(attributes.link);
        const [featureImage, setFeatureImage] = useState(attributes.featureImage);

        const [mask, setMask] = useState(attributes.mask);
        const [resolution, setResolution] = useState(attributes.resolution);
        const [size, setSize] = useState(attributes.size);
        const [blend, setBlend] = useState(attributes.blend);
        const [origin, setOrigin] = useState(attributes.origin);
        const [maskOrigin, setMaskOrigin] = useState(attributes.maskOrigin);
        const [maskSize, setMaskSize] = useState(attributes.maskSize);
        const [overlay, setOverlay] = useState(attributes.overlay);

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
        });

        const settings = {
            force: force,
            eager: eager,
            resolution: resolution,
            breakpoint: attributes['wpbs-breakpoint'],
        }

        return (
            <>
                <BlockEdit key="edit" {...blockProps} />

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
                                    setAttributes({type: value});
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
                                                    setAttributes({mobileImage: value});
                                                }}
                                                allowedTypes={['image']}
                                                value={mobileImage}
                                                render={({open}) => {
                                                    return <PreviewThumbnail
                                                        image={mobileImage || {}}
                                                        callback={() => {
                                                            setMobileImage(undefined);
                                                            setAttributes({mobileImage: undefined});
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
                                                    setAttributes({largeImage: value});
                                                }}
                                                allowedTypes={['image']}
                                                value={largeImage}
                                                render={({open}) => {
                                                    if (largeImage) {
                                                        return <PreviewThumbnail
                                                            image={largeImage || {}}
                                                            callback={() => {
                                                                setLargeImage(undefined);
                                                                setAttributes({largeImage: undefined});
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


                                </Grid>
                                <Grid columns={2} columnGap={15} rowGap={20}
                                      style={{display: type !== 'video' ? 'none' : null}}>

                                    <BaseControl label={'Mobile Video'} __nextHasNoMarginBottom={true}>
                                        <MediaUploadCheck>
                                            <MediaUpload
                                                title={'Mobile Video'}
                                                onSelect={(value) => {
                                                    setMobileVideo(value);
                                                    setAttributes({mobileVideo: value});
                                                }}
                                                allowedTypes={['video']}
                                                value={mobileVideo}
                                                render={({open}) => {
                                                    return <PreviewThumbnail
                                                        image={mobileVideo || {}}
                                                        callback={() => {
                                                            setMobileVideo(undefined);
                                                            setAttributes({mobileVideo: undefined});
                                                        }}
                                                        onClick={open}
                                                    />;
                                                }}
                                            />
                                        </MediaUploadCheck>
                                    </BaseControl>
                                    <BaseControl label={'Large Video'} __nextHasNoMarginBottom={true}>
                                        <MediaUploadCheck>
                                            <MediaUpload
                                                title={'Large Video'}
                                                onSelect={(value) => {
                                                    setLargeVideo(value);
                                                    setAttributes({largeVideo: value});
                                                }}
                                                allowedTypes={['video']}
                                                value={largeVideo}
                                                render={({open}) => {
                                                    return <PreviewThumbnail
                                                        image={largeVideo || {}}
                                                        callback={() => {
                                                            setLargeVideo(undefined);
                                                            setAttributes({largeVideo: undefined});
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
                                            setAttributes({eager: value});
                                        }}
                                        className={'flex items-center'}
                                        __nextHasNoMarginBottom
                                    />
                                    <ToggleControl
                                        label="Force"
                                        checked={force}
                                        onChange={(value) => {
                                            setForce(value);
                                            setAttributes({force: value});
                                        }}
                                        className={'flex items-center'}
                                        __nextHasNoMarginBottom
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
                    </PanelBody>
                </InspectorControls>

                <Layout blockProps={blockProps} attributes={attributes} setAttributes={setAttributes}
                        clientId={clientId}></Layout>

                <figure {...blockProps} data-wp-interactive='wpbs/wpbs-figure'>
                    <Picture mobile={mobileImage} large={largeImage} settings={settings}></Picture>
                </figure>

            </>
        )
    },
    save: (props) => {


        const blockProps = useBlockProps.save({
            className: classNames(props.attributes),
        });

        const {
            force,
            eager,
            resolution,
            mobileImage,
            largeImage,
            ['wpbs-breakpoint']: breakpoint,
        } = props.attributes;


        const settings = {
            force: force,
            eager: eager,
            resolution: resolution,
            breakpoint: breakpoint,
        }

        return (
            <figure {...blockProps} data-wp-interactive='wpbs/wpbs-figure'>
                <Picture mobile={mobileImage} large={largeImage} settings={settings}></Picture>
            </figure>
        );
    }
})


