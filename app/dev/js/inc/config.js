export const IMAGE_BUTTON_STYLE = {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    height: "100px",
    objectFit: "cover",
    gap: "8px",
    flexDirection: "column",
    overflow: "hidden",
    borderRadius: "4px"
}

export const OVERLAY_GRADIENTS = [
    {
        name: "Transparent",
        gradient: "linear-gradient(rgba(0,0,0,0), rgba(0,0,0,0))",
        slug: "transparent",
    },
    {
        name: "Light",
        gradient: "linear-gradient(rgba(0,0,0,.3), rgba(0,0,0,.3))",
        slug: "light",
    },
    {
        name: "Strong",
        gradient: "linear-gradient(rgba(0,0,0,.7), rgba(0,0,0,.7))",
        slug: "strong",
    },
];


export const ELEMENT_TAG_OPTIONS = [
    {label: '<div>', value: ''},
    {label: '<header>', value: 'header'},
    {label: '<main>', value: 'main'},
    {label: '<section>', value: 'section'},
    {label: '<article>', value: 'article'},
    {label: '<aside>', value: 'aside'},
    {label: '<footer>', value: 'footer'},
];

export const ELEMENT_TAG_TEXT_OPTIONS = [
    {label: '<div>', value: ''},
    {label: '<h1>', value: 'h1'},
    {label: '<h2>', value: 'h2'},
    {label: '<h3>', value: 'h3'},
    {label: '<h4>', value: 'h4'},
    {label: '<p>', value: 'p'},
];

export const DISPLAY_OPTIONS = [
    {label: 'Select', value: null},
    {label: 'Flex', value: 'flex'},
    {label: 'Block', value: 'block'},
    {label: 'Inline Flex', value: 'inline-flex'},
    {label: 'Inline Block', value: 'inline-block'},
    {label: 'None', value: 'none'},
];

export const DIRECTION_OPTIONS = [
    {label: 'Select', value: null},
    {label: 'Row', value: 'row'},
    {label: 'Column', value: 'column'},
    {label: 'Row Reverse', value: 'row-reverse'},
    {label: 'Column Reverse', value: 'column-reverse'},
];

export const CONTAINER_OPTIONS = [
    {label: 'Select', value: null},
    {label: 'None', value: 'none'},
    {label: 'Extra Small', value: 'xs'},
    {label: 'Small', value: 'sm'},
    {label: 'Medium', value: 'md'},
    {label: 'Normal', value: 'normal'},
    {label: 'Large', value: 'lg'},
    {label: 'Extra Large', value: 'xl'},
];

export const ALIGN_OPTIONS = [
    {label: 'Select', value: null},
    {label: 'Start', value: 'start'},
    {label: 'Center', value: 'center'},
    {label: 'End', value: 'end'},
    {label: 'Stretch', value: 'stretch'},
];

export const JUSTIFY_OPTIONS = [
    {label: 'Select', value: null},
    {label: 'Start', value: 'flex-start'},
    {label: 'Center', value: 'center'},
    {label: 'End', value: 'flex-end'},
    {label: 'Between', value: 'space-between'},
];

export const WIDTH_OPTIONS = [
    {label: 'Select', value: null},
    {label: 'Auto', value: 'auto'},
    {label: 'Fit', value: 'fit-content'},
    {label: 'Full', value: '100%'},
];

export const HEIGHT_OPTIONS = [
    {label: 'Select', value: null},
    {label: 'Screen', value: 'screen'},
    {label: 'Full Screen', value: 'full-screen'},
    {label: 'Full', value: '100%'},
    {label: 'Auto', value: 'auto'},
    {label: 'Inherit', value: 'inherit'},
];

export const WRAP_OPTIONS = [
    {label: 'Select', value: null},
    {label: 'Wrap', value: 'wrap'},
    {label: 'No Wrap', value: 'no-wrap'},
];

export const POSITION_OPTIONS = [
    {label: 'Select', value: null},
    {label: 'Relative', value: 'relative'},
    {label: 'Absolute', value: 'absolute'},
    {label: 'Sticky', value: 'sticky'},
    {label: 'Fixed', value: 'fixed'},
    {label: 'Fixed Push', value: 'fixed-push'},
    {label: 'Static', value: 'static'},
];

