import React, {useCallback, useMemo, useState} from "react";

import {
    InspectorControls, MediaUpload, MediaUploadCheck,
    PanelColorSettings,
} from "@wordpress/block-editor";
import {
    __experimentalGrid as Grid,
    __experimentalUnitControl as UnitControl, BaseControl, GradientPicker, PanelBody,
    RangeControl,
    SelectControl, TabPanel, ToggleControl
} from "@wordpress/components";

import PreviewThumbnail from "Components/PreviewThumbnail.js";

export const BACKGROUND_ATTRIBUTES = {
    'wpbs-background': {
        type: 'object',
        default: {}
    },
    'wpbs-preload': {
        type: 'array',
        default: []
    }
};

const SUPPRESS_PROPS = ['type'];

const SPECIAL_PROPS = [
    'type',
    'mobileImage',
    'largeImage',
    'mobileVideo',
    'largeVideo',
    'maskImageMobile',
    'maskImageLarge',
    'resolution',
    'position',
    'positionMobile',
    'eager',
    'force',
    'mask',
    'fixed',
    'size',
    'sizeMobile',
    'opacity',
    'width',
    'height',
    'resolutionMobile',
    'maskMobile',
    'scale',
    'scaleMobile',
    'opacityMobile',
    'widthMobile',
    'heightMobile',
    'fade',
    'fadeMobile',
];

const RESOLUTION_OPTIONS = [
    {label: 'Default', value: ''},
    {label: 'Thumbnail', value: 'thumbnail'},
    {label: 'Small', value: 'small'},
    {label: 'Medium', value: 'medium'},
    {label: 'Large', value: 'large'},
    {label: 'Extra Large', value: 'xlarge'},
    {label: 'Full', value: 'full'},
];

const SIZE_OPTIONS = [
    {label: 'Default', value: 'contain'},
    {label: 'Cover', value: 'cover'},
    {label: 'Vertical', value: 'auto 100%'},
    {label: 'Horizontal', value: '100% auto'},
];

const BLEND_OPTIONS = [
    {label: 'Default', value: ''},
    {label: 'Multiply', value: 'multiply'},
    {label: 'Luminosity', value: 'luminosity'},
    {label: 'Screen', value: 'screen'},
    {label: 'Overlay', value: 'overlay'},
    {label: 'Soft Light', value: 'soft-light'},
    {label: 'Hard Light', value: 'hard-light'},
    {label: 'Difference', value: 'difference'},
    {label: 'Color Burn', value: 'color-burn'},
];

const POSITION_OPTIONS = [
    {label: 'Default', value: ''},
    {label: 'Center', value: 'center'},
    {label: 'Top Left', value: 'top-left'},
    {label: 'Top Right', value: 'top-right'},
    {label: 'Bottom Left', value: 'bottom-left'},
    {label: 'Bottom Right', value: 'bottom-right'},
];

const ORIGIN_OPTIONS = [
    {label: 'Default', value: ''},
    {label: 'Center', value: 'center'},
    {label: 'Top', value: 'top'},
    {label: 'Right', value: 'right'},
    {label: 'Bottom', value: 'bottom'},
    {label: 'Left', value: 'left'},
    {label: 'Top Left', value: 'left top'},
    {label: 'Top Right', value: 'right top'},
    {label: 'Bottom Left', value: 'left bottom'},
    {label: 'Bottom Right', value: 'right bottom'},
];

const REPEAT_OPTIONS = [
    {label: 'None', value: ''},
    {label: 'Default', value: 'repeat'},
    {label: 'Horizontal', value: 'repeat-x'},
    {label: 'Vertical', value: 'repeat-y'},
];

const DIMENSION_UNITS = [
    {value: 'px', label: 'px', default: 0},
    {value: '%', label: '%', default: 0},
    {value: 'em', label: 'em', default: 0},
    {value: 'rem', label: 'rem', default: 0},
    {value: 'vh', label: 'vh', default: 0},
    {value: 'vw', label: 'vw', default: 0},
    {value: 'ch', label: 'ch', default: 0},
]

