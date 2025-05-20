import React, {useEffect, useMemo, useState} from "react";

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

export const backgroundAttributes = {
    'wpbs-background': {
        type: 'object',
        default: {}
    }
};

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

const suppressProps = ['type'];
const specialProps = [
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

export function backgroundCss(attributes) {

    if (!attributes?.['wpbs-background']?.type || !attributes.uniqueId) {
        return '';
    }

    return useMemo(() => {

        let css = '';
        let desktop = {};
        let mobile = {};

        const uniqueId = attributes?.uniqueId;
        const selector = '.' + uniqueId.trim().split(' ').join('.');
        const breakpoint = WPBS?.settings?.breakpoints[attributes['wpbs-layout']?.breakpoint ?? 'normal'];

        const {'wpbs-background': settings = {}} = attributes;

        Object.entries(settings).filter(([k, value]) =>
            !suppressProps.includes(String(k)) &&
            !String(k).toLowerCase().includes('mobile')).forEach(([prop, value]) => {

            if (specialProps.includes(prop)) {
                desktop = {
                    ...desktop,
                    ...parseSpecial(prop, settings)
                };

            } else {
                desktop['--' + parseProp(prop)] = value;
            }

        });

        Object.entries(settings).filter(([k, value]) =>
            !suppressProps.includes(String(k)) &&
            String(k).toLowerCase().includes('mobile')).forEach(([prop, value]) => {

            if (specialProps.includes(prop)) {

                mobile = {
                    ...mobile,
                    ...parseSpecial(prop, settings)
                };

            } else {
                mobile['--' + parseProp(prop)] = value;
            }

        });

        if (Object.keys(desktop).length) {
            css += selector + ' .wpbs-background {';
            Object.entries(desktop).forEach(([prop, value]) => {

                css += [prop, value].join(':') + ';';
            })

            css += '}';
        }

        if (Object.keys(mobile).length) {
            css += '@media(width < ' + breakpoint + '){' + selector + ' .wpbs-background {';

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

    function updateSettings(newValue = {}) {

        if ('resolution' in newValue) {

            if (settings?.largeImage?.sizes) {
                newValue.largeImage = {
                    ...settings.largeImage,
                    url: settings.largeImage.sizes?.[newValue.resolution || 'large']?.url ?? '#'
                }
            }

            if (settings?.mobileImage?.sizes) {
                newValue.mobileImage = {
                    ...settings.mobileImage,
                    url: settings.mobileImage.sizes?.[newValue.resolution || 'large']?.url ?? '#'
                }
            }


        }

        setSettings((prev) => {
            return {
                ...prev,
                ...newValue
            }
        })

        setAttributes({
            'wpbs-background': {
                ...attributes['wpbs-background'],
                ...newValue
            }
        });

    }

    const tabDesktop = <Grid columns={1} columnGap={15} rowGap={20}>
        <Grid columns={2} columnGap={15} rowGap={20}>
            <SelectControl
                __next40pxDefaultSize
                label="Resolution"
                value={settings?.['resolution'] ?? ''}
                options={[
                    {label: 'Default', value: ''},
                    {label: 'Thumbnail', value: 'thumbnail'},
                    {label: 'Small', value: 'small'},
                    {label: 'Medium', value: 'medium'},
                    {label: 'Large', value: 'large'},
                    {label: 'Extra Large', value: 'xlarge'},
                    {label: 'Full', value: 'full'},
                ]}
                onChange={(value) => {
                    updateSettings({'resolution': value});
                }}
                __nextHasNoMarginBottom
            />
            <SelectControl
                __next40pxDefaultSize
                label="Size"
                value={settings?.['size'] ?? ''}
                options={[
                    {label: 'Default', value: 'contain'},
                    {label: 'Cover', value: 'cover'},
                    {label: 'Vertical', value: 'auto 100%'},
                    {label: 'Horizontal', value: '100% auto'},
                ]}
                onChange={(value) => {
                    updateSettings({'size': value});
                }}
                __nextHasNoMarginBottom
            />
            <SelectControl
                __next40pxDefaultSize
                label="Blend"
                value={settings?.['blend'] ?? ''}
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
                    updateSettings({'blend': value});
                }}
                __nextHasNoMarginBottom
            />
            <SelectControl
                __next40pxDefaultSize
                label="Position"
                value={settings?.['position'] ?? ''}
                options={[
                    {label: 'Default', value: ''},
                    {label: 'Center', value: 'center'},
                    {label: 'Top Left', value: 'top-left'},
                    {label: 'Top Right', value: 'top-right'},
                    {label: 'Bottom Left', value: 'bottom-left'},
                    {label: 'Bottom Right', value: 'bottom-right'},
                ]}
                onChange={(value) => {
                    updateSettings({'position': value});
                }}
                __nextHasNoMarginBottom
            />
            <SelectControl
                __next40pxDefaultSize__next40pxDefaultSize
                label="Origin"
                value={settings?.['origin'] ?? ''}
                options={[
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
                ]}
                onChange={(value) => {
                    updateSettings({'origin': value});
                }}
                __nextHasNoMarginBottom
                __next40pxDefaultSize
            />
            <UnitControl
                label={'Max Height'}
                value={settings?.['maxHeight'] ?? ''}
                isResetValueOnUnitChange={true}
                onChange={(value) => {
                    updateSettings({'maxHeight': value});
                }}
                units={[
                    {value: 'vh', label: 'vh', default: 0},
                ]}
                __next40pxDefaultSize
            />
            <SelectControl
                __next40pxDefaultSize
                label="Repeat"
                value={settings?.['repeat'] ?? ''}
                options={[
                    {label: 'None', value: ''},
                    {label: 'Default', value: 'repeat'},
                    {label: 'Horizontal', value: 'repeat-x'},
                    {label: 'Vertical', value: 'repeat-y'},
                ]}
                onChange={(value) => {
                    updateSettings({'repeat': value});
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
                        value: settings?.['color'] ?? '',
                        onChange: (color) => {
                            updateSettings({'color': color})
                        },
                        isShownByDefault: true
                    }
                ]}
            />
            <RangeControl
                __nextHasNoMarginBottom
                label="Scale"
                value={settings?.['scale'] ?? ''}
                onChange={(value) => {
                    updateSettings({'scale': value});
                }}
                min={0}
                max={200}
                resetFallbackValue={undefined}
                allowReset={true}
            />
            <RangeControl
                __nextHasNoMarginBottom
                label="Opacity"
                value={settings?.['opacity'] ?? ''}
                onChange={(value) => {
                    updateSettings({'opacity': value});
                }}
                min={0}
                max={100}
                resetFallbackValue={undefined}
                allowReset={true}
            />
            <RangeControl
                __nextHasNoMarginBottom
                label="Width"
                value={settings?.['width'] ?? ''}
                onChange={(value) => {
                    updateSettings({'width': value});
                }}
                min={0}
                max={100}
                resetFallbackValue={undefined}
                allowReset={true}
            />
            <RangeControl
                __nextHasNoMarginBottom
                label="Height"
                value={settings?.['height'] ?? ''}
                onChange={(value) => {
                    updateSettings({'height': value});
                }}
                min={0}
                max={100}
                resetFallbackValue={undefined}
                allowReset={true}
            />
            <RangeControl
                __nextHasNoMarginBottom
                label="Fade"
                value={settings?.['fade'] ?? ''}
                onChange={(value) => {
                    updateSettings({'fade': value});
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
                checked={!!settings?.['mask']}
                onChange={(value) => {
                    updateSettings({'mask': value});
                }}
                className={'flex items-center'}
                __nextHasNoMarginBottom
            />
        </Grid>

        <Grid columns={1} columnGap={15} rowGap={20} style={{display: !settings.mask ? 'none' : null}}>

            <BaseControl label={'Mask Image'} __nextHasNoMarginBottom={true}>
                <MediaUploadCheck>
                    <MediaUpload
                        title={'Mask Desktop'}
                        onSelect={(value) => {
                            updateSettings({
                                'maskImageLarge': {
                                    type: value.type,
                                    id: value.id,
                                    url: value.url,
                                }
                            });
                        }}
                        allowedTypes={['image']}
                        value={settings?.['maskImageLarge'] ?? {}}
                        render={({open}) => {
                            return <PreviewThumbnail
                                image={settings['maskImageLarge'] || {}}
                                callback={() => {
                                    updateSettings({'maskImageLarge': undefined})
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

            <Grid columns={2} columnGap={15} rowGap={20} style={{display: !settings.mask ? 'none' : null}}>
                <SelectControl
                    __next40pxDefaultSize
                    label="Mask Origin"
                    value={settings?.['maskOrigin'] ?? ''}
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
                        updateSettings({'maskOrigin': value});
                    }}
                    __nextHasNoMarginBottom
                />
                <SelectControl
                    __next40pxDefaultSize
                    label="Mask Size"
                    value={settings?.['maskSize'] ?? ''}
                    options={[
                        {label: 'Default', value: 'contain'},
                        {label: 'Cover', value: 'cover'},
                        {label: 'Vertical', value: 'auto 100%'},
                        {label: 'Horizontal', value: '100% auto'},
                    ]}
                    onChange={(value) => {
                        updateSettings({'maskSize': value});
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
                value={settings?.['overlay'] ?? 'none'}
                onChange={(value) => {
                    updateSettings({'overlay': value});
                }}
            />
        </BaseControl>
    </Grid>

    const tabMobile = <Grid columns={1} columnGap={15} rowGap={20}>
        <Grid columns={2} columnGap={15} rowGap={20}>
            <SelectControl
                __next40pxDefaultSize
                label="Resolution"
                value={settings?.['resolutionMobile'] ?? ''}
                options={[
                    {label: 'Default', value: ''},
                    {label: 'Small', value: 'small'},
                    {label: 'Medium', value: 'medium'},
                    {label: 'Large', value: 'large'},
                    {label: 'Extra Large', value: 'xlarge'},
                ]}
                onChange={(value) => {
                    updateSettings({'resolutionMobile': value});
                }}
                __nextHasNoMarginBottom
            />
            <SelectControl
                __next40pxDefaultSize
                label="Size"
                value={settings?.['sizeMobile'] ?? ''}
                options={[
                    {label: 'Default', value: 'contain'},
                    {label: 'Cover', value: 'cover'},
                    {label: 'Vertical', value: 'auto 100%'},
                    {label: 'Horizontal', value: '100% auto'},
                ]}
                onChange={(value) => {
                    updateSettings({'sizeMobile': value});
                }}
                __nextHasNoMarginBottom
            />
            <SelectControl
                __next40pxDefaultSize
                label="Blend"
                value={settings?.['blendMobile'] ?? ''}
                options={[
                    {label: 'Default', value: ''},
                    {label: 'Multiply', value: 'multiply'},
                    {label: 'Screen', value: 'screen'},
                    {label: 'Overlay', value: 'overlay'},
                    {label: 'Soft Light', value: 'soft-light'},
                ]}
                onChange={(value) => {
                    updateSettings({'blendMobile': value});
                }}
                __nextHasNoMarginBottom
            />
            <SelectControl
                __next40pxDefaultSize
                label="Position"
                value={settings?.['positionMobile'] ?? ''}
                options={[
                    {label: 'Default', value: ''},
                    {label: 'Center', value: 'center'},
                    {label: 'Top Left', value: 'top-left'},
                    {label: 'Top Right', value: 'top-right'},
                    {label: 'Bottom Left', value: 'bottom-left'},
                    {label: 'Bottom Right', value: 'bottom-right'},
                ]}
                onChange={(value) => {
                    updateSettings({'positionMobile': value});
                }}
                __nextHasNoMarginBottom
            />
            <SelectControl
                __next40pxDefaultSize
                label="Origin"
                value={settings?.['originMobile'] ?? ''}
                options={[
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
                ]}
                onChange={(value) => {
                    updateSettings({'originMobile': value});
                }}
                __nextHasNoMarginBottom
            />
            <UnitControl
                label={'Max Height'}
                value={settings?.['maxHeightMobile'] ?? ''}
                isResetValueOnUnitChange={true}
                onChange={(value) => {
                    updateSettings({'maxHeightMobile': value});
                }}
                units={[
                    {value: 'vh', label: 'vh', default: 0},
                ]}
                __next40pxDefaultSize
            />
            <SelectControl
                __next40pxDefaultSize
                label="Repeat"
                value={settings?.['repeatMobile'] ?? ''}
                options={[
                    {label: 'None', value: ''},
                    {label: 'Default', value: 'repeat'},
                    {label: 'Horizontal', value: 'repeat-x'},
                    {label: 'Vertical', value: 'repeat-y'},
                ]}
                onChange={(value) => {
                    updateSettings({'repeatMobile': value});
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
                        value: settings?.['colorMobile'] ?? '',
                        onChange: (color) => updateSettings({'colorMobile': color}),
                        isShownByDefault: true
                    }
                ]}
            />
            <RangeControl
                __nextHasNoMarginBottom
                label="Scale"
                value={settings?.['scaleMobile'] ?? ''}
                onChange={(value) => {
                    updateSettings({'scaleMobile': value});
                }}
                min={0}
                max={200}
                resetFallbackValue={undefined}
                allowReset={true}
            />
            <RangeControl
                __nextHasNoMarginBottom
                label="Opacity"
                value={settings?.['opacityMobile'] ?? ''}
                onChange={(value) => {
                    updateSettings({'opacityMobile': value});
                }}
                min={0}
                max={100}
                resetFallbackValue={undefined}
                allowReset={true}
            />
            <RangeControl
                __nextHasNoMarginBottom
                label="Width"
                value={settings?.['widthMobile'] ?? ''}
                onChange={(value) => {
                    updateSettings({'widthMobile': value});
                }}
                min={0}
                max={100}
                resetFallbackValue={undefined}
                allowReset={true}
            />
            <RangeControl
                __nextHasNoMarginBottom
                label="Height"
                value={settings?.['heightMobile'] ?? ''}
                onChange={(value) => {
                    updateSettings({'heightMobile': value});
                }}
                min={0}
                max={100}
                resetFallbackValue={undefined}
                allowReset={true}
            />
            <RangeControl
                __nextHasNoMarginBottom
                label="Fade"
                value={settings?.['fadeMobile'] ?? ''}
                onChange={(value) => {
                    updateSettings({'fadeMobile': value});
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
                checked={!!settings?.['maskMobile']}
                onChange={(value) => {
                    updateSettings({'maskMobile': value});
                }}
                className={'flex items-center'}
                __nextHasNoMarginBottom
            />
        </Grid>

        <Grid columns={1} columnGap={15} rowGap={20} style={{display: !settings.maskMobile ? 'none' : null}}>
            <BaseControl label={'Mask Mobile'} __nextHasNoMarginBottom={true} gridColumn={'1/-1'}>
                <MediaUploadCheck>
                    <MediaUpload
                        title={'Mask Image'}
                        onSelect={(value) => {
                            updateSettings({
                                'maskImageMobile': {
                                    type: value.type,
                                    id: value.id,
                                    url: value.url,
                                }
                            });
                        }}
                        allowedTypes={['image']}
                        value={settings?.['maskImageMobile'] ?? {}}
                        render={({open}) => {
                            return <PreviewThumbnail
                                image={settings?.['maskImageMobile'] || {}}
                                callback={() => {
                                    updateSettings({'maskImageMobile': undefined})
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
            <Grid columns={2} columnGap={15} rowGap={20} style={{display: !settings.maskMobile ? 'none' : null}}>
                <SelectControl
                    __next40pxDefaultSize
                    label="Mask Origin"
                    value={settings?.['maskOriginMobile'] ?? ''}
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
                        updateSettings({'maskOriginMobile': value});
                    }}
                    __nextHasNoMarginBottom
                />
                <SelectControl
                    __next40pxDefaultSize
                    label="Mask Size"
                    value={settings?.['maskSizeMobile'] ?? ''}
                    options={[
                        {label: 'Default', value: 'contain'},
                        {label: 'Cover', value: 'cover'},
                        {label: 'Vertical', value: 'auto 100%'},
                        {label: 'Horizontal', value: '100% auto'},
                    ]}
                    onChange={(value) => {
                        updateSettings({'maskSizeMobile': value});
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
                value={settings?.['overlayMobile'] ?? {}}
                onChange={(value) => {
                    updateSettings({'overlayMobile': value});
                }}
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
                    <SelectControl
                        __next40pxDefaultSize
                        label="Type"
                        value={settings.type}
                        options={[
                            {label: 'Select', value: ''},
                            {label: 'Image', value: 'image'},
                            {label: 'Featured Image', value: 'featured-image'},
                            {label: 'Video', value: 'video'},
                        ]}
                        onChange={(value) => {
                            updateSettings({'type': value});
                        }}
                        __nextHasNoMarginBottom
                    />
                    <Grid columns={1} columnGap={15} rowGap={20} style={{display: !settings.type ? 'none' : null}}>

                        <Grid columns={2} columnGap={15} rowGap={20}
                              style={{display: settings.type !== 'image' && settings.type !== 'featured-image' ? 'none' : null}}>
                            <BaseControl label={'Mobile Image'} __nextHasNoMarginBottom={true}>
                                <MediaUploadCheck>
                                    <MediaUpload
                                        title={'Mobile Image'}
                                        onSelect={(value) => {
                                            updateSettings({
                                                'mobileImage': {
                                                    type: value.type,
                                                    id: value.id,
                                                    url: value?.sizes?.[settings?.resolution ?? 'large']?.url ?? value?.url ?? '#',
                                                    sizes: value?.sizes
                                                }
                                            });
                                        }}
                                        allowedTypes={['image']}
                                        value={settings?.['mobileImage'] ?? {}}
                                        render={({open}) => {
                                            return <PreviewThumbnail
                                                image={settings?.['mobileImage'] || {}}
                                                callback={() => {
                                                    updateSettings({'mobileImage': undefined})
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
                                            updateSettings({
                                                'largeImage': {
                                                    type: value.type,
                                                    id: value.id,
                                                    url: value?.sizes?.[settings?.resolution ?? 'large']?.url ?? value?.url ?? '#',
                                                    sizes: value?.sizes
                                                }
                                            });
                                        }}
                                        allowedTypes={['image']}
                                        value={settings?.['largeImage'] ?? {}}
                                        render={({open}) => {
                                            return <PreviewThumbnail
                                                image={settings?.['largeImage'] ?? {}}
                                                callback={() => {
                                                    updateSettings({'largeImage': undefined})
                                                }}
                                                onClick={open}
                                            />;
                                        }}
                                    />
                                </MediaUploadCheck>
                            </BaseControl>


                        </Grid>
                        <Grid columns={2} columnGap={15} rowGap={20}
                              style={{display: settings.type !== 'video' ? 'none' : null}}>

                            <BaseControl label={'Mobile Video'} __nextHasNoMarginBottom={true}>
                                <MediaUploadCheck>
                                    <MediaUpload
                                        title={'Mobile Video'}
                                        onSelect={(value) => {
                                            updateSettings({
                                                'mobileVideo': {
                                                    type: value.type,
                                                    id: value.id,
                                                    url: value.url,
                                                }
                                            });
                                        }}
                                        allowedTypes={['video']}
                                        value={settings?.['mobileVideo'] ?? {}}
                                        render={({open}) => {
                                            return <PreviewThumbnail
                                                image={settings?.['mobileVideo'] ?? {}}
                                                callback={() => {
                                                    updateSettings({'mobileVideo': {}})
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
                                            updateSettings({
                                                'largeVideo': {
                                                    type: value.type,
                                                    id: value.id,
                                                    url: value.url,
                                                }
                                            });
                                        }}
                                        allowedTypes={['video']}
                                        value={settings?.['largeVideo'] ?? {}}
                                        render={({open}) => {
                                            return <PreviewThumbnail
                                                image={settings?.['largeVideo'] ?? {}}
                                                callback={() => {
                                                    updateSettings({'largeVideo': undefined})
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
                                checked={!!settings?.['eager']}
                                onChange={(value) => {
                                    updateSettings({'eager': value});
                                }}
                                className={'flex items-center'}
                                __nextHasNoMarginBottom
                            />
                            <ToggleControl
                                label="Force"
                                checked={!!settings.force}
                                onChange={(value) => {
                                    updateSettings({'force': value});
                                }}
                                className={'flex items-center'}
                                __nextHasNoMarginBottom
                            />
                            <ToggleControl
                                label="Fixed"
                                checked={!!settings.fixed}
                                onChange={(value) => {
                                    updateSettings({'fixed': value});
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
