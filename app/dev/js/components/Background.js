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
    TabPanel,
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
        settings.blend ? 'bg-inherit' : false,
    ].filter(x => x).join(' ');

    const bgStyle = {
        backgroundSize: (settings.scale || '100') + '%',
    }

    const mediaPosition = (posAttr) => {

        let result = '';

        switch (posAttr) {
            case 'center':
                result = 'top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2';
                break;
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

        let styles = {
            width: (settings.width || 100) + '%',
            height: (settings.height || 100) + '%',
            opacity: (settings.opacity || '100') + '%',
            mixBlendMode: settings.blend,
        };

        if (settings.maskMobile) {
            styles = Object.assign({}, styles, {
                '--mask-image-mobile': 'url(' + (settings.maskMobile).sizes.large.url + ')',
            })
        }

        if (settings.maskLarge || settings.maskMobile) {
            styles = Object.assign({}, styles, {
                maskImage: 'var(--mask-image, none)',
                maskRepeat: 'no-repeat',
                maskSize: settings.maskSize || 'contain',
                maskPosition: settings.maskOrigin,
            })
        }

        Object.keys(styles).forEach((key) => {
            if (!styles[key].length) {
                delete styles[key];
            }
        })

        return styles;
    };

    const overlayClass = [
        'wpbs-background__overlay absolute top-0 left-0 w-full h-full z-50'
    ].filter(x => x).join(' ');

    const videoClass = [
        'wpbs-background__media--video',
    ].filter(x => x).join(' ');

    const imageClass = [
        'wpbs-background__media--image',
        '[&_img]:w-full [&_img]:h-full',
        settings.origin
    ].filter(x => x).join(' ');

    const patternClass = [
        'wpbs-background__media--pattern',
        'object-cover',
        repeat
    ].filter(x => x).join(' ');

    let mediaClass = [
        'wpbs-background__media absolute z-0 overflow-hidden',
        mediaPosition(settings.position),
        !settings.contain ? '[&_img]:object-cover' : '[&_img]:object-contain'
    ];

    function Media() {

        let MediaElement;

        if (settings.type === 'image') {
            mediaClass.push(imageClass);
            MediaElement = <Picture mobile={settings.mobileImage || {}} large={settings.largeImage || {}} settings={{
                force: settings.force || false,
            }}/>;
        }

        if (settings.type === 'pattern') {
            mediaClass.push(patternClass);
            const patternMobileSrc = settings.mobileImage ? settings.mobileImage.url || false : 'none';
            const patternLargeSrc = settings.largeImage ? settings.largeImage.url || false : 'none';

            const patternImage = window.matchMedia('(min-width:960px)').matches ? patternLargeSrc : patternMobileSrc;

            MediaElement = <div style={{
                backgroundImage: 'url(' + patternImage + ')',
                backgroundSize: settings.scale ? settings.scale + '%' : 'auto',
            }}/>;
        }

        if (settings.type === 'video') {

            mediaClass.push(videoClass);

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

            MediaElement = <video muted loop autoPlay={true}>
                <source data-src={(largeVideo.url || '#')} type="video/mp4" data-media={'(min-width:960px)'}/>
                <source data-src={(mobileVideo.url || '#')} type="video/mp4"
                        data-media={'(min-width:240px) and (max-width:959px)'}/>
                <source src={'#'}/>
            </video>
        }

        return <div className={mediaClass.filter(x => x).join(' ')} style={mediaStyle()}>
            {MediaElement}
            <div className={overlayClass} style={{
                background: settings.overlay || 'transparent'
            }}/>
        </div>;
    }

    return <div className={bgClass} style={bgStyle}>
        <Media/>
    </div>;
}