const MemoSelectControl = React.memo(({label, options, value, callback}) => (
    <SelectControl
        label={label}
        options={options}
        value={value}
        onChange={callback}
        __next40pxDefaultSize
        __nextHasNoMarginBottom
    />
));

const MemoUnitControl = React.memo(({label, units, value, callback}) => (
    <UnitControl
        label={label}
        value={value}
        units={units || DIMENSION_UNITS}
        isResetValueOnUnitChange={true}
        onChange={callback}
        __next40pxDefaultSize
    />
));

const MemoRangeControl = React.memo(({label, value, callback, step, min, max}) => (
    <RangeControl
        label={label}
        step={step}
        withInputField={true}
        allowReset={true}
        isShiftStepEnabled
        initialPosition={0}
        value={value}
        onChange={callback}
        __next40pxDefaultSize
        __nextHasNoMarginBottom
        min={min}
        max={max}
    />
));

const MemoToggleControl = React.memo(({label, value, callback}) => (
    <ToggleControl
        label={label}
        checked={!!value}
        onChange={callback}
        className={'flex items-center'}
        __nextHasNoMarginBottom
    />
));

const MemoMediaControl = React.memo(({label, allowedTypes, value, callback, clear}) => (
    <BaseControl
        label={label}
        __nextHasNoMarginBottom={true}
    >
        <MediaUploadCheck>
            <MediaUpload
                title={label}
                onSelect={callback}
                allowedTypes={allowedTypes || ['image']}
                value={value}
                render={({open}) => {
                    return <PreviewThumbnail
                        image={value}
                        callback={clear}
                        style={{
                            objectFit: 'contain'
                        }}
                        onClick={open}
                    />;
                }}
            />
        </MediaUploadCheck>
    </BaseControl>
));

function parseProp(prop) {

    if (typeof prop !== 'string') {
        return prop;
    }

    return prop
        .replace(/Mobile/g, '')                        // Remove 'Mobile'
        .split(/(?=[A-Z])/)                            // Split before uppercase letters
        .join('-')                                     // Join with dashes
        .replace(/\s+/g, '')                           // Remove spaces
        .toLowerCase();
}

function imageSet(media, resolution) {

    const size = media?.sizes?.[resolution || 'large'];

    const url = size?.url ?? false;

    if (!url) {
        return '';
    }

    const ext = url.endsWith('.png') ? 'image/png' : 'image/jpeg';

    const webp = 'url("' + [url, '.webp'].join('') + '") type("image/webp")';
    const fallback = 'url("' + url + '") type("' + ext + '")';

    return 'image-set(' + [webp, fallback].join(', ') + ')';

}

function parseSpecial(prop, settings) {

    if (!settings?.[prop]) {
        return {};
    }

    const is_featured = settings.type === 'featured-image';
    const parsedProp = parseProp(prop);

    switch (parsedProp) {
        case 'mask-image-large':
        case 'mask-image-mobile':
            return {'--mask-image': 'url(' + (settings[prop]?.url ?? '#') + ')'};
        case 'large-image':
            return {'--image': !is_featured ? imageSet(settings[prop], settings?.resolution ?? 'large') : '%POST_IMG_URL_LARGE%'};
        case 'mobile-image':
            return {'--image': !is_featured ? imageSet(settings[prop], settings?.resolutionMobile ?? settings?.resolution ?? 'large') : '%POST_IMG_URL_MOBILE%'};
        case 'fixed':
            return {'--attachment': 'fixed'}
        case 'scale':
        case 'size':
            return {'--size': !!settings?.scale ? parseFloat(settings?.scale) + '%' : settings?.size ?? null}
        case 'width':
        case 'height':
            return {['--' + parsedProp]: settings[prop] + '%'}
        case 'opacity':
            return {['--' + parsedProp]: parseFloat(settings[prop]) / 100}
        case 'fade':
            return {'--fade': 'linear-gradient(to bottom, #000000ff ' + (settings[prop] + '%') + ', #00000000 100%)'}
        case 'position':

            switch (settings[prop]) {
                case 'top-left':
                    return {
                        '--top': '0px',
                        '--left': '0px',
                        '--bottom': 'auto',
                        '--right': 'auto',
                    }
                case 'top-right':
                    return {
                        '--top': '0px',
                        '--right': '0px',
                        '--bottom': 'auto',
                        '--left': 'auto',
                    }
                case 'bottom-right':
                    return {
                        '--bottom': '0px',
                        '--right': '0px',
                        '--top': 'auto',
                        '--left': 'auto',
                    }
                case 'bottom-left':
                    return {
                        '--bottom': '0px',
                        '--left': '0px',
                        '--top': 'unset',
                        '--right': 'unset',
                    }
                case 'center':
                    return {
                        '--top': '50%',
                        '--left': '50%',
                        '--bottom': 'unset',
                        '--right': 'unset',
                        '--transform': 'translate(-50%,-50%)',
                    }
            }

            break;
        default:
            return {}
    }


}

