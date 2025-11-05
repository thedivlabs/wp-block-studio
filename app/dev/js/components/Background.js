import React, {useCallback, useMemo, useState} from "react";

import {
    InspectorControls, MediaUpload, MediaUploadCheck,
    PanelColorSettings,
} from "@wordpress/block-editor";
import {
    __experimentalGrid as Grid,
    __experimentalUnitControl as UnitControl, BaseControl, Button, GradientPicker, PanelBody,
    RangeControl,
    SelectControl, TabPanel, ToggleControl
} from "@wordpress/components";

import PreviewThumbnail from "Components/PreviewThumbnail.js";

export const BACKGROUND_ATTRIBUTES = {
    'wpbs-background': {
        type: 'object',
        default: {}
    },
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

export function backgroundPreload(attributes) {

    const {'wpbs-background': settings = {}} = attributes;

    let result = [];

    if (!settings?.eager) {
        return result;
    }

    if (['image', 'featured-image'].includes(settings?.type)) {

        const largeImage = !!settings?.force ? settings?.largeImage ?? false : settings?.largeImage ?? settings?.mobileImage ?? false;
        const mobileImage = !!settings?.force ? settings?.mobileImage ?? false : settings?.mobileImage ?? settings?.largeImage ?? false;

        const largeBreakpoint = attributes['wpbs-breakpoint']?.large ?? 'normal';
        const mobileBreakpoint = attributes['wpbs-breakpoint']?.mobile ?? 'normal';

        const resolution = settings?.resolution ?? 'large';


        if (largeImage) {
            result = [
                ...result,
                {
                    media: largeImage,
                    resolution: resolution,
                    breakpoint: largeBreakpoint,
                    mobile: false
                }
            ]
        }

        if (mobileImage) {
            result = [
                ...result,
                {
                    media: mobileImage,
                    resolution: resolution,
                    breakpoint: mobileBreakpoint,
                    mobile: true
                }
            ]
        }


    }


    return result;
}

export function backgroundCss(attributes, selector) {

    if (!attributes?.['wpbs-background']?.type || !attributes.uniqueId) {
        return '';
    }

    let css = '';
    let desktop = {};
    let mobile = {};

    const breakpoint = WPBS?.settings?.breakpoints[attributes['wpbs-layout']?.breakpoint ?? 'normal'];

    const {'wpbs-background': settings = {}} = attributes;

    if (settings.type === 'featured-image') {
        settings.mobileImage = settings?.mobileImage ?? '%POST_IMG_URL_MOBILE%';
        settings.largeImage = settings?.largeImage ?? '%POST_IMG_URL_LARGE%';
    }

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

        Object.entries(mobile).forEach(([prop, value]) => {
            css += [prop, value].join(':') + ';';
        })

        css += '}}';
    }

    return css.trim();

}

export function BackgroundControls({attributes = {}, callback}) {
    const {'wpbs-background': settings = {}} = attributes;

    const updateSettings = (newValue = {}) => {
        const result = {
            ...settings,
            ...newValue,
        };
        //setAttributes({'wpbs-background': result});
    };

  
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

        const mediaProps = Object.fromEntries(Object.entries({
            className: mediaClass.filter(x => x).join(' '),
            'fetchpriority': settings.eager ? 'high' : null,
        }).filter(x => !!x));

        return <div {...mediaProps}>
            {MediaElement}
        </div>;
    }

    return <div className={bgClass}>
        <Media attributes={attributes}/>
    </div>;
}