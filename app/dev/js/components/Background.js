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

const MemoSelectControl = React.memo(({label, options, prop}) => (
    <SelectControl
        label={label}
        options={options}
        value={settings?.[prop] ?? ''}
        onChange={(newValue) => updateSettings({[prop]: newValue})}
        __next40pxDefaultSize
        __nextHasNoMarginBottom
    />
));

const MemoUnitControl = React.memo(({label, units, prop}) => (
    <UnitControl
        label={label}
        value={settings?.[prop] ?? ''}
        units={units || DIMENSION_UNITS}
        isResetValueOnUnitChange={true}
        onChange={(newValue) => updateSettings({[prop]: newValue})}
        __next40pxDefaultSize
    />
));

const MemoRangeControl = React.memo(({label, prop, step, min, max}) => (
    <RangeControl
        label={label}
        step={step}
        withInputField={true}
        allowReset={true}
        isShiftStepEnabled
        initialPosition={0}
        value={settings?.[prop] ?? ''}
        onChange={(newValue) => updateSettings({[prop]: newValue})}
        __next40pxDefaultSize
        __nextHasNoMarginBottom
        min={min}
        max={max}
    />
));

const MemoToggleControl = React.memo(({label, prop}) => (
    <ToggleControl
        label={label}
        checked={!!settings?.[prop]}
        onChange={(newValue) => updateSettings({[prop]: newValue})}
        className={'flex items-center'}
        __nextHasNoMarginBottom
    />
));