function getPreloadAssets(attributes) {

    const breakpoint = WPBS?.settings?.breakpoints[attributes['wpbs-layout']?.breakpoint ?? 'normal'];

    let result = [];

    /* if (('largeImage' in newValue || 'mobileImage' in newValue) &&) {
         console.log(newValue);
     }*/

    if (!!attributes?.['wpbs-background']?.eager) {
        console.log(attributes);

        if (['image', 'featured-image'].includes(attributes?.['wpbs-background']?.type)) {
            if (attributes?.['wpbs-background']?.largeImage?.id ?? false) {
                result.push({
                    id: attributes['wpbs-background'].largeImage?.id,
                    breakpoint: breakpoint,
                    resolution: attributes['wpbs-background']?.resolution ?? 'large',
                })
            }

            if (attributes?.['wpbs-background']?.mobileImage?.id ?? false) {
                result.push({
                    id: attributes['wpbs-background'].mobileImage?.id,
                    breakpoint: breakpoint,
                    resolution: attributes['wpbs-background']?.resolution ?? 'large',
                })
            }
        }


    }


    return result;
}

export function backgroundCss(attributes) {

    return useMemo(() => {

        if (!attributes?.['wpbs-background']?.type || !attributes.uniqueId) {
            return '';
        }

        let css = '';
        let desktop = {};
        let mobile = {};

        const uniqueId = attributes?.uniqueId ?? '';
        const selector = '.' + uniqueId.trim().split(' ').join('.');
        const breakpoint = WPBS?.settings?.breakpoints[attributes['wpbs-layout']?.breakpoint ?? 'normal'];

        const {'wpbs-background': settings = {}} = attributes;

        Object.entries(settings).filter(([k, value]) =>
            !SUPPRESS_PROPS.includes(String(k)) &&
            !String(k).toLowerCase().includes('mobile')).forEach(([prop, value]) => {

            if (SPECIAL_PROPS.includes(prop)) {
                desktop = {
                    ...desktop,
                    ...parseSpecial(prop, settings)
                };

            } else {
                desktop['--' + parseProp(prop)] = value;
            }

        });

        Object.entries(settings).filter(([k, value]) =>
            !SUPPRESS_PROPS.includes(String(k)) &&
            String(k).toLowerCase().includes('mobile')).forEach(([prop, value]) => {

            if (SPECIAL_PROPS.includes(prop)) {

                mobile = {
                    ...mobile,
                    ...parseSpecial(prop, settings)
                };

            } else {
                mobile['--' + parseProp(prop)] = value;
            }

        });

        if (Object.keys(desktop).length || settings.type === 'featured-image') {
            css += selector + ' > .wpbs-background {';

            Object.entries(desktop).forEach(([prop, value]) => {

                css += [prop, value].join(':') + ';';
            })

            css += '}';
        }

        if (Object.keys(mobile).length || settings.type === 'featured-image') {
            css += '@media(width < ' + breakpoint + '){' + selector + ' > .wpbs-background {';

            mobile.mobileImage = mobile?.mobileImage ?? '%POST_IMG_URL_MOBILE%';

            Object.entries(mobile).forEach(([prop, value]) => {
                css += [prop, value].join(':') + ';';
            })

            css += '}}';
        }

        return css.trim();
    }, [attributes['wpbs-background'], attributes.uniqueId]);

}