export const OVERFLOW_OPTIONS = [
    {label: 'Select', value: null},
    {label: 'Hidden', value: 'hidden'},
    {label: 'Visible', value: 'visible'},
    {label: 'Scroll', value: 'scroll'},
];

export const SHAPE_OPTIONS = [
    {label: 'Select', value: null},
    {label: 'Square', value: '1/1'},
    {label: 'Video', value: '16/9'},
    {label: 'Photo', value: '10/8'},
    {label: 'Tele', value: '5/6'},
    {label: 'Tall', value: '1/1.4'},
    {label: 'Auto', value: 'auto'},
];

export const ORIGIN_OPTIONS = [
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
];

export const IMAGE_SIZE_OPTIONS = [
    {label: 'Default', value: ''},
    {label: 'Cover', value: 'cover'},
    {label: 'Contain', value: 'contain'},
    {label: 'Vertical', value: 'auto 100%'},
    {label: 'Horizontal', value: '100% auto'},
];

export const DIMENSION_UNITS = [
    {value: 'px', label: 'px', default: 0},
    {value: '%', label: '%', default: 0},
    {value: 'em', label: 'em', default: 0},
    {value: 'rem', label: 'rem', default: 0},
    {value: 'vh', label: 'vh', default: 0},
    {value: 'vw', label: 'vw', default: 0},
    {value: 'ch', label: 'ch', default: 0},
];

export const CONTENT_VISIBILITY_OPTIONS = [
    {label: 'Select', value: null},
    {label: 'Auto', value: 'auto'},
    {label: 'Visible', value: 'visible'},
    {label: 'Hidden', value: 'hidden'},
];

export const BORDER_UNITS = [
    {value: 'px', label: 'px', default: 0},
    {value: '%', label: '%', default: 0},
    {value: 'em', label: 'em', default: 0},
    {value: 'rem', label: 'rem', default: 0},
];


export const REL_OPTIONS = [
    {label: 'None', value: ''},
    {label: 'noopener', value: 'noopener'},
    {label: 'noreferrer', value: 'noreferrer'},
    {label: 'nofollow', value: 'nofollow'},
    {label: 'noopener noreferrer', value: 'noopener noreferrer'},
    {label: 'nofollow noopener', value: 'nofollow noopener'},
];

export const TEXT_ALIGN_OPTIONS = [
    {label: 'Select', value: null},
    {label: 'Left', value: 'left'},
    {label: 'Center', value: 'center'},
    {label: 'Right', value: 'right'},
    {label: 'Inherit', value: 'inherit'},
];

export const TEXT_DECORATION_OPTIONS = [
    {label: 'None', value: 'none'},
    {label: 'Underline', value: 'underline'},
    {label: 'Overline', value: 'overline'},
    {label: 'Line Through', value: 'line-through'},
];

export const DIMENSION_UNITS_TEXT = [
    {value: 'rem', label: 'rem', default: 0},
    {value: 'px', label: 'px', default: 0},
    {value: 'em', label: 'em', default: 0},
];

export const ICON_STYLES = [
    {label: 'Select', value: null},
    {label: 'Solid', value: '900'},
    {label: 'Regular', value: '400'},
    {label: 'Light', value: '300'},
];