export function Background({settings = {}, pushSettings}) {

    settings = Object.assign({}, {
        type: undefined,
        mobileImage: undefined,
        largeImage: undefined,
        mobileVideo: undefined,
        largeVideo: undefined,
        eager: undefined,
        force: undefined,
        mask: undefined,
        fixed: undefined,

        size: undefined,
        repeat: undefined,
        blend: undefined,
        position: undefined,
        origin: undefined,
        maskMobile: undefined,
        maskLarge: undefined,
        maskOrigin: undefined,
        maskSize: undefined,
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
    const [origin, setOrigin] = useState(settings.origin);
    const [size, setSize] = useState(settings.size);
    const [mask, setMask] = useState(settings.mask);
    const [fixed, setFixed] = useState(settings.fixed);
    const [width, setWidth] = useState(settings.width);
    const [height, setHeight] = useState(settings.height);

    const [maskMobile, setMaskMobile] = useState(settings.maskMobile);
    const [maskLarge, setMaskLarge] = useState(settings.maskLarge);
    const [maskOrigin, setMaskOrigin] = useState(settings.maskOrigin);
    const [maskSize, setMaskSize] = useState(settings.maskSize);

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

    const tabDesktop = <Grid columns={1} columnGap={20} rowGap={20}>
        <Grid columns={2} columnGap={20} rowGap={30}>
            <SelectControl
                label="Size"
                value={repeat}
                disabled={type !== 'pattern'}
                options={[
                    {label: 'Default', value: 'contain'},
                    {label: 'Cover', value: 'cover'},
                    {label: 'Vertical', value: 'auto 100%'},
                    {label: 'Horizontal', value: '100% auto'},
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
                    {label: 'Default', value: ''},
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
                    {label: 'Default', value: ''},
                    {label: 'Center', value: 'center'},
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
            <SelectControl
                label="Origin"
                value={origin}
                disabled={type !== 'image'}
                options={[
                    {label: 'Default', value: undefined},
                    {label: 'Center', value: '[&_img]:object-center'},
                    {label: 'Top', value: '[&_img]:object-top'},
                    {label: 'Right', value: '[&_img]:object-right'},
                    {label: 'Bottom', value: '[&_img]:object-bottom'},
                    {label: 'Left', value: '[&_img]:object-left'},
                    {label: 'Top Left', value: '[&_img]:object-left-top'},
                    {label: 'Top Right', value: '[&_img]:object-right-top'},
                    {label: 'Bottom Left', value: '[&_img]:object-left-bottom'},
                    {label: 'Bottom Right', value: '[&_img]:object-right-bottom'},
                ]}
                onChange={(value) => {
                    updateSettings('origin', value, setOrigin);
                }}
                __nextHasNoMarginBottom
            />
        </Grid>
        <Grid columns={2} columnGap={20} rowGap={30} style={{display: !mask ? 'none' : null}}>


            <SelectControl
                label="Mask Origin"
                value={maskOrigin}
                disabled={!mask}
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
                    updateSettings('maskOrigin', value, setMaskOrigin);
                }}
                __nextHasNoMarginBottom
            />
            <SelectControl
                label="Mask Size"
                value={maskSize}
                disabled={!mask}
                options={[
                    {label: 'Default', value: 'contain'},
                    {label: 'Cover', value: 'cover'},
                    {label: 'Vertical', value: 'auto 100%'},
                    {label: 'Horizontal', value: '100% auto'},
                ]}
                onChange={(value) => {
                    updateSettings('maskSize', value, setMaskSize);
                }}
                __nextHasNoMarginBottom
            />

        </Grid>

        <Grid columns={2} columnGap={20} rowGap={30} style={{display: type !== 'pattern' ? 'none' : null}}>
            <SelectControl
                label="Repeat"
                value={repeat}
                disabled={type !== 'pattern'}
                options={[
                    {label: 'Default', value: undefined},
                    {label: 'None', value: 'none'},
                    {label: 'Horizontal', value: 'horizontal'},
                    {label: 'Vertical', value: 'vertical'},
                ]}
                onChange={(value) => {
                    updateSettings('repeat', value, setRepeat);
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

    const tabMobile = <Grid columns={1} columnGap={20} rowGap={20}>
        <Grid columns={2} columnGap={20} rowGap={30}>
            <SelectControl
                label="Size"
                value={repeat}
                options={[
                    {label: 'Default', value: 'contain'},
                    {label: 'Cover', value: 'cover'},
                    {label: 'Vertical', value: 'auto 100%'},
                    {label: 'Horizontal', value: '100% auto'},
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
                    {label: 'Default', value: ''},
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
                    {label: 'Default', value: ''},
                    {label: 'Center', value: 'center'},
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
            <SelectControl
                label="Origin"
                value={origin}
                disabled={type !== 'image'}
                options={[
                    {label: 'Default', value: undefined},
                    {label: 'Center', value: '[&_img]:object-center'},
                    {label: 'Top', value: '[&_img]:object-top'},
                    {label: 'Right', value: '[&_img]:object-right'},
                    {label: 'Bottom', value: '[&_img]:object-bottom'},
                    {label: 'Left', value: '[&_img]:object-left'},
                    {label: 'Top Left', value: '[&_img]:object-left-top'},
                    {label: 'Top Right', value: '[&_img]:object-right-top'},
                    {label: 'Bottom Left', value: '[&_img]:object-left-bottom'},
                    {label: 'Bottom Right', value: '[&_img]:object-right-bottom'},
                ]}
                onChange={(value) => {
                    updateSettings('origin', value, setOrigin);
                }}
                __nextHasNoMarginBottom
            />
        </Grid>
        <Grid columns={2} columnGap={20} rowGap={30} style={{display: !mask ? 'none' : null}}>


            <SelectControl
                label="Mask Origin"
                value={maskOrigin}
                disabled={!mask}
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
                    updateSettings('maskOrigin', value, setMaskOrigin);
                }}
                __nextHasNoMarginBottom
            />
            <SelectControl
                label="Mask Size"
                value={maskSize}
                disabled={!mask}
                options={[
                    {label: 'Default', value: 'contain'},
                    {label: 'Cover', value: 'cover'},
                    {label: 'Vertical', value: 'auto 100%'},
                    {label: 'Horizontal', value: '100% auto'},
                ]}
                onChange={(value) => {
                    updateSettings('maskSize', value, setMaskSize);
                }}
                __nextHasNoMarginBottom
            />

        </Grid>

        <Grid columns={2} columnGap={20} rowGap={30} style={{display: type !== 'pattern' ? 'none' : null}}>
            <SelectControl
                label="Repeat"
                value={repeat}
                disabled={type !== 'pattern'}
                options={[
                    {label: 'Default', value: undefined},
                    {label: 'None', value: 'none'},
                    {label: 'Horizontal', value: 'horizontal'},
                    {label: 'Vertical', value: 'vertical'},
                ]}
                onChange={(value) => {
                    updateSettings('repeat', value, setRepeat);
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


    const tabs = {
        mobile: tabMobile,
        desktop: tabDesktop,
    }

    return (

        <PanelBody title={'Background'} initialOpen={false}>
            <Grid columns={1} columnGap={20} rowGap={20}>
                <SelectControl
                    label="Type"
                    value={type}
                    options={[
                        {label: 'Default', value: undefined},
                        {label: 'Image', value: 'image'},
                        {label: 'Video', value: 'video'},
                        {label: 'Pattern', value: 'pattern'},
                    ]}
                    onChange={(value) => {
                        updateSettings('type', value, setType);
                    }}
                    __nextHasNoMarginBottom
                />
                <Grid columns={2} columnGap={20} rowGap={20}
                      style={{display: type !== 'image' && type !== 'pattern' ? 'none' : null}}>
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
                                                    updateSettings('largeImage', undefined, setLargeImage)
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
                <Grid columns={2} columnGap={20} rowGap={20} style={{display: type !== 'video' ? 'none' : null}}>


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
                                                    updateSettings('largeVideo', undefined, setLargeVideo)
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

                <Grid columns={2} columnGap={20} rowGap={20} style={{display: !mask ? 'none' : null,}}>
                    <BaseControl label={'Mobile Mask'} __nextHasNoMarginBottom={true}>
                        <MediaUploadCheck>
                            <MediaUpload
                                disabled={!mask}
                                title={'Mobile Mask'}
                                onSelect={(value) => {
                                    updateSettings('maskMobile', value, setMaskMobile);
                                }}
                                allowedTypes={['image']}
                                value={maskMobile}
                                render={({open}) => {
                                    if (maskMobile) {
                                        return <>
                                            <PreviewThumbnail
                                                image={maskMobile || {}}
                                                callback={() => {
                                                    updateSettings('maskMobile', undefined, setMaskMobile)
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
                                disabled={!mask}
                                title={'Large Mask'}
                                onSelect={(value) => {
                                    updateSettings('maskLarge', value, setMaskLarge);
                                }}
                                allowedTypes={['image']}
                                value={maskLarge}
                                render={({open}) => {
                                    if (maskLarge) {
                                        return <>
                                            <PreviewThumbnail
                                                image={maskLarge || {}}
                                                callback={() => {
                                                    updateSettings('maskLarge', undefined, setMaskLarge)
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

                <Grid columns={2} columnGap={15} rowGap={30} style={{padding: '1rem 0'}}>
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
                    <ToggleControl
                        label="fixed"
                        checked={fixed}
                        onChange={(value) => {
                            updateSettings('fixed', value, setFixed);
                        }}
                        className={'flex items-center'}
                        __nextHasNoMarginBottom
                    />
                    <ToggleControl
                        label="Mask"
                        checked={mask}
                        onChange={(value) => {
                            updateSettings('mask', value, setMask);
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

        </PanelBody>
    )
}

export const backgroundAttributes = {
    'background': {
        type: 'object'
    }
}