import React, {useState} from "react"
import {
    __experimentalGrid as Grid,
    BaseControl,
    PanelBody,
    SelectControl,
    ToggleControl,
    Button,
    RangeControl,
    GradientPicker,
    __experimentalHeading as Heading,
    __experimentalToolsPanel as ToolsPanel,
    __experimentalToolsPanelItem as ToolsPanelItem,
} from "@wordpress/components";
import {
    MediaUpload,
    MediaUploadCheck
} from "@wordpress/block-editor";
import PreviewThumbnail from '../../js/components/PreviewThumbnail';

export function BackgroundElement({settings = {}}) {

    const image = settings.largeImage || {};

    return <div className={[
        'wpbs-background',
        'absolute top-0 left-0 w-full h-full z-0 object-cover !m-0 pointer-events-none'
    ].filter(x => x).join(' ')}>
        <img src={image.url || '#'}
             alt={image.alt || ''}
             aria-hidden={'true'}
             className={[
                 'wpbs-background__image',
                 'absolute top-0 left-0 w-full h-full z-0 object-cover !m-0'
             ].filter(x => x).join(' ')}
        />
    </div>;
}

function Background({settings = {}, pushSettings, clientId}) {

    const [type, setType] = useState(settings.type || false);
    const [mobileImage, setMobileImage] = useState(settings.mobileImage || {});
    const [largeImage, setLargeImage] = useState(settings.largeImage || {});
    const [mobileVideo, setMobileVideo] = useState(settings.mobileVideo || {});
    const [largeVideo, setLargeVideo] = useState(settings.largeVideo || {});
    const [largeMask, setLargeMask] = useState(settings.largeMask || {});
    const [mobileMask, setMobileMask] = useState(settings.mobileMask || {});
    const [eager, setEager] = useState(settings.eager || false);
    const [repeat, setRepeat] = useState(settings.repeat || false);
    const [blend, setBlend] = useState(settings.blend || null);
    const [scale, setScale] = useState(settings.scale || '100');
    const [opacity, setOpacity] = useState(settings.opacity || '100');
    const [overlay, setOverlay] = useState(settings.overlay || 'linear-gradient(0deg, rgba(0,0,0,.3),rgba(0,0,0,.3))');

    function updateSettings(attr, val, callback) {
        callback(val);
        if (pushSettings) {
            pushSettings(Object.assign({}, settings, {[attr]: val}));
        }
    }

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


    return (

        <PanelBody title={'Background'} initialOpen={false}>

            <SelectControl
                label="Type"
                value={type}
                options={[
                    {label: 'Default', value: null},
                    {label: 'Image', value: 'image'},
                    {label: 'Video', value: 'video'},
                    {label: 'Pattern', value: 'pattern'},
                ]}
                onChange={(value) => {
                    updateSettings('type', value, setType);
                }}
                __nextHasNoMarginBottom
            />
            <Heading>Images</Heading>
            <Grid columns={1} columnGap={20} rowGap={20}>
                <Grid columns={2} columnGap={20} rowGap={20}>
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
                                                    updateSettings('mobileImage', null, setMobileImage)
                                                }}
                                            /></>;
                                    } else {
                                        return <Button onClick={open} style={buttonStyle}>Choose Image</Button>
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
                                                    updateSettings('largeImage', null, setLargeImage)
                                                }}
                                            /></>;
                                    } else {
                                        return <Button onClick={open} style={buttonStyle}>Choose Image</Button>
                                    }
                                }}
                            />
                        </MediaUploadCheck>
                    </BaseControl>
                    <BaseControl label={'Mobile Video'} __nextHasNoMarginBottom={true}>
                        <MediaUploadCheck>
                            <MediaUpload
                                title={'Mobile Video'}
                                onSelect={(value) => {
                                    updateSettings('mobileVideo', value, setMobileVideo);
                                }}
                                allowedTypes={['mp4']}
                                value={mobileVideo}
                                render={({open}) => {
                                    if (mobileVideo) {
                                        return <>
                                            <PreviewThumbnail
                                                image={mobileVideo || {}}
                                                callback={() => {
                                                    updateSettings('mobileVideo', null, setMobileVideo)
                                                }}
                                            /></>;
                                    } else {
                                        return <Button onClick={open} style={buttonStyle}>Choose Image</Button>
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
                                allowedTypes={['mp4']}
                                value={largeVideo}
                                render={({open}) => {
                                    if (largeVideo) {
                                        return <>
                                            <PreviewThumbnail
                                                image={largeVideo || {}}
                                                callback={() => {
                                                    updateSettings('largeVideo', null, setLargeVideo)
                                                }}
                                            /></>;
                                    } else {
                                        return <Button onClick={open} style={buttonStyle}>Choose Image</Button>
                                    }
                                }}
                            />
                        </MediaUploadCheck>
                    </BaseControl>
                    <BaseControl label={'Mobile Mask'} __nextHasNoMarginBottom={true}>
                        <MediaUploadCheck>
                            <MediaUpload
                                title={'Mobile Mask'}
                                onSelect={(value) => {
                                    updateSettings('mobileMask', value, setMobileMask);
                                }}
                                allowedTypes={['svg', 'image']}
                                value={mobileMask}
                                render={({open}) => {
                                    if (mobileMask) {
                                        return <>
                                            <PreviewThumbnail
                                                image={mobileMask || {}}
                                                callback={() => {
                                                    updateSettings('mobileMask', null, setMobileMask)
                                                }}
                                            /></>;
                                    } else {
                                        return <Button onClick={open} style={buttonStyle}>Choose Image</Button>
                                    }
                                }}
                            />
                        </MediaUploadCheck>
                    </BaseControl>
                    <BaseControl label={'Large Mask'} __nextHasNoMarginBottom={true}>
                        <MediaUploadCheck>
                            <MediaUpload
                                title={'Large Mask'}
                                onSelect={(value) => {
                                    updateSettings('largeMask', value, setLargeMask);
                                }}
                                allowedTypes={['svg', 'image']}
                                value={largeMask}
                                render={({open}) => {
                                    if (largeMask) {
                                        return <>
                                            <PreviewThumbnail
                                                image={largeMask || {}}
                                                callback={() => {
                                                    updateSettings('largeMask', null, setLargeMask)
                                                }}
                                            /></>;
                                    } else {
                                        return <Button onClick={open} style={buttonStyle}>Choose Image</Button>
                                    }
                                }}
                            />
                        </MediaUploadCheck>
                    </BaseControl>
                </Grid>
                <Grid columns={2} columnGap={20} rowGap={30}>
                    <SelectControl
                        label="Repeat"
                        value={repeat}
                        options={[
                            {label: 'Default', value: null},
                            {label: 'None', value: 'none'},
                            {label: 'Horizontal', value: 'horizontal'},
                            {label: 'Vertical', value: 'vertical'},
                        ]}
                        onChange={(value) => {
                            updateSettings('repeat', value, setRepeat);
                        }}
                        __nextHasNoMarginBottom
                    />
                    <SelectControl
                        label="Blend"
                        value={blend}
                        options={[
                            {label: 'Default', value: null},
                            {label: 'Multiply', value: 'multiply'},
                            {label: 'Screen', value: 'screen'},
                            {label: 'Overlay', value: 'overlay'},
                            {label: 'Soft Light', value: 'soft-light'},
                        ]}
                        onChange={(value) => {
                            updateSettings('blend', value, setBlend);
                        }}
                        __nextHasNoMarginBottom
                    />
                </Grid>
                <Grid columns={1} columnGap={20} rowGap={20}>
                    <RangeControl
                        __nextHasNoMarginBottom
                        label="Scale"
                        value={scale}
                        onChange={(value) => {
                            updateSettings('scale', value, setScale);
                        }}
                        min={0}
                        max={200}
                        resetFallbackValue={100}
                        allowReset={true}
                    />
                    <RangeControl
                        __nextHasNoMarginBottom
                        label="Opacity"
                        value={opacity}
                        onChange={(value) => {
                            updateSettings('opacity', value, setOpacity);
                        }}
                        min={0}
                        max={100}
                        resetFallbackValue={100}
                        allowReset={true}
                    />
                </Grid>
                <Grid columns={2} columnGap={20} rowGap={30}>
                    <ToggleControl
                        label="Eager"
                        checked={eager}
                        onChange={(value) => {
                            updateSettings('eager', value, setEager);
                        }}
                        className={'flex items-center'}
                        __nextHasNoMarginBottom
                    />
                </Grid>
                <BaseControl label={'Overlay'} __nextHasNoMarginBottom={true}>
                    <GradientPicker
                        gradients={[]}
                        clearable={false}
                        value={ overlay }
                        onChange={(value) => {
                            updateSettings('overlay', value, setOverlay);
                        }}
                    />
                </BaseControl>
            </Grid>


        </PanelBody>
    )
}

export default Background;