export function BackgroundControls({attributes = {}, setAttributes}) {

    const [settings, setSettings] = useState(attributes['wpbs-background']);

    const updateSettings = useCallback((newValue = {}) => {
        if ('resolution' in newValue) {
            if (attributes['wpbs-background']?.largeImage?.sizes) {
                newValue.largeImage = {
                    ...attributes['wpbs-background'].largeImage,
                    url: attributes['wpbs-background'].largeImage.sizes?.[newValue.resolution || 'large']?.url ?? '#'
                };
            }

            if (attributes['wpbs-background']?.mobileImage?.sizes) {
                newValue.mobileImage = {
                    ...attributes['wpbs-background'].mobileImage,
                    url: attributes['wpbs-background'].mobileImage.sizes?.[newValue.resolution || 'large']?.url ?? '#'
                };
            }
        }

        const preloadAssets = getPreloadAssets(attributes);

        const result = {
            ...attributes['wpbs-background'],
            ...newValue
        }

        setAttributes({
            'wpbs-background': result,
            'wpbs-preload': preloadAssets,
        });

        setSettings(result);


    }, [attributes['wpbs-background'], setAttributes, setSettings]);

    const tabDesktop = <Grid columns={1} columnGap={15} rowGap={20}>
        <Grid columns={2} columnGap={15} rowGap={20}>
            <MemoSelectControl
                __next40pxDefaultSize
                label="Resolution"
                value={settings?.['resolution']}
                callback={(newValue) => updateSettings({'resolution': newValue})}
                options={RESOLUTION_OPTIONS}
                __nextHasNoMarginBottom
            />
            <MemoSelectControl
                __next40pxDefaultSize
                label="Size"
                value={settings?.['size']}
                callback={(newValue) => updateSettings({'size': newValue})}
                options={SIZE_OPTIONS}
                __nextHasNoMarginBottom
            />
            <MemoSelectControl
                __next40pxDefaultSize
                label="Blend"
                value={settings?.['blend']}
                callback={(newValue) => updateSettings({'blend': newValue})}
                options={BLEND_OPTIONS}
                __nextHasNoMarginBottom
            />
            <MemoSelectControl
                __next40pxDefaultSize
                label="Position"
                value={settings?.['position']}
                callback={(newValue) => updateSettings({'position': newValue})}
                options={POSITION_OPTIONS}
                __nextHasNoMarginBottom
            />
            <MemoSelectControl
                __next40pxDefaultSize
                label="Origin"
                value={settings?.['origin']}
                callback={(newValue) => updateSettings({'origin': newValue})}
                options={ORIGIN_OPTIONS}
                __nextHasNoMarginBottom
            />
            <MemoUnitControl
                label={'Max Height'}
                value={settings?.['maxHeight']}
                callback={(newValue) => updateSettings({'maxHeight': newValue})}
                units={[
                    {value: 'vh', label: 'vh', default: 0},
                ]}
            />
            <MemoSelectControl
                __next40pxDefaultSize
                label="Repeat"
                value={settings?.['repeat']}
                callback={(newValue) => updateSettings({'repeat': newValue})}
                options={REPEAT_OPTIONS}
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
                        value: settings?.['color'] ?? '',
                        onChange: (newValue) => updateSettings({color: newValue}),
                        isShownByDefault: true
                    }
                ]}
            />
            <MemoRangeControl
                label="Scale"
                value={settings?.['scale']}
                callback={(newValue) => updateSettings({'scale': newValue})}
                min={0}
                max={200}
            />
            <MemoRangeControl
                label="Opacity"
                value={settings?.['opacity']}
                callback={(newValue) => updateSettings({'opacity': newValue})}
                min={0}
                max={100}
            />
            <MemoRangeControl
                label="Width"
                value={settings?.['width']}
                callback={(newValue) => updateSettings({'width': newValue})}
                min={0}
                max={100}
            />
            <MemoRangeControl
                label="Height"
                value={settings?.['height']}
                callback={(newValue) => updateSettings({'height': newValue})}
                min={0}
                max={100}
            />
            <MemoRangeControl
                label="Fade"
                value={settings?.['fade']}
                callback={(newValue) => updateSettings({'fade': newValue})}
                min={0}
                max={100}
            />
        </Grid>

        <Grid columns={2} columnGap={15} rowGap={20}
              style={{padding: '1rem 0'}}>
            <MemoToggleControl
                label="Mask"
                value={!!settings?.['mask']}
                callback={(newValue) => updateSettings({'mask': newValue})}
            />
        </Grid>

        <Grid columns={1} columnGap={15} rowGap={20} style={{display: !settings.mask ? 'none' : null}}>


            <MemoMediaControl
                label={'Mask Image'}
                prop={'maskImageLarge'}
                allowedTypes={['image']}
                value={settings?.['maskImageLarge']}
                callback={(newValue) => updateSettings({
                    maskImageLarge: {
                        type: newValue.type,
                        id: newValue.id,
                        url: newValue.url,
                        alt: newValue?.alt,
                        sizes: newValue?.sizes,
                    }
                })}
                clear={(newValue) => updateSettings({
                    maskImageLarge: {}
                })}
            />

            <Grid columns={2} columnGap={15} rowGap={20} style={{display: !settings.mask ? 'none' : null}}>

                <MemoSelectControl
                    __next40pxDefaultSize
                    label="Mask Origin"
                    value={settings?.['maskOrigin']}
                    callback={(newValue) => updateSettings({'maskOrigin': newValue})}
                    options={ORIGIN_OPTIONS}
                    __nextHasNoMarginBottom
                />

                <MemoSelectControl
                    __next40pxDefaultSize
                    label="Mask Size"
                    value={settings?.['maskSize']}
                    callback={(newValue) => updateSettings({'maskSize': newValue})}
                    options={SIZE_OPTIONS}
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
                value={settings?.['overlay'] ?? undefined}
                onChange={(newValue) => updateSettings({'overlay': newValue})}
            />
        </BaseControl>
    </Grid>

    const tabMobile = <Grid columns={1} columnGap={15} rowGap={20}>
        <Grid columns={2} columnGap={15} rowGap={20}>
            <MemoSelectControl
                __next40pxDefaultSize
                label="Resolution"
                value={settings?.['resolutionMobile']}
                callback={(newValue) => updateSettings({'resolutionMobile': newValue})}
                options={RESOLUTION_OPTIONS}
                __nextHasNoMarginBottom
            />
            <MemoSelectControl
                __next40pxDefaultSize
                label="Size"
                value={settings?.['sizeMobile']}
                callback={(newValue) => updateSettings({'sizeMobile': newValue})}
                options={SIZE_OPTIONS}
                __nextHasNoMarginBottom
            />
            <MemoSelectControl
                __next40pxDefaultSize
                label="Blend"
                value={settings?.['blendMobile']}
                callback={(newValue) => updateSettings({'blendMobile': newValue})}
                options={BLEND_OPTIONS}
                __nextHasNoMarginBottom
            />
            <MemoSelectControl
                __next40pxDefaultSize
                label="Position"
                value={settings?.['positionMobile']}
                callback={(newValue) => updateSettings({'positionMobile': newValue})}
                options={POSITION_OPTIONS}
                __nextHasNoMarginBottom
            />
            <MemoSelectControl
                __next40pxDefaultSize
                label="Origin"
                value={settings?.['originMobile']}
                callback={(newValue) => updateSettings({'originMobile': newValue})}
                options={ORIGIN_OPTIONS}
                __nextHasNoMarginBottom
            />
            <MemoUnitControl
                label={'Max Height'}
                value={settings?.['maxHeightMobile']}
                callback={(newValue) => updateSettings({'maxHeightMobile': newValue})}
                units={[
                    {value: 'vh', label: 'vh', default: 0},
                ]}
            />
            <MemoSelectControl
                __next40pxDefaultSize
                label="Repeat"
                value={settings?.['repeatMobile']}
                callback={(newValue) => updateSettings({'repeatMobile': newValue})}
                options={REPEAT_OPTIONS}
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
                        value: settings?.['colorMobile'] ?? '',
                        onChange: (newValue) => updateSettings({colorMobile: newValue}),
                        isShownByDefault: true
                    }
                ]}
            />
            <MemoRangeControl
                label="Scale"
                value={settings?.['scaleMobile']}
                callback={(newValue) => updateSettings({'scaleMobile': newValue})}
                min={0}
                max={200}
            />
            <MemoRangeControl
                label="Opacity"
                value={settings?.['opacityMobile']}
                callback={(newValue) => updateSettings({'opacityMobile': newValue})}
                min={0}
                max={100}
            />
            <MemoRangeControl
                label="Width"
                value={settings?.['widthMobile']}
                callback={(newValue) => updateSettings({'widthMobile': newValue})}
                min={0}
                max={100}
            />
            <MemoRangeControl
                label="Height"
                value={settings?.['heightMobile']}
                callback={(newValue) => updateSettings({'heightMobile': newValue})}
                min={0}
                max={100}
            />
            <MemoRangeControl
                label="Fade"
                value={settings?.['fadeMobile']}
                callback={(newValue) => updateSettings({'fadeMobile': newValue})}
                min={0}
                max={100}
            />
        </Grid>

        <Grid columns={2} columnGap={15} rowGap={20}
              style={{padding: '1rem 0'}}>
            <MemoToggleControl
                label="Mask"
                value={!!settings?.['maskMobile']}
                callback={(newValue) => updateSettings({'maskMobile': newValue})}
            />
        </Grid>

        <Grid columns={1} columnGap={15} rowGap={20} style={{display: !settings.mask ? 'none' : null}}>


            <MemoMediaControl
                label={'Mask Image'}
                allowedTypes={['image']}
                value={settings?.['maskImageMobile']}
                callback={(newValue) => updateSettings({
                    maskImageLargeMobile: {
                        type: newValue.type,
                        id: newValue.id,
                        url: newValue.url,
                        alt: newValue?.alt,
                        sizes: newValue?.sizes,
                    }
                })}
                clear={(newValue) => updateSettings({
                    maskImageMobile: {}
                })}
            />

            <Grid columns={2} columnGap={15} rowGap={20} style={{display: !settings.mask ? 'none' : null}}>

                <MemoSelectControl
                    __next40pxDefaultSize
                    label="Mask Origin"
                    value={settings?.['maskOriginMobile']}
                    callback={(newValue) => updateSettings({'maskOriginMobile': newValue})}
                    options={ORIGIN_OPTIONS}
                    __nextHasNoMarginBottom
                />

                <MemoSelectControl
                    __next40pxDefaultSize
                    label="Mask Size"
                    value={settings?.['maskSizeMobile']}
                    callback={(newValue) => updateSettings({'maskSizeMobile': newValue})}
                    options={SIZE_OPTIONS}
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
                value={settings?.['overlayMobile'] ?? undefined}
                onChange={(newValue) => updateSettings({'overlayMobile': newValue})}
            />
        </BaseControl>
    </Grid>

    const tabs = {
        mobile: tabMobile,
        desktop: tabDesktop,
    }

    return (
        <InspectorControls group="styles">
            <PanelBody title={'Background'} initialOpen={!!settings.type}>
                <Grid columns={1} columnGap={15} rowGap={20}>
                    <MemoSelectControl
                        __next40pxDefaultSize
                        label="Type"
                        value={settings?.['type']}
                        callback={(newValue) => updateSettings({'type': newValue})}
                        options={[
                            {label: 'Select', value: ''},
                            {label: 'Image', value: 'image'},
                            {label: 'Featured Image', value: 'featured-image'},
                            {label: 'Video', value: 'video'},
                        ]}
                        __nextHasNoMarginBottom
                    />
                    <Grid columns={1} columnGap={15} rowGap={20} style={{display: !settings.type ? 'none' : null}}>

                        <Grid columns={2} columnGap={15} rowGap={20}
                              style={{display: settings.type !== 'image' && settings.type !== 'featured-image' ? 'none' : null}}>

                            <MemoMediaControl
                                label={'Mobile Image'}
                                value={settings?.['mobileImage']}
                                callback={(newValue) => updateSettings({'mobileImage': newValue})}
                                clear={(newValue) => updateSettings({'mobileImage': {}})}
                                allowedTypes={['image']}
                            />
                            <MemoMediaControl
                                label={'Large Image'}
                                value={settings?.['largeImage']}
                                callback={(newValue) => updateSettings({'largeImage': newValue})}
                                clear={(newValue) => updateSettings({'largeImage': {}})}
                                allowedTypes={['image']}
                            />

                        </Grid>
                        <Grid columns={2} columnGap={15} rowGap={20}
                              style={{display: settings.type !== 'video' ? 'none' : null}}>

                            <MemoMediaControl
                                label={'Mobile Video'}
                                value={settings?.['mobileVideo']}
                                callback={(newValue) => updateSettings({'mobileVideo': newValue})}
                                clear={(newValue) => updateSettings({'mobileVideo': {}})}
                                allowedTypes={['video']}
                            />

                            <MemoMediaControl
                                label={'Large Video'}
                                value={settings?.['largeVideo']}
                                callback={(newValue) => updateSettings({'largeVideo': newValue})}
                                clear={(newValue) => updateSettings({'largeVideo': {}})}
                                allowedTypes={['video']}
                            />

                        </Grid>

                        <Grid columns={2} columnGap={15} rowGap={20}
                              style={{padding: '1rem 0'}}>

                            <MemoToggleControl
                                label="Eager"
                                value={!!settings?.['eager']}
                                callback={(newValue) => updateSettings({'eager': newValue})}
                            />
                            <MemoToggleControl
                                label="Force"
                                value={!!settings?.['force']}
                                callback={(newValue) => updateSettings({'force': newValue})}
                            />
                            <MemoToggleControl
                                label="Fixed"
                                value={!!settings?.['fixed']}
                                callback={(newValue) => updateSettings({'fixed': newValue})}
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
        </InspectorControls>
    )
}

