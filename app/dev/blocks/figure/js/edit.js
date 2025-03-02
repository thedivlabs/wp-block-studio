import {
    useBlockProps,
    InspectorControls,
    BlockEdit, MediaUploadCheck, MediaUpload,
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "../block.json"
import {Layout, LayoutAttributes, LayoutClasses} from "Components/Layout"
import {
    __experimentalGrid as Grid, BaseControl, Button, SelectControl, TabPanel, ToggleControl,
} from "@wordpress/components";
import PreviewThumbnail from "Components/PreviewThumbnail";
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
        type: 'bool'
    },
    force: {
        type: 'bool'
    },
    mask: {
        type: 'bool'
    },
    resolution: {
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

        const [mask, setMask] = useState(attributes.mask);
        const [resolution, setResolution] = useState(attributes.resolution);
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

        return (
            <>
                <BlockEdit key="edit" {...blockProps} />
                <InspectorControls group="styles">
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
                                updateSettings('type', value, setType);
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
                                                updateSettings('mobileImage', value, setMobileImage);
                                            }}
                                            allowedTypes={['image']}
                                            value={mobileImage}
                                            render={({open}) => {
                                                if (mobileImage) {
                                                    return <>
                                                        <PreviewThumbnail
                                                            image={mobileImage || {}}
                                                            callback={() => {
                                                                updateSettings('mobileImage', undefined, setMobileImage)
                                                            }}
                                                        /></>;
                                                } else {
                                                    return <Button onClick={open} style={buttonStyle}>Choose
                                                        Image</Button>
                                                }
                                            }}
                                        />
                                    </MediaUploadCheck>
                                </BaseControl>
                                <BaseControl label={'Large Image'} __nextHasNoMarginBottom={true}>
                                    <MediaUploadCheck>
                                        <MediaUpload
                                            title={'Large Image'}
                                            onSelect={(value) => {
                                                updateSettings('largeImage', value, setLargeImage);
                                            }}
                                            allowedTypes={['image']}
                                            value={largeImage}
                                            render={({open}) => {
                                                if (largeImage) {
                                                    return <>
                                                        <PreviewThumbnail
                                                            image={largeImage || {}}
                                                            callback={() => {
                                                                updateSettings('largeImage', undefined, setLargeImage)
                                                            }}
                                                        /></>;
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
                                                updateSettings('mobileVideo', value, setMobileVideo);
                                            }}
                                            allowedTypes={['video']}
                                            value={mobileVideo}
                                            render={({open}) => {
                                                if (mobileVideo) {
                                                    return <>
                                                        <PreviewThumbnail
                                                            image={mobileVideo || {}}
                                                            callback={() => {
                                                                updateSettings('mobileVideo', undefined, setMobileVideo)
                                                            }}
                                                        /></>;
                                                } else {
                                                    return <Button onClick={open} style={buttonStyle}>Choose
                                                        Image</Button>
                                                }
                                            }}
                                        />
                                    </MediaUploadCheck>
                                </BaseControl>
                                <BaseControl label={'Large Video'} __nextHasNoMarginBottom={true}>
                                    <MediaUploadCheck>
                                        <MediaUpload
                                            title={'Large Video'}
                                            onSelect={(value) => {
                                                updateSettings('largeVideo', value, setLargeVideo);
                                            }}
                                            allowedTypes={['video']}
                                            value={largeVideo}
                                            render={({open}) => {
                                                if (largeVideo) {
                                                    return <>
                                                        <PreviewThumbnail
                                                            image={largeVideo || {}}
                                                            callback={() => {
                                                                updateSettings('largeVideo', undefined, setLargeVideo)
                                                            }}
                                                        /></>;
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
                                  style={{padding: '1rem 0'}}>
                                <ToggleControl
                                    label="Eager"
                                    checked={eager}
                                    onChange={(value) => {
                                        updateSettings('eager', value, setEager);
                                    }}
                                    className={'flex items-center'}
                                    __nextHasNoMarginBottom
                                />
                                <ToggleControl
                                    label="Force"
                                    checked={force}
                                    onChange={(value) => {
                                        updateSettings('force', value, setForce);
                                    }}
                                    className={'flex items-center'}
                                    __nextHasNoMarginBottom
                                />
                            </Grid>

                            <TabPanel
                                className="wpbs-editor-tabs"
                                activeClass="active"
                                orientation="horizontal"
                                initialTabName="desktop"
                                tabs={[
                                    {
                                        name: 'desktop',
                                        title: 'Desktop',
                                        className: 'tab-desktop',
                                    },
                                    {
                                        name: 'mobile',
                                        title: 'Mobile',
                                        className: 'tab-mobile',
                                    },
                                ]}>
                                {
                                    (tab) => (<>{tabs[tab.name]}</>)
                                }
                            </TabPanel>
                        </Grid>
                    </Grid>
                </InspectorControls>

                <Layout blockProps={blockProps} attributes={attributes} setAttributes={setAttributes}
                        clientId={clientId}></Layout>
                <figure {...blockProps} data-wp-interactive='wpbs/wpbs-figure'>

                </figure>
            </>
        )
    },
    save: (props) => {


        const blockProps = useBlockProps.save({
            className: classNames(props.attributes),
        });

        return (
            <figure {...blockProps} data-wp-interactive='wpbs/wpbs-figure'>

            </figure>
        );
    }
})


