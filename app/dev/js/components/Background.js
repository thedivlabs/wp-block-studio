import React, {useState} from "react"

import {
    __experimentalGrid as Grid,
    __experimentalUnitControl as UnitControl,
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
import {
    PanelColorSettings,
} from "@wordpress/block-editor";

export function Background({attributes = {}, editor = false}) {

    const {['wpbs-background']: settings} = attributes;

    if (!settings) {
        return false;
    }

    const bgClass = [
        'wpbs-background',
        settings.mask ? 'wpbs-background--mask' : null,
        !settings.eager ? 'lazy' : null,
        'absolute top-0 left-0 w-full h-full z-0 pointer-events-none',
    ].filter(x => x).join(' ');

    const videoClass = [
        'wpbs-background__media--video flex [&_video]:w-full [&_video]:h-full [&_video]:object-cover',
    ].filter(x => x).join(' ');

    const imageClass = [
        'wpbs-background__media--image',
        '[&_img]:w-full [&_img]:h-full',
    ].filter(x => x).join(' ');

    let mediaClass = [
        'wpbs-background__media absolute z-0 overflow-hidden w-full h-full',
    ];

    function Media() {

        let MediaElement;

        if (settings.type === 'image') {
            mediaClass.push(imageClass);
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

            let srcAttr;

            if (editor === true) {
                srcAttr = 'src';
            } else {
                srcAttr = settings.eager ? 'src' : 'data-src';
            }

            MediaElement = <video muted loop autoPlay={true}>
                <source {...{
                    [srcAttr]: largeVideo.url ? largeVideo.url : '#',
                    type: 'video/mp4',
                    'data-media': '(min-width:960px)'
                }}/>
                <source {...{
                    [srcAttr]: mobileVideo.url ? mobileVideo.url : '#',
                    type: 'video/mp4',
                    'data-media': '(min-width:240px) and (max-width:959px)'
                }}/>

                <source src={'#'}/>
            </video>
        }

        return <div className={mediaClass.filter(x => x).join(' ')}>
            {MediaElement}
        </div>;
    }

    return <div className={bgClass}>
        <Media/>
    </div>;
}

export function BackgroundSettings({attributes = {}, pushSettings}) {

    const settings = Object.assign({}, {
        type: undefined,
        mobileImage: undefined,
        largeImage: undefined,
        mobileVideo: undefined,
        largeVideo: undefined,
        maskImageMobile: undefined,
        maskImageLarge: undefined,
        eager: undefined,
        force: undefined,
        fixed: undefined,


        resolution: undefined,
        size: undefined,
        blend: undefined,
        position: undefined,
        origin: undefined,
        maskOrigin: undefined,
        maskSize: undefined,
        repeat: undefined,
        scale: undefined,
        opacity: undefined,
        width: undefined,
        height: undefined,
        overlay: undefined,
        color: undefined,
        mask: undefined,
        fade: undefined,
        maxHeight: undefined,


        resolutionMobile: undefined,
        sizeMobile: undefined,
        blendMobile: undefined,
        positionMobile: undefined,
        originMobile: undefined,
        maskOriginMobile: undefined,
        maskSizeMobile: undefined,
        repeatMobile: undefined,
        scaleMobile: undefined,
        opacityMobile: undefined,
        widthMobile: undefined,
        heightMobile: undefined,
        colorMobile: undefined,
        maskMobile: undefined,
        overlayMobile: undefined,
        fadeMobile: undefined,
        maxHeightMobile: undefined,

    }, attributes['wpbs-background'])

    const [type, setType] = useState(settings.type);
    const [mobileImage, setMobileImage] = useState(settings.mobileImage);
    const [largeImage, setLargeImage] = useState(settings.largeImage);
    const [mobileVideo, setMobileVideo] = useState(settings.mobileVideo);
    const [largeVideo, setLargeVideo] = useState(settings.largeVideo);
    const [maskImageMobile, setMaskImageMobile] = useState(settings.maskImageMobile);
    const [maskImageLarge, setMaskImageLarge] = useState(settings.maskImageLarge);
    const [eager, setEager] = useState(settings.eager);
    const [force, setForce] = useState(settings.force);

    const [color, setColor] = useState(settings.color);
    const [mask, setMask] = useState(settings.mask);
    const [fixed, setFixed] = useState(settings.fixed);
    const [resolution, setResolution] = useState(settings.resolution);
    const [size, setSize] = useState(settings.size);
    const [blend, setBlend] = useState(settings.blend);
    const [position, setPosition] = useState(settings.position);
    const [origin, setOrigin] = useState(settings.origin);
    const [maxHeight, setMaxHeight] = useState(settings.maxHeight);
    const [maskOrigin, setMaskOrigin] = useState(settings.maskOrigin);
    const [maskSize, setMaskSize] = useState(settings.maskSize);
    const [repeat, setRepeat] = useState(settings.repeat);
    const [scale, setScale] = useState(settings.scale);
    const [opacity, setOpacity] = useState(settings.opacity);
    const [width, setWidth] = useState(settings.width);
    const [height, setHeight] = useState(settings.height);
    const [overlay, setOverlay] = useState(settings.overlay);
    const [fade, setFade] = useState(settings.fade);


    const [maxHeightMobile, setMaxHeightMobile] = useState(settings.maxHeightMobile);
    const [colorMobile, setColorMobile] = useState(settings.colorMobile);
    const [maskMobile, setMaskMobile] = useState(settings.maskMobile);
    const [resolutionMobile, setResolutionMobile] = useState(settings.resolutionMobile);
    const [sizeMobile, setSizeMobile] = useState(settings.sizeMobile);
    const [blendMobile, setBlendMobile] = useState(settings.blendMobile);
    const [positionMobile, setPositionMobile] = useState(settings.positionMobile);
    const [originMobile, setOriginMobile] = useState(settings.originMobile);
    const [maskOriginMobile, setMaskOriginMobile] = useState(settings.maskOriginMobile);
    const [maskSizeMobile, setMaskSizeMobile] = useState(settings.maskSizeMobile);
    const [repeatMobile, setRepeatMobile] = useState(settings.repeatMobile);
    const [scaleMobile, setScaleMobile] = useState(settings.scaleMobile);
    const [opacityMobile, setOpacityMobile] = useState(settings.opacityMobile);
    const [widthMobile, setWidthMobile] = useState(settings.widthMobile);
    const [heightMobile, setHeightMobile] = useState(settings.heightMobile);
    const [overlayMobile, setOverlayMobile] = useState(settings.overlayMobile);
    const [fadeMobile, setFadeMobile] = useState(settings.fadeMobile);


    function updateSettings(attr, val, callback) {

        callback(val);
        if (pushSettings) {
            pushSettings({'wpbs-background': Object.assign({}, settings, {[attr]: val})});
        }
    }

    const tabDesktop = <Grid columns={1} columnGap={15} rowGap={20}>
        <Grid columns={2} columnGap={15} rowGap={20}>
            <SelectControl
                __next40pxDefaultSize
                label="Resolution"
                value={resolution}
                options={[
                    {label: 'Default', value: ''},
                    {label: 'Small', value: 'small'},
                    {label: 'Medium', value: 'medium'},
                    {label: 'Large', value: 'large'},
                    {label: 'Extra Large', value: 'xlarge'},]}
                onChange={(value) => {
                    updateSettings('resolution', value, setResolution);
                }}
                __nextHasNoMarginBottom
            />
            <SelectControl
                __next40pxDefaultSize
                label="Size"
                value={size}
                options={[
                    {label: 'Default', value: 'contain'},
                    {label: 'Cover', value: 'cover'},
                    {label: 'Vertical', value: 'auto 100%'},
                    {label: 'Horizontal', value: '100% auto'},
                ]}
                onChange={(value) => {
                    updateSettings('size', value, setSize);
                }}
                __nextHasNoMarginBottom
            />
            <SelectControl
                __next40pxDefaultSize
                label="Blend"
                value={blend}
                options={[
                    {label: 'Default', value: ''},
                    {label: 'Multiply', value: 'multiply'},
                    {label: 'Luminosity', value: 'luminosity'},
                    {label: 'Screen', value: 'screen'},
                    {label: 'Overlay', value: 'overlay'},
                    {label: 'Soft Light', value: 'soft-light'},
                    {label: 'Hard Light', value: 'hard-light'},
                    {label: 'Difference', value: 'difference'},
                    {label: 'Color Burn', value: 'color-burn'},
                ]}
                onChange={(value) => {
                    updateSettings('blend', value, setBlend);
                }}
                __nextHasNoMarginBottom
            />
            <SelectControl
                __next40pxDefaultSize
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
                __next40pxDefaultSize__next40pxDefaultSize
                label="Origin"
                value={origin}
                options={[
                    {label: 'Default', value: undefined},
                    {label: 'Center', value: 'center'},
                    {label: 'Top', value: 'top'},
                    {label: 'Right', value: 'right'},
                    {label: 'Bottom', value: 'bottom'},
                    {label: 'Left', value: 'left'},
                    {label: 'Top Left', value: 'left top'},
                    {label: 'Top Right', value: 'right top'},
                    {label: 'Bottom Left', value: 'left bottom'},
                    {label: 'Bottom Right', value: 'right bottom'},
                ]}
                onChange={(value) => {
                    updateSettings('origin', value, setOrigin);
                }}
                __nextHasNoMarginBottom
                __next40pxDefaultSize
            />
            <UnitControl
                label={'Max Height'}
                value={maxHeight}
                isResetValueOnUnitChange={true}
                onChange={(value) => {
                    updateSettings('maxHeight', value, setMaxHeight);
                }}
                units={[
                    {value: 'vh', label: 'vh', default: 0},
                ]}
                __next40pxDefaultSize
            />
            <SelectControl
                __next40pxDefaultSize
                label="Repeat"
                value={repeat}
                options={[
                    {label: 'None', value: undefined},
                    {label: 'Default', value: 'repeat'},
                    {label: 'Horizontal', value: 'repeat-x'},
                    {label: 'Vertical', value: 'repeat-y'},
                ]}
                onChange={(value) => {
                    updateSettings('repeat', value, setRepeat);
                }}
                __nextHasNoMarginBottom
            />
        </Grid>

        <Grid columns={1} columnGap={15} rowGap={20}>
            <PanelColorSettings
                enableAlpha
                className={'!p-0 !border-0 [&_.components-tools-panel-item]:!m-0'}
                colorSettings={[
                    {
                        slug: 'color',
                        label: 'Color',
                        value: color,
                        onChange: (color) => {
                            updateSettings('color', color, setColor)
                        },
                        isShownByDefault: true
                    }
                ]}
            />
            <RangeControl
                __nextHasNoMarginBottom
                label="Scale"
                value={scale}
                onChange={(value) => {
                    updateSettings('scale', value, setScale);
                }}
                min={0}
                max={200}
                resetFallbackValue={undefined}
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
                resetFallbackValue={undefined}
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
                resetFallbackValue={undefined}
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
                resetFallbackValue={undefined}
                allowReset={true}
            />
            <RangeControl
                __nextHasNoMarginBottom
                label="Fade"
                value={fade}
                onChange={(value) => {
                    updateSettings('fade', value, setFade);
                }}
                min={0}
                max={100}
                resetFallbackValue={undefined}
                allowReset={true}
            />
        </Grid>

        <Grid columns={2} columnGap={15} rowGap={20}
              style={{padding: '1rem 0'}}>
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

        <Grid columns={1} columnGap={15} rowGap={20} style={{display: !mask ? 'none' : null}}>

            <BaseControl label={'Mask Image'} __nextHasNoMarginBottom={true}>
                <MediaUploadCheck>
                    <MediaUpload
                        title={'Mask Desktop'}
                        onSelect={(value) => {
                            updateSettings('maskImageLarge', value, setMaskImageLarge);
                        }}
                        allowedTypes={['image']}
                        value={maskImageLarge}
                        render={({open}) => {
                            return <PreviewThumbnail
                                image={maskImageLarge || {}}
                                callback={() => {
                                    updateSettings('maskImageLarge', undefined, setMaskImageLarge)
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

            <Grid columns={2} columnGap={15} rowGap={20} style={{display: !mask ? 'none' : null}}>
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
                        updateSettings('maskOrigin', value, setMaskOrigin);
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
                        updateSettings('maskSize', value, setMaskSize);
                    }}
                    __nextHasNoMarginBottom
                />
            </Grid>
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
                value={overlay}
                onChange={(value) => {
                    updateSettings('overlay', value, setOverlay);
                }}
            />
        </BaseControl>
    </Grid>

    const tabMobile = <Grid columns={1} columnGap={15} rowGap={20}>
        <Grid columns={2} columnGap={15} rowGap={20}>
            <SelectControl
                __next40pxDefaultSize
                label="Resolution"
                value={resolutionMobile}
                options={[
                    {label: 'Default', value: ''},
                    {label: 'Small', value: 'small'},
                    {label: 'Medium', value: 'medium'},
                    {label: 'Large', value: 'large'},
                    {label: 'Extra Large', value: 'xlarge'},
                ]}
                onChange={(value) => {
                    updateSettings('resolutionMobile', value, setResolutionMobile);
                }}
                __nextHasNoMarginBottom
            />
            <SelectControl
                __next40pxDefaultSize
                label="Size"
                value={sizeMobile}
                options={[
                    {label: 'Default', value: 'contain'},
                    {label: 'Cover', value: 'cover'},
                    {label: 'Vertical', value: 'auto 100%'},
                    {label: 'Horizontal', value: '100% auto'},
                ]}
                onChange={(value) => {
                    updateSettings('sizeMobile', value, setSizeMobile);
                }}
                __nextHasNoMarginBottom
            />
            <SelectControl
                __next40pxDefaultSize
                label="Blend"
                value={blendMobile}
                options={[
                    {label: 'Default', value: ''},
                    {label: 'Multiply', value: 'multiply'},
                    {label: 'Screen', value: 'screen'},
                    {label: 'Overlay', value: 'overlay'},
                    {label: 'Soft Light', value: 'soft-light'},
                ]}
                onChange={(value) => {
                    updateSettings('blendMobile', value, setBlendMobile);
                }}
                __nextHasNoMarginBottom
            />
            <SelectControl
                __next40pxDefaultSize
                label="Position"
                value={positionMobile}
                options={[
                    {label: 'Default', value: ''},
                    {label: 'Center', value: 'center'},
                    {label: 'Top Left', value: 'top-left'},
                    {label: 'Top Right', value: 'top-right'},
                    {label: 'Bottom Left', value: 'bottom-left'},
                    {label: 'Bottom Right', value: 'bottom-right'},
                ]}
                onChange={(value) => {
                    updateSettings('positionMobile', value, setPositionMobile);
                }}
                __nextHasNoMarginBottom
            />
            <SelectControl
                __next40pxDefaultSize
                label="Origin"
                value={originMobile}
                options={[
                    {label: 'Default', value: undefined},
                    {label: 'Center', value: 'center'},
                    {label: 'Top', value: 'top'},
                    {label: 'Right', value: 'right'},
                    {label: 'Bottom', value: 'bottom'},
                    {label: 'Left', value: 'left'},
                    {label: 'Top Left', value: 'left top'},
                    {label: 'Top Right', value: 'right top'},
                    {label: 'Bottom Left', value: 'left bottom'},
                    {label: 'Bottom Right', value: 'right bottom'},
                ]}
                onChange={(value) => {
                    updateSettings('originMobile', value, setOriginMobile);
                }}
                __nextHasNoMarginBottom
            />
            <UnitControl
                label={'Max Height'}
                value={maxHeightMobile}
                isResetValueOnUnitChange={true}
                onChange={(value) => {
                    updateSettings('maxHeightMobile', value, setMaxHeightMobile);
                }}
                units={[
                    {value: 'vh', label: 'vh', default: 0},
                ]}
                __next40pxDefaultSize
            />
            <SelectControl
                __next40pxDefaultSize
                label="Repeat"
                value={repeatMobile}
                options={[
                    {label: 'None', value: undefined},
                    {label: 'Default', value: 'repeat'},
                    {label: 'Horizontal', value: 'repeat-x'},
                    {label: 'Vertical', value: 'repeat-y'},
                ]}
                onChange={(value) => {
                    updateSettings('repeatMobile', value, setRepeatMobile);
                }}
                __nextHasNoMarginBottom
            />
        </Grid>
        <Grid columns={1} columnGap={15} rowGap={20}>
            <PanelColorSettings
                enableAlpha
                className={'!p-0 !border-0 [&_.components-tools-panel-item]:!m-0'}
                colorSettings={[
                    {
                        slug: 'colorMobile',
                        label: 'Color',
                        value: colorMobile,
                        onChange: (color) => updateSettings('colorMobile', color, setColorMobile),
                        isShownByDefault: true
                    }
                ]}
            />
            <RangeControl
                __nextHasNoMarginBottom
                label="Scale"
                value={scaleMobile}
                onChange={(value) => {
                    updateSettings('scaleMobile', value, setScaleMobile);
                }}
                min={0}
                max={200}
                resetFallbackValue={undefined}
                allowReset={true}
            />
            <RangeControl
                __nextHasNoMarginBottom
                label="Opacity"
                value={opacityMobile}
                onChange={(value) => {
                    updateSettings('opacityMobile', value, setOpacityMobile);
                }}
                min={0}
                max={100}
                resetFallbackValue={undefined}
                allowReset={true}
            />
            <RangeControl
                __nextHasNoMarginBottom
                label="Width"
                value={widthMobile}
                onChange={(value) => {
                    updateSettings('widthMobile', value, setWidthMobile);
                }}
                min={0}
                max={100}
                resetFallbackValue={undefined}
                allowReset={true}
            />
            <RangeControl
                __nextHasNoMarginBottom
                label="Height"
                value={heightMobile}
                onChange={(value) => {
                    updateSettings('heightMobile', value, setHeightMobile);
                }}
                min={0}
                max={100}
                resetFallbackValue={undefined}
                allowReset={true}
            />
            <RangeControl
                __nextHasNoMarginBottom
                label="Fade"
                value={fadeMobile}
                onChange={(value) => {
                    updateSettings('fadeMobile', value, setFadeMobile);
                }}
                min={0}
                max={100}
                resetFallbackValue={undefined}
                allowReset={true}
            />
        </Grid>

        <Grid columns={2} columnGap={15} rowGap={20}
              style={{padding: '1rem 0'}}>
            <ToggleControl
                label="Mask"
                checked={maskMobile}
                onChange={(value) => {
                    updateSettings('maskMobile', value, setMaskMobile);
                }}
                className={'flex items-center'}
                __nextHasNoMarginBottom
            />
        </Grid>

        <Grid columns={1} columnGap={15} rowGap={20} style={{display: !maskMobile ? 'none' : null}}>
            <BaseControl label={'Mask Mobile'} __nextHasNoMarginBottom={true} gridColumn={'1/-1'}>
                <MediaUploadCheck>
                    <MediaUpload
                        title={'Mask Image'}
                        onSelect={(value) => {
                            updateSettings('maskImageMobile', value, setMaskImageMobile);
                        }}
                        allowedTypes={['image']}
                        value={maskImageMobile}
                        render={({open}) => {
                            return <PreviewThumbnail
                                image={maskImageMobile || {}}
                                callback={() => {
                                    updateSettings('maskImageMobile', undefined, setMaskImageMobile)
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
            <Grid columns={2} columnGap={15} rowGap={20} style={{display: !maskMobile ? 'none' : null}}>
                <SelectControl
                    __next40pxDefaultSize
                    label="Mask Origin"
                    value={maskOriginMobile}
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
                        updateSettings('maskOriginMobile', value, setMaskOriginMobile);
                    }}
                    __nextHasNoMarginBottom
                />
                <SelectControl
                    __next40pxDefaultSize
                    label="Mask Size"
                    value={maskSizeMobile}
                    options={[
                        {label: 'Default', value: 'contain'},
                        {label: 'Cover', value: 'cover'},
                        {label: 'Vertical', value: 'auto 100%'},
                        {label: 'Horizontal', value: '100% auto'},
                    ]}
                    onChange={(value) => {
                        updateSettings('maskSizeMobile', value, setMaskSizeMobile);
                    }}
                    __nextHasNoMarginBottom
                />
            </Grid>


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
                value={overlayMobile}
                onChange={(value) => {
                    updateSettings('overlayMobile', value, setOverlayMobile);
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
            <Grid columns={1} columnGap={15} rowGap={20}>
                <SelectControl
                    __next40pxDefaultSize
                    label="Type"
                    value={type}
                    options={[
                        {label: 'Select', value: ''},
                        {label: 'Image', value: 'image'},
                        {label: 'Video', value: 'video'},
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
                                        return <PreviewThumbnail
                                            image={mobileImage || {}}
                                            callback={() => {
                                                updateSettings('mobileImage', undefined, setMobileImage)
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
                                        updateSettings('largeImage', value, setLargeImage);
                                    }}
                                    allowedTypes={['image']}
                                    value={largeImage}
                                    render={({open}) => {
                                        return <PreviewThumbnail
                                            image={largeImage || {}}
                                            callback={() => {
                                                updateSettings('largeImage', undefined, setLargeImage)
                                            }}
                                            onClick={open}
                                        />;
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
                                        return <PreviewThumbnail
                                            image={mobileVideo || {}}
                                            callback={() => {
                                                updateSettings('mobileVideo', undefined, setMobileVideo)
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
                                        updateSettings('largeVideo', value, setLargeVideo);
                                    }}
                                    allowedTypes={['video']}
                                    value={largeVideo}
                                    render={({open}) => {
                                        return <PreviewThumbnail
                                            image={largeVideo || {}}
                                            callback={() => {
                                                updateSettings('largeVideo', undefined, setLargeVideo)
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
                            label="Fixed"
                            checked={fixed}
                            onChange={(value) => {
                                updateSettings('fixed', value, setFixed);
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

        </PanelBody>
    )
}

export const BackgroundAttributes = {
    'wpbs-background': {
        type: 'object'
    }
}