export function BackgroundElement({attributes = {}, editor = false}) {

    const {['wpbs-background']: settings = {}} = attributes;

    if (!settings.type) {
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

    function Media({attributes}) {

        let MediaElement;

        const {['wpbs-background']: settings = {}} = attributes;
        //const breakpoint = WPBS?.settings?.breakpoints[attributes['wpbs-layout']?.breakpoint ?? 'normal'];

        const breakpoint = '%%__BREAKPOINT__' + (attributes['wpbs-layout']?.breakpoint ?? 'normal') + '__%%';

        if (settings.type === 'image' || settings.type === 'featured-image') {
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

            srcAttr = !!editor ? 'src' : 'data-src';

            MediaElement = <video muted loop autoPlay={true}>
                <source {...{
                    [srcAttr]: largeVideo.url ? largeVideo.url : '#',
                    type: 'video/mp4',
                    'data-media': '(min-width:' + breakpoint + ')'
                }}/>
                <source {...{
                    [srcAttr]: mobileVideo.url ? mobileVideo.url : '#',
                    type: 'video/mp4',
                    'data-media': '(width < ' + breakpoint + ')'
                }}/>
            </video>
        }

        return <div className={mediaClass.filter(x => x).join(' ')}>
            {MediaElement}
        </div>;
    }

    return <div className={bgClass}>
        <Media attributes={attributes}/>
    </div>;
}
