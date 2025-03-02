import {
    useBlockProps,
    InspectorControls,
    BlockEdit, MediaUploadCheck, MediaUpload,
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "../block.json"
import {Layout, LayoutAttributes, LayoutClasses} from "Components/Layout"
import {
    __experimentalHStack as HStack,
    __experimentalGrid as Grid, BaseControl, Button, PanelBody, SelectControl, ToggleControl,
} from "@wordpress/components";
import PreviewThumbnail from "Components/PreviewThumbnail";
import Picture from "Components/Picture";
import React, {useState} from "react";
import {useSettings} from '@wordpress/block-editor';


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
    breakpoint: {
        type: 'string'
    },
    mobileVideo: {
        type: 'object'
    },
    video: {
        type: 'object'
    },
    maskImage: {
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
    maskMobile: {
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

function getSettings(attributes = {}) {
    return {
        force: attributes.force,
        eager: attributes.eager,
        resolution: attributes.resolution,
        breakpoint: attributes.breakpoint,
    };
}

function Media({attributes}) {

    const classNames = [
        'wpbs-figure__media'
    ].filter(x => x).join(' ');

    const Content = () => {
        switch (attributes.type) {
            case 'image':
                return <Picture mobile={attributes.mobileImage} large={attributes.largeImage}
                                settings={getSettings(attributes)}></Picture>;
            case 'video':
                return <></>;
            default:
                return false
        }
    }

    if (attributes.link) {
        return <a class={classNames} href={attributes.link.url} target={attributes.link.target}
                  rel={attributes.link.rel}>
            <Content/>
        </a>
    } else {
        return <div class={classNames}>
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

        setAttributes({breakpoint: breakpoints[attributes['wpbs-layout-breakpoint'] || 'normal']});

        const [type, setType] = useState(attributes.type);
        const [mobileImage, setMobileImage] = useState(attributes.mobileImage);
        const [largeImage, setLargeImage] = useState(attributes.largeImage);
        const [video, setVideo] = useState(attributes.video);
        const [maskImage, setMaskImage] = useState(attributes.maskImage);
        const [eager, setEager] = useState(attributes.eager);
        const [force, setForce] = useState(attributes.force);
        const [link, setLink] = useState(attributes.link);
        const [featureImage, setFeatureImage] = useState(attributes.featureImage);

        const [mask, setMask] = useState(attributes.mask);
        const [maskMobile, setMaskMobile] = useState(attributes.maskMobile);
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

        const blockStyle = {
            '--figure-type': type,
            '--figure-mask': mask,
            '--figure-mask-origin': maskOrigin,
            '--figure-mask-size': maskSize,
        }

        const blockProps = useBlockProps({
            className: classNames(attributes),
            style: {
                ...blockStyle,
            }
        });


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

                                    <BaseControl label={'Video'} __nextHasNoMarginBottom={true}>
                                        <MediaUploadCheck>
                                            <MediaUpload
                                                title={'Video'}
                                                onSelect={(value) => {
                                                    setVideo(value);
                                                    setAttributes({video: value});
                                                }}
                                                allowedTypes={['video']}
                                                value={video}
                                                render={({open}) => {
                                                    return <PreviewThumbnail
                                                        image={video || {}}
                                                        callback={() => {
                                                            setVideo(undefined);
                                                            setAttributes({video: undefined});
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
                                    <ToggleControl
                                        label="Mask"
                                        checked={mask}
                                        onChange={(value) => {
                                            setMask(value);
                                            setAttributes({mask: value});
                                        }}
                                        className={'flex items-center'}
                                        __nextHasNoMarginBottom
                                    />
                                    <ToggleControl
                                        label="Mask Mobile"
                                        checked={maskMobile}
                                        onChange={(value) => {
                                            setMaskMobile(value);
                                            setAttributes({maskMobile: value});
                                        }}
                                        className={'flex items-center'}
                                        __nextHasNoMarginBottom
                                    />
                                </Grid>
                                <Grid columns={2} columnGap={15} rowGap={20}
                                      style={{display: !mask ? 'none' : null}}>
                                    <HStack style={{gridColumn: '1/-1'}}>
                                        <MediaUploadCheck>
                                            <MediaUpload
                                                title={'Mask Image'}
                                                onSelect={(value) => {
                                                    setMaskImage(value);
                                                    setAttributes({maskImage: value});
                                                }}
                                                allowedTypes={['image']}
                                                value={maskImage}
                                                render={({open}) => {
                                                    return <PreviewThumbnail
                                                        image={maskImage || {}}
                                                        callback={() => {
                                                            setMaskImage(undefined);
                                                            setAttributes({maskImage: undefined});
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
                                    </HStack>
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
                                            setAttributes({maskOrigin: value});
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
                                            setAttributes({maskSize: value});
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

                <figure {...blockProps} data-wp-interactive='wpbs/wpbs-figure'>
                    <Media attributes={attributes}/>
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
                <Media attributes={props.attributes}/>
            </figure>
        );
    }
})