export const BLEND_OPTIONS = [
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

export const RESOLUTION_OPTIONS = [
    {label: 'Default', value: ''},
    {label: 'Thumbnail', value: 'thumbnail'},
    {label: 'Mobile', value: 'mobile'},
    {label: 'Small', value: 'small'},
    {label: 'Medium', value: 'medium'},
    {label: 'Large', value: 'large'},
    {label: 'Extra Large', value: 'xlarge'},
    {label: 'Full', value: 'full'},
];

export const REVEAL_ANIMATION_OPTIONS = [
    {label: 'Select', value: null},
    {label: 'Fade', value: 'fade'},
    {label: 'Fade Up', value: 'fade-up'},
    {label: 'Fade Down', value: 'fade-down'},
    {label: 'Fade Left', value: 'fade-left'},
    {label: 'Fade Right', value: 'fade-right'},
    {label: 'Fade Up Right', value: 'fade-up-right'},
    {label: 'Fade Up Left', value: 'fade-up-left'},
    {label: 'Fade Down Right', value: 'fade-down-right'},
    {label: 'Fade Down Left', value: 'fade-down-left'},
    {label: 'Flip Up', value: 'flip-up'},
    {label: 'Flip Down', value: 'flip-down'},
    {label: 'Flip Left', value: 'flip-left'},
    {label: 'Flip Right', value: 'flip-right'},
    {label: 'Slide Up', value: 'slide-up'},
    {label: 'Slide Down', value: 'slide-down'},
    {label: 'Slide Left', value: 'slide-left'},
    {label: 'Slide Right', value: 'slide-right'},
    {label: 'Zoom In', value: 'zoom-in'},
    {label: 'Zoom In Up', value: 'zoom-in-up'},
    {label: 'Zoom In Down', value: 'zoom-in-down'},
    {label: 'Zoom In Left', value: 'zoom-in-left'},
    {label: 'Zoom In Right', value: 'zoom-in-right'},
    {label: 'Zoom Out', value: 'zoom-out'},
    {label: 'Zoom Out Up', value: 'zoom-out-up'},
    {label: 'Zoom Out Down', value: 'zoom-out-down'},
    {label: 'Zoom Out Left', value: 'zoom-out-left'},
    {label: 'Zoom Out Right', value: 'zoom-out-right'},
];

export const REVEAL_EASING_OPTIONS = [
    {label: 'Select', value: null},
    {label: 'Linear', value: 'linear'},
    {label: 'Ease In', value: 'ease-in'},
    {label: 'Ease Out', value: 'ease-out'},
    {label: 'Ease In Out', value: 'ease-in-out'},
    {label: 'Ease In Back', value: 'ease-in-back'},
    {label: 'Ease Out Back', value: 'ease-out-back'},
    {label: 'Ease In Out Back', value: 'ease-in-out-back'},
    {label: 'Ease In Circ', value: 'ease-in-circ'},
    {label: 'Ease Out Circ', value: 'ease-out-circ'},
    {label: 'Ease In Out Circ', value: 'ease-in-out-circ'},
    {label: 'Ease In Cubic', value: 'ease-in-cubic'},
    {label: 'Ease Out Cubic', value: 'ease-out-cubic'},
    {label: 'Ease In Out Cubic', value: 'ease-in-out-cubic'},
    {label: 'Ease In Quad', value: 'ease-in-quad'},
    {label: 'Ease Out Quad', value: 'ease-out-quad'},
    {label: 'Ease In Out Quad', value: 'ease-in-out-quad'},
    {label: 'Ease In Quart', value: 'ease-in-quart'},
    {label: 'Ease Out Quart', value: 'ease-out-quart'},
    {label: 'Ease In Out Quart', value: 'ease-in-out-quart'},
    {label: 'Ease In Quint', value: 'ease-in-quint'},
    {label: 'Ease Out Quint', value: 'ease-out-quint'},
    {label: 'Ease In Out Quint', value: 'ease-in-out-quint'},
];

export const OBJECT_POSITION_OPTIONS = [
    {label: 'Default', value: ''},
    {label: 'Center', value: 'center'},
    {label: 'Top Left', value: 'top-left'},
    {label: 'Top Right', value: 'top-right'},
    {label: 'Bottom Left', value: 'bottom-left'},
    {label: 'Bottom Right', value: 'bottom-right'},
];

export const REPEAT_OPTIONS = [
    {label: 'None', value: ''},
    {label: 'Default', value: 'repeat'},
    {label: 'Horizontal', value: 'repeat-x'},
    {label: 'Vertical', value: 'repeat-y'},
];

export const SWIPER_ARGS_DEFAULT = {
    createElements: false,
    pagination: {
        enabled: true,
        el: '.swiper-pagination',
        type: 'progressbar',
        clickable: true,
        dynamicBullets: false
    },
    passiveListeners: true,
    preventClicks: false,
    //watchSlidesProgress: true,
    updateOnWindowResize: true,
    grabCursor: true,
    uniqueNavElements: true,
    enabled: true,
    slidesPerView: 1,
    slidesPerGroup: 1,
    spaceBetween: 0,
    autoplay: false,
    speed: 300,
    mousewheel: {
        forceToAxis: true
    },
    effect: 'slide',
    freeMode: false,
    centeredSlides: false,
    loop: false,
    rewind: false,
    initialSlide: 0,
    breakpoints: {},
    simulateTouch: false,
    loopAdditionalSlides: 3,

};

export const SWIPER_ARGS_EDITOR = {

    effect: 'slide',
    allowTouchMove: false,         // disables swiping
    simulateTouch: false,          // disables fake mouse events
    keyboard: false,               // disables keyboard control
    mousewheel: false,             // disables mousewheel
    autoplay: false,               // disables autoplay
    loop: false,                   // disables looping
}

export const SWIPER_ARGS_VIEW = {
    ...SWIPER_ARGS_DEFAULT,
    on: {
        afterInit: (swiper) => {
            if (swiper.enabled === false) {
                swiper.el.classList.add('swiper--disabled');
            } else {
                swiper.el.classList.add('swiper--init');
                swiper.el.classList.remove('swiper--disabled');
            }
            if (swiper.slides.length < 2) {
                swiper.disable();
            }
            if (swiper.autoplay.running) {
                swiper.autoplay.pause();
                setTimeout(() => {
                    swiper.autoplay.resume();
                }, 5000);
            }
        },
        paginationUpdate: (swiper, paginationEl) => {

            if (!!swiper?.['isBeginning']) {
                swiper.el.classList.add('swiper--start');
            } else {
                swiper.el.classList.remove('swiper--start');
            }
        },
        resize: (swiper) => {
            if (swiper.enabled === false) {
                swiper.el.classList.add('swiper--disabled');
            } else {
                swiper.el.classList.remove('swiper--disabled');
            }
        },
        transitionEnd: (swiper) => {


            const el = 'el' in swiper ? swiper.el : swiper;

            const pause_videos = el.querySelectorAll('.swiper-slide:not(:only-of-type):not(.swiper-slide-active) video');
            const active_videos = el.querySelectorAll('.swiper-slide.swiper-slide-active video, .swiper-slide:only-of-type video');
            const embed_videos = el.querySelectorAll('iframe');


            [...embed_videos].forEach(function (embed_iframe) {
                embed_iframe.contentWindow.postMessage('{"event":"command","func":"stopVideo","args":""}', '*')
            });

            [...pause_videos].forEach((video) => {
                video.pause();
            });

        }
    }
};

export const layoutFieldsMap = [
    {type: 'select', slug: 'align-items', label: 'Align', options: ALIGN_OPTIONS},
    {type: 'unit', slug: 'flex-basis', label: 'Basis'},
    {type: 'select', slug: 'container', label: 'Container', options: CONTAINER_OPTIONS},
    {type: 'select', slug: 'display', label: 'Display', options: DISPLAY_OPTIONS},
    {type: 'select', slug: 'flex-direction', label: 'Direction', options: DIRECTION_OPTIONS},
    {type: 'unit', slug: 'transition-duration', label: 'Duration', units: [{value: 'ms', label: 'ms', default: 0}],},
    {type: 'select', slug: 'flex-wrap', label: 'Flex Wrap', options: WRAP_OPTIONS},
    {type: 'unit', slug: 'font-size', label: 'Font Size', units: DIMENSION_UNITS_TEXT},
    {type: 'number', slug: 'flex-grow', label: 'Grow'},
    {type: 'select', slug: 'height', label: 'Height', options: HEIGHT_OPTIONS},
    {type: 'unit', slug: 'height-custom', label: 'Height Custom'},
    {type: 'select', slug: 'justify-content', label: 'Justify', options: JUSTIFY_OPTIONS},
    {type: 'unit', slug: 'line-height', label: 'Line Height'},
    {
        type: 'select',
        slug: 'mask-origin', // CSS mask-origin
        label: 'Mask Origin',
        options: ORIGIN_OPTIONS,
    },
    {
        type: 'select',
        slug: 'mask-size', // CSS mask-size
        label: 'Mask Size',
        options: IMAGE_SIZE_OPTIONS,
    },
    {type: 'unit', slug: 'max-height', label: 'Max-Height', units: DIMENSION_UNITS},
    {type: 'unit', slug: 'max-width', label: 'Max-Width'},
    {type: 'select', slug: 'min-height', label: 'Min-Height', options: HEIGHT_OPTIONS},
    {type: 'unit', slug: 'min-height-custom', label: 'Min-Height Custom'},
    {type: 'unit', slug: 'offset-header', label: 'Offset Header'},
    {type: 'number', slug: 'opacity', label: 'Opacity'},
    {type: 'number', slug: 'order', label: 'Order'},
    {type: 'select', slug: 'overflow', label: 'Overflow', options: OVERFLOW_OPTIONS},
    {type: 'select', slug: 'position', label: 'Position', options: POSITION_OPTIONS},
    {type: 'select', slug: 'reveal-anim', label: 'Reveal', options: REVEAL_ANIMATION_OPTIONS},
    {
        type: 'unit',
        slug: 'reveal-duration',
        label: 'Reveal Speed',
        inputProps: {units: [{value: 'ms', label: 'ms', default: 0}]}
    },
    {type: 'number', slug: 'reveal-delay', label: 'Reveal Delay'},
    {type: 'select', slug: 'reveal-easing', label: 'Reveal Easing', options: REVEAL_EASING_OPTIONS},
    {type: 'unit', slug: 'reveal-distance', label: 'Reveal Distance'},
    {type: 'unit', slug: 'reveal-offset', label: 'Reveal Offset'},
    {type: 'select', slug: 'aspect-ratio', label: 'Shape', options: SHAPE_OPTIONS},
    {type: 'number', slug: 'flex-shrink', label: 'Shrink'},
    {type: 'select', slug: 'text-align', label: 'Text Align', options: TEXT_ALIGN_OPTIONS},
    {type: 'select', slug: 'content-visibility', label: 'Visibility', options: CONTENT_VISIBILITY_OPTIONS},
    {type: 'select', slug: 'width', label: 'Width', options: WIDTH_OPTIONS},
    {type: 'unit', slug: 'width-custom', label: 'Width Custom'},
    {type: 'number', slug: 'z-index', label: 'Z Index'},
    {
        type: 'box',
        slug: 'box-position',
        label: 'Box Position',
        full: true,
        sides: ['top', 'right', 'bottom', 'left'],
        inputProps: {units: DIMENSION_UNITS},
    },
    {type: 'box', slug: 'gap', label: 'Gap', sides: ['top', 'left'], full: true},
    {
        type: 'box',
        slug: 'margin',
        label: 'Margin',
        full: true,
        sides: ['top', 'right', 'bottom', 'left'],
        inputProps: {units: DIMENSION_UNITS},
    },
    {type: 'border', slug: 'outline', label: 'Outline', full: true},
    {
        type: 'box',
        slug: 'padding',
        label: 'Padding',
        full: true,
        sides: ['top', 'right', 'bottom', 'left'],
        inputProps: {units: DIMENSION_UNITS},
    },
    {type: 'shadow', slug: 'box-shadow', label: 'Shadow', full: true},
    {type: 'box', slug: 'border-radius', label: 'Radius', full: true},
    {
        type: 'box',
        slug: 'translate',
        label: 'Translate',
        sides: ['top', 'left'],
        inputProps: {
            units: DIMENSION_UNITS,
            min: -1000,
            max: 1000,
        },
        full: true,
    },
    {
        type: 'image',
        slug: 'mask-image', // maps to CSS mask-image
        label: 'Mask Image',
        full: true,
    },
];

export const hoverFieldsMap = [
    {
        type: "color",
        slug: "hover",
        label: "Hover Colors",
        full: true,
        colors: [
            {slug: "background-color", label: "Background"},
            {slug: "color", label: "Text"},
            {slug: "border-color", label: "Border"},
            {slug: "outline-color", label: "Outline"},
            {slug: "text-decoration-color", label: "Decoration"},
        ],
    },

    {
        type: "composite",
        slug: "text-decoration",   // required so Field doesn't early-return
        label: "Text Decoration",
        full: true,

        fields: [
            {
                type: "select",
                slug: "text-decoration-line",
                label: "Type",
                options: [
                    {label: "Select", value: ""},
                    {label: "None", value: "none"},
                    {label: "Underline", value: "underline"},
                    {label: "Overline", value: "overline"},
                    {label: "Line Through", value: "line-through"},
                ],
            },

            {
                type: "select",
                slug: "text-decoration-style",
                label: "Style",
                options: [
                    {label: "Select", value: ""},
                    {label: "Solid", value: "solid"},
                    {label: "Dotted", value: "dotted"},
                    {label: "Dashed", value: "dashed"},
                    {label: "Double", value: "double"},
                    {label: "Wavy", value: "wavy"},
                ],
            },

            {
                type: "unit",
                slug: "text-decoration-thickness",
                label: "Thickness",
                inputProps: {
                    units: ["px", "em", "rem"],
                    min: 0,
                    max: 20,
                    step: 0.5,
                },
            },

            {
                type: "unit",
                slug: "text-underline-offset",
                label: "Offset",
                inputProps: {
                    units: ["px", "em", "rem"],
                    min: -10,
                    max: 50,
                    step: 1,
                },
            },
        ],
    },
    {
        type: "box",
        slug: "gap",
        label: "Gap",
        sides: ['top', 'left'],
        inputProps: {units: DIMENSION_UNITS},
        full: true,
    },
    {
        type: "shadow",
        slug: "box-shadow",
        label: "Shadow",
        full: true,
    },
];

export const backgroundFieldsMap = [

    // --- Core CSS background properties ---
    {
        type: 'select',
        slug: 'resolution', // non-CSS; used internally for imageSet()
        label: 'Resolution',
        options: RESOLUTION_OPTIONS,
    },
    {
        type: 'select',
        slug: 'background-size',
        label: 'Size',
        options: IMAGE_SIZE_OPTIONS,
    },
    {
        type: 'select',
        slug: 'background-blend-mode',
        label: 'Blend Mode',
        options: BLEND_OPTIONS,
    },
    {
        type: 'select',
        slug: 'background-position',
        label: 'Position',
        options: POSITION_OPTIONS,
    },
    {
        type: 'select',
        slug: 'background-origin',
        label: 'Origin',
        options: ORIGIN_OPTIONS,
    },
    {
        type: 'select',
        slug: 'background-repeat',
        label: 'Repeat',
        options: REPEAT_OPTIONS,
    },
    {
        type: 'unit',
        slug: 'max-height', // not background-related CSS; applies to wrapper
        label: 'Max Height',
        units: [{value: 'vh', label: 'vh', default: 0}],
    },

    // --- Visual modifiers (non-standard CSS, custom implementation) ---
    {
        type: 'range',
        slug: 'scale', // handled via transform/scale()
        label: 'Scale',
        min: 0,
        max: 200,
        full: true,
    },
    {
        type: 'range',
        slug: 'opacity', // maps to CSS opacity
        label: 'Opacity',
        min: 0,
        max: 100,
        full: true,
        itemProps: {
            hasValue: () => true
        }
    },
    {
        type: 'range',
        slug: 'width', // applied to media container, not CSS background-width
        label: 'Width',
        min: 0,
        max: 100,
        full: true,
    },
    {
        type: 'range',
        slug: 'height', // same as above
        label: 'Height',
        min: 0,
        max: 100,
        full: true,
    },
    {
        type: 'gradient',
        slug: 'fade',
        label: 'Fade',
        full: true,
    },

    // --- Mask and overlay ---
    {
        type: 'image',
        slug: 'mask-image', // maps to CSS mask-image
        label: 'Mask Image',
        full: true,
    },
    {
        type: 'select',
        slug: 'mask-origin', // CSS mask-origin
        label: 'Mask Origin',
        options: ORIGIN_OPTIONS,
    },
    {
        type: 'select',
        slug: 'mask-size', // CSS mask-size
        label: 'Mask Size',
        options: IMAGE_SIZE_OPTIONS,
    },
];


