import React, {useState, useEffect} from "react"
import {
    __experimentalGrid as Grid,
    BaseControl,
    PanelBody,
    SelectControl,
    ToggleControl,
    Button,
    RangeControl,
    GradientPicker,
} from "@wordpress/components";
import {
    MediaUpload,
    MediaUploadCheck
} from "@wordpress/block-editor";
import PreviewThumbnail from 'Components/PreviewThumbnail';
import Picture from 'Components/picture';

export function BackgroundElement({settings = {}, blockProps}) {

    let repeat;

    switch (settings.repeat) {
        case 'none':
            repeat = 'bg-no-repeat';
            break;
        case 'horizontal':
            repeat = 'bg-repeat-x';
            break;
        case 'vertical':
            repeat = 'bg-repeat-y';
            break;
        default:
            repeat = false;
    }

    const bgClass = [
        'wpbs-background',
        'absolute top-0 left-0 w-full h-full z-0 pointer-events-none',
        settings.blend ? 'mix-blend-' + settings.blend : false
    ].filter(x => x).join(' ');

    const bgStyle = {
        backgroundSize: (settings.scale || '100') + '%',
        opacity: (settings.opacity || '100') + '%'
    }

    const mediaPosition = (posAttr) => {

        let result = '';

        switch (posAttr) {
            case 'top-right':
                result = 'top-0 right-0';
                break;
            case 'bottom-left':
                result = 'bottom-0 left-0'
                break;
            case 'bottom-right':
                result = 'bottom-0 right-0';
                break;
            default:
                result = 'top-0 left-0';
        }

        return result;
    };

    const mediaStyle = () => {

        return {
            width: (settings.width || 100) + '%',
            height: (settings.height || 100) + '%',
        };
    };

    const overlayClass = [
        'wpbs-background__overlay absolute top-0 left-0 w-full h-full z-50'
    ].filter(x => x).join(' ');

    const mediaClass = [
        'wpbs-background__media absolute z-0',
        mediaPosition(settings.position)
    ].filter(x => x).join(' ');

    const videoClass = [
        ...mediaClass,
        'wpbs-background__media--video',
    ].filter(x => x).join(' ');

    const imageClass = [
        ...mediaClass,
        'wpbs-background__media--image',
        'object-cover [&>img]:w-full [&>img]:h-full [&>img]:object-cover'
    ].filter(x => x).join(' ');

    const patternClass = [
        ...mediaClass,
        'wpbs-background__media--pattern',
        'object-cover',
        repeat
    ].filter(x => x).join(' ');

    function Media() {
        if (settings.type === 'image') {
            return <Picture mobile={settings.mobileImage || {}} large={settings.largeImage || {}} settings={{
                force: settings.force || false,
                className: imageClass
            }}/>;
        }

        if (settings.type === 'pattern') {

            const patternMobileSrc = settings.mobileImage ? settings.mobileImage.url || false : 'none';
            const patternLargeSrc = settings.largeImage ? settings.largeImage.url || false : 'none';

            const patternImage = window.matchMedia('(min-width:960px)').matches ? patternLargeSrc : patternMobileSrc;

            return <div className={patternClass} style={{
                backgroundImage: 'url(' + patternImage + ')',
                backgroundSize: settings.scale ? settings.scale + '%' : 'auto'
            }}/>;
        }

        if (settings.type === 'video') {


            let {mobileVideo = {}, largeVideo = {}} = settings;

            if (!largeVideo && !mobileVideo) {
                return false;
            }

            if (!settings.force) {
                mobileVideo = mobileVideo || largeVideo || false;
                largeVideo = largeVideo || mobileVideo || false;
            } else {
                mobileVideo = mobileVideo || {};
                largeVideo = largeVideo || {};
            }

            return <video className={videoClass} muted loop autoPlay={true}>
                <source data-src={(largeVideo.url || '#')} type="video/mp4" data-media={'(min-width:960px)'}/>
                <source data-src={(mobileVideo.url || '#')} type="video/mp4"
                        data-media={'(min-width:240px) and (max-width:959px)'}/>
                <source src={'#'}/>
            </video>
        }
    }

    return <div className={bgClass} style={bgStyle}>
        <Media/>
        <div className={overlayClass} style={{
            background: settings.overlay || 'transparent'
        }}/>
    </div>;
}

export function Background({settings = {}, pushSettings}) {

    settings = Object.assign({}, {
        type: false,
        mobileImage: {},
        largeImage: {},
        mobileVideo: {},
        largeVideo: {},
        eager: false,
        force: false,
        repeat: null,
        blend: null,
        scale: '100',
        opacity: '100',
        overlay: 'light',
    }, settings)

    const [type, setType] = useState(settings.type);
    const [mobileImage, setMobileImage] = useState(settings.mobileImage);
    const [largeImage, setLargeImage] = useState(settings.largeImage);
    const [mobileVideo, setMobileVideo] = useState(settings.mobileVideo);
    const [largeVideo, setLargeVideo] = useState(settings.largeVideo);
    const [eager, setEager] = useState(settings.eager);
    const [force, setForce] = useState(settings.force);
    const [repeat, setRepeat] = useState(settings.repeat);
    const [blend, setBlend] = useState(settings.blend);
    const [scale, setScale] = useState(settings.scale);
    const [opacity, setOpacity] = useState(settings.opacity);
    const [overlay, setOverlay] = useState(settings.overlay);

    const [position, setPosition] = useState(settings.position);
    const [width, setWidth] = useState(settings.width);
    const [height, setHeight] = useState(settings.height);

    function updateSettings(attr, val, callback) {
        callback(val);
        if (pushSettings) {
            pushSettings({background: Object.assign({}, settings, {[attr]: val})});
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
                </Grid>
                <Grid columns={2} columnGap={20} rowGap={30}>
                    <SelectControl
                        label="Repeat"
                        value={repeat}
                        disabled={type !== 'pattern'}
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
                    <SelectControl
                        label="Position"
                        value={position}
                        options={[
                            {label: 'Default', value: null},
                            {label: 'Top Left', value: 'top-left'},
                            {label: 'Top Right', value: 'top-right'},
                            {label: 'Bottom Left', value: 'bottom-left'},
                            {label: 'Bottom Right', value: 'bottom-right'},
                        ]}
                        onChange={(value) => {
                            updateSettings('position', value, setPosition);
                        }}
                        __nextHasNoMarginBottom
                    />
                </Grid>
                <Grid columns={1} columnGap={20} rowGap={20}>
                    <RangeControl
                        __nextHasNoMarginBottom
                        label="Scale"
                        disabled={type !== 'pattern'}
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
                    <RangeControl
                        __nextHasNoMarginBottom
                        label="Width"
                        value={width}
                        onChange={(value) => {
                            updateSettings('width', value, setWidth);
                        }}
                        min={0}
                        max={100}
                        resetFallbackValue={100}
                        allowReset={true}
                    />
                    <RangeControl
                        __nextHasNoMarginBottom
                        label="Height"
                        value={height}
                        onChange={(value) => {
                            updateSettings('height', value, setHeight);
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

export const backgroundAttributes = {
    'background': {
        type: 'object'
    }
}