const MemoMediaControl = React.memo(({label, allowedTypes, prop}) => (
    <BaseControl
        label={label}
        __nextHasNoMarginBottom={true}
    >
        <MediaUploadCheck>
            <MediaUpload
                title={label}
                onSelect={(newValue) => updateSettings({
                    [prop]: {
                        type: newValue.type,
                        id: newValue.id,
                        url: newValue.url,
                        alt: newValue?.alt,
                        sizes: newValue?.sizes,
                    }
                })}
                allowedTypes={allowedTypes || ['image']}
                value={settings?.[prop] ?? {}}
                render={({open}) => {
                    return <PreviewThumbnail
                        image={settings?.[prop] ?? {}}
                        callback={(newValue) => updateSettings({
                            [prop]: undefined
                        })}
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

    const size = media?.sizes?.[resolution];

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
            if (settings?.largeImage?.sizes) {
                newValue.largeImage = {
                    ...settings.largeImage,
                    url: settings.largeImage.sizes?.[newValue.resolution || 'large']?.url ?? '#'
                };
            }

            if (settings?.mobileImage?.sizes) {
                newValue.mobileImage = {
                    ...settings.mobileImage,
                    url: settings.mobileImage.sizes?.[newValue.resolution || 'large']?.url ?? '#'
                };
            }
        }

        const result = {
            ...settings,
            ...newValue
        }

        setAttributes({
            'wpbs-background': result,
        });

        setSettings(result);


    }, [settings]);



    const tabDesktop = <Grid columns={1} columnGap={15} rowGap={20}>
        <Grid columns={2} columnGap={15} rowGap={20}>
            <MemoSelectControl
                __next40pxDefaultSize
                label="Resolution"
                prop={'resolution'}
                options={RESOLUTION_OPTIONS}
                __nextHasNoMarginBottom
            />
            <MemoSelectControl
                __next40pxDefaultSize
                label="Size"
                prop={'size'}
                options={SIZE_OPTIONS}
                __nextHasNoMarginBottom
            />
            <MemoSelectControl
                __next40pxDefaultSize
                label="Blend"
                prop={'blend'}
                options={BLEND_OPTIONS}
                __nextHasNoMarginBottom
            />
            <MemoSelectControl
                __next40pxDefaultSize
                label="Position"
                prop={'position'}
                options={POSITION_OPTIONS}
                __nextHasNoMarginBottom
            />
            <MemoSelectControl
                __next40pxDefaultSize
                label="Origin"
                prop={'origin'}
                options={ORIGIN_OPTIONS}
                __nextHasNoMarginBottom
            />
            <MemoUnitControl
                label={'Max Height'}
                prop={'maxHeight'}
                units={[
                    {value: 'vh', label: 'vh', default: 0},
                ]}
            />
            <MemoSelectControl
                __next40pxDefaultSize
                label="Repeat"
                prop={'repeat'}
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
                prop={'scale'}
                min={0}
                max={200}
            />
            <MemoRangeControl
                label="Opacity"
                prop={'opacity'}
                min={0}
                max={100}
            />
            <MemoRangeControl
                label="Width"
                prop={'width'}
                min={0}
                max={100}
            />
            <MemoRangeControl
                label="Height"
                prop={'height'}
                min={0}
                max={100}
            />
            <MemoRangeControl
                label="Fade"
                prop={'fade'}
                min={0}
                max={100}
            />
        </Grid>

        <Grid columns={2} columnGap={15} rowGap={20}
              style={{padding: '1rem 0'}}>
            <MemoToggleControl
                label="Mask"
                prop="mask"
            />
        </Grid>

        <Grid columns={1} columnGap={15} rowGap={20} style={{display: !settings.mask ? 'none' : null}}>


            <MemoMediaControl
                label={'Mask Image'}
                prop={'maskImageLarge'}
                allowedTypes={['image']}
            />

            <Grid columns={2} columnGap={15} rowGap={20} style={{display: !settings.mask ? 'none' : null}}>

                <MemoSelectControl
                    __next40pxDefaultSize
                    label="Mask Origin"
                    prop={'maskOrigin'}
                    options={ORIGIN_OPTIONS}
                    __nextHasNoMarginBottom
                />

                <MemoSelectControl
                    __next40pxDefaultSize
                    label="Mask Size"
                    prop={'maskSize'}
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
                onChange={(value) => updateSettings({'overlay': value})}
            />
        </BaseControl>
    </Grid>

    const tabMobile = <Grid columns={1} columnGap={15} rowGap={20}>
        <Grid columns={2} columnGap={15} rowGap={20}>

            <MemoSelectControl
                __next40pxDefaultSize
                label="Resolution"
                prop={'resolutionMobile'}
                options={RESOLUTION_OPTIONS}
                __nextHasNoMarginBottom
            />
            <MemoSelectControl
                __next40pxDefaultSize
                label="Size"
                prop={'sizeMobile'}
                options={SIZE_OPTIONS}
                __nextHasNoMarginBottom
            />
            <MemoSelectControl
                __next40pxDefaultSize
                label="Blend"
                prop={'blendMobile'}
                options={BLEND_OPTIONS}
                __nextHasNoMarginBottom
            />
            <MemoSelectControl
                __next40pxDefaultSize
                label="Position"
                prop={'positionMobile'}
                options={POSITION_OPTIONS}
                __nextHasNoMarginBottom
            />
            <MemoSelectControl
                __next40pxDefaultSize
                label="Origin"
                prop={'originMobile'}
                options={ORIGIN_OPTIONS}
                __nextHasNoMarginBottom
            />
            <MemoUnitControl
                label={'Max Height'}
                prop={'maxHeightMobile'}
                units={[
                    {value: 'vh', label: 'vh', default: 0},
                ]}
            />
            <MemoSelectControl
                __next40pxDefaultSize
                label="Repeat"
                prop={'repeatMobile'}
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
                        onChange: (color) => updateSettings({'colorMobile': color}),
                        isShownByDefault: true
                    }
                ]}
            />
            <MemoRangeControl
                label="Scale"
                prop={'scaleMobile'}
                min={0}
                max={200}
            />
            <MemoRangeControl
                label="Opacity"
                prop={'opacityMobile'}
                min={0}
                max={100}
            />
            <MemoRangeControl
                label="Width"
                prop={'widthMobile'}
                min={0}
                max={100}
            />
            <MemoRangeControl
                label="Height"
                prop={'heightMobile'}
                min={0}
                max={100}
            />
            <MemoRangeControl
                label="Fade"
                prop={'fadeMobile'}
                min={0}
                max={100}
            />
        </Grid>

        <Grid columns={2} columnGap={15} rowGap={20}
              style={{padding: '1rem 0'}}>
            <MemoToggleControl
                label="Mask"
                prop="maskMobile"
            />
        </Grid>

        <Grid columns={1} columnGap={15} rowGap={20} style={{display: !settings.maskMobile ? 'none' : null}}>


            <MemoMediaControl
                label={'Mask Image'}
                prop={'maskImageMobile'}
                allowedTypes={['image']}
            />

            <Grid columns={2} columnGap={15} rowGap={20} style={{display: !settings.maskMobile ? 'none' : null}}>

                <MemoSelectControl
                    __next40pxDefaultSize
                    label="Mask Origin"
                    prop={'maskOriginMobile'}
                    options={ORIGIN_OPTIONS}
                    __nextHasNoMarginBottom
                />

                <MemoSelectControl
                    __next40pxDefaultSize
                    label="Mask Size"
                    prop={'maskSizeMobile'}
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
                value={settings?.['overlayMobile'] ?? {}}
                onChange={(value) => updateSettings({'overlayMobile': value})}
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
                        prop={'Type'}
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
                                prop={'mobileImage'}
                                allowedTypes={['image']}
                            />
                            <MemoMediaControl
                                label={'Large Image'}
                                prop={'largeImage'}
                                allowedTypes={['image']}
                            />

                        </Grid>
                        <Grid columns={2} columnGap={15} rowGap={20}
                              style={{display: settings.type !== 'video' ? 'none' : null}}>

                            <MemoMediaControl
                                label={'Mobile Video'}
                                prop={'mobileVideo'}
                                allowedTypes={['video']}
                            />

                            <MemoMediaControl
                                label={'Large Video'}
                                prop={'largeVideo'}
                                allowedTypes={['video']}
                            />

                        </Grid>

                        <Grid columns={2} columnGap={15} rowGap={20}
                              style={{padding: '1rem 0'}}>

                            <MemoToggleControl
                                label="Eager"
                                prop="eager"
                            />
                            <MemoToggleControl
                                label="Force"
                                prop="force"
                            />
                            <MemoToggleControl
                                label="Fixed"
                                prop="fixed"
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
        const breakpoint = WPBS?.settings?.breakpoints[attributes['wpbs-layout']?.breakpoint ?? 'normal'];

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
