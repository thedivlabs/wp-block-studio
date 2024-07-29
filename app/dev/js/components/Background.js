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
import Picture from '../../js/components/picture';

export function BackgroundElement({settings = {}}) {
    
    return <div className={[
        'wpbs-background',
        'absolute top-0 left-0 w-full h-full z-0 object-cover !m-0 pointer-events-none'
    ].filter(x => x).join(' ')}>
        <Picture mobile={settings.mobileImage} large={settings.largeImage} settings={{
            className: [
                'wpbs-background__image',
                'absolute top-0 left-0 w-full h-full z-0 object-cover !m-0'
            ].filter(x => x).join(' ')
        }}/>
    </div>;
}

function Background({settings = {}, pushSettings, clientId}) {

    settings = Object.assign({}, {
        type: false,
        mobileImage: {},
        largeImage: {},
        mobileVideo: {},
        largeVideo: {},
        largeMask: {},
        mobileMask: {},
        eager: false,
        repeat: null,
        blend: null,
        scale: '100',
        opacity: '100',
        overlay: 'linear-gradient(0deg, rgba(0,0,0,.3),rgba(0,0,0,.3))',
    }, settings)

    const [type, setType] = useState(settings.type);
    const [mobileImage, setMobileImage] = useState(settings.mobileImage);
    const [largeImage, setLargeImage] = useState(settings.largeImage);
    const [mobileVideo, setMobileVideo] = useState(settings.mobileVideo);
    const [largeVideo, setLargeVideo] = useState(settings.largeVideo);
    const [largeMask, setLargeMask] = useState(settings.largeMask);
    const [mobileMask, setMobileMask] = useState(settings.mobileMask);
    const [eager, setEager] = useState(settings.eager);
    const [repeat, setRepeat] = useState(settings.repeat);
    const [blend, setBlend] = useState(settings.blend);
    const [scale, setScale] = useState(settings.scale);
    const [opacity, setOpacity] = useState(settings.opacity);
    const [overlay, setOverlay] = useState(settings.overlay);

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
            <Grid columns={1} columnGap={20} rowGap={20}>
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
                                allowedTypes={['video']}
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
                                allowedTypes={['video']}
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
                        value={overlay}
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