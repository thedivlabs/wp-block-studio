import React, {useEffect, useState} from "react";

import {
    InspectorControls,
    PanelColorSettings,
} from "@wordpress/block-editor";
import {
    __experimentalToolsPanel as ToolsPanel,
    __experimentalToolsPanelItem as ToolsPanelItem,
} from "@wordpress/components";

import {getCSSFromStyle} from 'Components/Style';
import Outline from 'Components/Outline';
import Display from 'Components/Display';
import FlexDirection from 'Components/FlexDirection';
import Align from 'Components/Align';
import Justify from 'Components/Justify';
import Height from 'Components/Height';
import HeightCustom from 'Components/HeightCustom';
import Container from 'Components/Container';
import FlexWrap from 'Components/FlexWrap';
import Grow from 'Components/Grow';
import Shrink from 'Components/Shrink';
import Position from 'Components/Position';
import ZIndex from 'Components/ZIndex';
import Overflow from 'Components/Overflow';
import Padding from 'Components/Padding';
import Margin from 'Components/Margin';
import Gap from 'Components/Gap';
import Breakpoint from 'Components/Breakpoint';
import Width from 'Components/Width';
import WidthCustom from 'Components/WidthCustom';
import TextAlign from 'Components/TextAlign';
import Shape from 'Components/Shape';
import Translate from 'Components/Translate';
import FontSize from 'Components/FontSize';
import LineHeight from 'Components/LineHeight';
import OutlineOffset from 'Components/OutlineOffset';
import Opacity from 'Components/Opacity';
import BoxPosition from 'Components/BoxPosition';
import Basis from 'Components/Basis';
import Order from 'Components/Order';
import Rounded from 'Components/Rounded';
import OffsetHeader from "Components/OffsetHeader";
import MinHeight from "Components/MinHeight";
import MaxHeight from "Components/MaxHeight";
import MinHeightCustom from "Components/MinHeightCustom";
import MaxHeightCustom from "Components/MaxHeightCustom";
import Mask from "Components/Mask";

export const layoutAttributes = {
    'wpbs-layout': {
        type: 'object',
        default: {}
    }
};

const suppressProps = [];
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
const layoutProps = {

    layout: [
        'offset-header',
        'display',
        'mask-image',
        'mask-origin',
        'mask-size',
        'flex-direction',
        'container',
        'align-items',
        'justify-content',
        'opacity',
        'basis',
        'width',
        'width-custom',
        'max-width',
        'height',
        'height-custom',
        'min-height',
        'min-height-custom',
        'max-height',
        'max-height-custom',
        'flex-wrap',
        'flex-grow',
        'flex-shrink',
        'position',
        'z-index',
        'top',
        'right',
        'bottom',
        'left',
        'overflow',
        'aspect-ratio',
        'order',
        'translate',
        'outline',
    ],

    mobile: [
        'mask-image-mobile',
        'mask-origin-mobile',
        'mask-size-mobile',
        'offset-header-mobile',
        'display-mobile',
        'breakpoint',
        'align-items-mobile',
        'justify-content-mobile',
        'opacity-mobile',
        'basis-mobile',
        'width-mobile',
        'width-custom-mobile',
        'max-width-mobile',
        'height-mobile',
        'height-custom-mobile',
        'min-height-mobile',
        'min-height-custom-mobile',
        'max-height-mobile',
        'max-height-custom-mobile',
        'flex-grow-mobile',
        'flex-shrink-mobile',
        'flex-direction-mobile',
        'aspect-ratio-mobile',
        'position-mobile',
        'z-index-mobile',
        'top-mobile',
        'right-mobile',
        'bottom-mobile',
        'left-mobile',
        'order-mobile',
        'translate-mobile',
        'padding-mobile',
        'margin-mobile',
        'gap-mobile',
        'border-radius-mobile',
        'font-size-mobile',
        'line-height-mobile',
        'text-align-mobile',
        'flex-wrap-mobile',
    ],

    colors: [
        'text-color-hover',
        'background-color-hover',
        'border-color-hover',
        'text-color-mobile',
        'background-color-mobile',
    ],

};

function parseSpecial(prop, attributes) {

    const {'wpbs-layout': settings} = attributes

    if (!settings?.[prop]) {
        return {};
    }

    const value = settings[prop];

    switch (prop) {
        case 'mask-image':
            const imageUrl = value?.sizes?.full?.url || '#';
            return {
                'mask-image': 'url(' + imageUrl + ')',
                'mask-repeat': 'no-repeat',
                'mask-size': (() => {
                    switch (settings?.['mask-size']) {
                        case 'cover':
                            return 'cover';
                        case 'horizontal':
                            return '100% auto';
                        case 'vertical':
                            return 'auto 100%';
                        default:
                            return 'contain';
                    }
                })(),
                'mask-position': settings?.['mask-origin'] || 'center center'
            };

        case 'basis':
            return {'flex-basis': value + '%'}

        case 'height':
        case 'height-custom':
            return {'height': parseSpecial('height', settings?.['height-custom'] ?? settings?.['height'])}

        case 'min-height':
        case 'min-height-custom':
            return {'min-height': parseSpecial('min-height', settings?.['min-height-custom'] ?? settings?.['min-height'])}

        case 'max-height':
        case 'max-height-custom':
            return {'max-height': parseSpecial('max-height', settings?.['max-height-custom'] ?? settings?.['max-height'])}

        case 'width':
        case 'width-custom':
            return {'width': settings?.['width-custom'] ?? settings?.['width'] ?? null}

        case 'translate':

            return {
                'transform': 'translate(' + [
                    getCSSFromStyle(settings?.['translate']?.top || '0px'),
                    getCSSFromStyle(settings?.['translate']?.left || '0px')
                ].join(',') + ')'
            }

        case 'offset-header':
            return {'padding-top': 'calc(' + getCSSFromStyle(attributes?.style?.spacing?.padding?.top || '0px') + ' + var(--wpbs-header-height, 0px)) !important'}
    }


    return {};


}

export function layoutCss(attributes) {

    const [result, setResult] = useState('');

    useEffect(() => {

        if (!attributes?.['wpbs-layout'] || !attributes.uniqueId) {
            return;
        }



        let css = '';
        let desktop = {};
        let mobile = {};

        const uniqueId = attributes?.uniqueId;
        const selector = '.' + uniqueId.trim().split(' ').join('.');
        const breakpoint = WPBS?.settings?.breakpoints[attributes['wpbs-layout']?.breakpoint ?? 'normal'];

        const {'wpbs-layout': settings = {}} = attributes;

        Object.entries(settings).filter(([k, value]) =>
            !suppressProps.includes(String(k)) &&
            !Array.isArray(value) &&
            !['object'].includes(typeof value) &&
            !String(k).toLowerCase().includes('mobile')).forEach(([prop, value]) => {

            if (specialProps.includes(prop)) {

                desktop = {
                    ...desktop,
                    ...parseSpecial(prop, attributes)
                };

            } else {
                desktop[prop] = value;
            }

        });

        Object.entries(settings).filter(([k, value]) =>
            !suppressProps.includes(String(k)) &&
            !specialProps.includes(String(k)) &&
            !Array.isArray(value) &&
            !['object'].includes(typeof value) &&
            String(k).toLowerCase().includes('mobile')).forEach(([prop, value]) => {

            prop = prop.replace('-mobile', '');

            if (specialProps.includes(prop)) {

                mobile = {
                    ...mobile,
                    ...parseSpecial(prop, attributes)
                };

            } else {
                mobile[prop] = value;
            }

        });

        if (Object.keys(desktop).length) {
            css += selector + '{';
            Object.entries(desktop).forEach(([prop, value]) => {

                css += [prop, value].join(':') + ';';
            })

            css += '}';
        }

        if (Object.keys(mobile).length) {
            css += '@media(width < ' + breakpoint + '){' + selector + '{';

            Object.entries(mobile).forEach(([prop, value]) => {
                css += [prop, value].join(':') + ';';
            })

            css += '}}';
        }

        setResult(css);

    }, [attributes['wpbs-layout']]);

    return result;

}

export function LayoutControls({attributes = {}, setAttributes}) {


    //let {'wpbs-layout': settings = {}} = attributes;

    const [settings, setSettings] = useState(attributes['wpbs-layout'] || {});

    const resetAll_layout = () => {
        const result = Object.keys(layoutProps.layout).reduce((o, key) => ({...o, [key]: undefined}), {});
        setSettings(result);
        setAttributes(result);
    };

    const resetAll_mobile = () => {
        const result = Object.keys(layoutProps.mobile).reduce((o, key) => ({...o, [key]: undefined}), {});
        setAttributes(result);
    };

    function updateProp(newValue) {

        setAttributes({
            'wpbs-layout': {
                ...attributes['wpbs-layout'],
                ...newValue
            }
        });

        setSettings((prevState) => {
            return {
                ...prevState,
                ...newValue
            }
        });

    }

    return <InspectorControls group="styles">


        <ToolsPanel label={'Layout Large'} resetAll={resetAll_layout} columnGap={15} rowGap={20}>
            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!settings?.['display']}
                label={'Display'}
                onDeselect={() => updateProp({'display': undefined})}
            >
                <Display defaultValue={settings?.['display']} callback={(newValue) => {
                    updateProp({'display': newValue});
                }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!settings?.['flex-direction']}
                label={'Direction'}
                onDeselect={() => updateProp({'flex-direction': undefined})}
            >
                <FlexDirection defaultValue={settings?.['flex-direction']}
                               callback={(newValue) => {
                                   updateProp({'flex-direction': newValue});
                               }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!settings?.['container']}
                label={'Container'}
                onDeselect={() => updateProp({['container']: undefined})}
            >
                <Container defaultValue={settings?.['container']} callback={(newValue) => {
                    updateProp({'container': newValue});
                }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!settings?.['align-items']}
                label={'Align'}
                onDeselect={() => updateProp({['align-items']: undefined})}
            >
                <Align defaultValue={settings?.['align-items']} callback={(newValue) => {
                    updateProp({'align-items': newValue});
                }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!settings?.['justify-content']}
                label={'Justify'}
                onDeselect={() => updateProp({['justify-content']: undefined})}
            >
                <Justify defaultValue={settings?.['justify-content']} callback={(newValue) => {
                    updateProp({'justify-content': newValue});
                }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 2'}}
                hasValue={() => !!settings?.['opacity']}
                label={'Opacity'}
                onDeselect={() => updateProp({['opacity']: undefined})}
            >
                <Opacity defaultValue={settings?.['opacity']} callback={(newValue) => {
                    updateProp({'opacity': newValue});
                }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 2'}}
                hasValue={() => !!settings?.['basis']}
                label={'Basis'}
                onDeselect={() => updateProp({['basis']: undefined})}
            >
                <Basis defaultValue={settings?.['basis']} callback={(newValue) => {
                    updateProp({'basis': newValue});
                }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!settings?.['width']}
                label={'Width'}
                onDeselect={() => updateProp({['width']: undefined})}
            >
                <Width defaultValue={settings?.['width']} callback={(newValue) => {
                    updateProp({'width': newValue});
                }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!settings?.['width-custom']}
                label={'Width Custom'}
                onDeselect={() => updateProp({['width-custom']: undefined})}
            >
                <WidthCustom defaultValue={settings?.['width-custom']}
                             callback={(newValue) => {
                                 updateProp({'width-custom': newValue});
                             }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!attributes['wpbs-layout']?.['max-width']}
                label={'Max-Width'}
                onDeselect={() => {
                    updateProp({['max-width']: undefined})
                }}
            >
                <WidthCustom label={'Max-Width'} defaultValue={attributes['wpbs-layout']?.['max-width']}
                             callback={(newValue) => {
                                 updateProp({'max-width': newValue});
                             }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!settings?.['height']}
                label={'Height'}
                onDeselect={() => updateProp({'height': undefined})}
            >
                <Height defaultValue={settings?.['height']} callback={(newValue) => {
                    updateProp({'height': newValue});
                }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!settings?.['height-custom']}
                label={'Height Custom'}
                onDeselect={() => updateProp({['height-custom']: undefined})}
            >
                <HeightCustom defaultValue={settings?.['height-custom']}
                              callback={(newValue) => {
                                  updateProp({'height-custom': newValue});
                              }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!settings?.['min-height']}
                label={'Min-Height'}
                onDeselect={() => updateProp({['min-height']: undefined})}
            >
                <MinHeight defaultValue={settings?.['min-height']} callback={(newValue) => {
                    updateProp({'min-height': newValue});
                }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!settings?.['min-height-custom']}
                label={'Min-Height Custom'}
                onDeselect={() => updateProp({['min-height-custom']: undefined})}
            >
                <MinHeightCustom defaultValue={settings?.['min-height-custom']}
                                 callback={(newValue) => {
                                     updateProp({'min-height-custom': newValue});
                                 }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!settings?.['max-height']}
                label={'Max-Height'}
                onDeselect={() => updateProp({['max-height']: undefined})}
            >
                <MaxHeight defaultValue={settings?.['max-height']} callback={(newValue) => {
                    updateProp({'max-height': newValue});
                }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!settings?.['max-height-custom']}
                label={'Max-Height Custom'}
                onDeselect={() => updateProp({['max-height-custom']: undefined})}
            >
                <MaxHeightCustom defaultValue={settings?.['max-height-custom']}
                                 callback={(newValue) => {
                                     updateProp({'max-height-custom': newValue});
                                 }}/>
            </ToolsPanelItem>

            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!settings?.['flex-wrap']}
                label={'Flex Wrap'}
                onDeselect={() => updateProp({['flex-wrap']: undefined})}
            >
                <FlexWrap defaultValue={settings?.['flex-wrap']} callback={(newValue) => {
                    updateProp({'flex-wrap': newValue});
                }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!settings?.['flex-grow']}
                label={'Grow'}
                onDeselect={() => updateProp({['flex-grow']: undefined})}
            >
                <Grow defaultValue={settings?.['flex-grow']} callback={(newValue) => {
                    updateProp({'flex-grow': newValue});
                }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!settings?.['flex-shrink']}
                label={'Shrink'}
                onDeselect={() => updateProp({['flex-shrink']: undefined})}
            >
                <Shrink defaultValue={settings?.['flex-shrink']} callback={(newValue) => {
                    updateProp({'flex-shrink': newValue});
                }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!settings?.['position']}
                label={'Position'}
                onDeselect={() => updateProp({['position']: undefined})}
            >
                <Position defaultValue={settings?.['position']} callback={(newValue) => {
                    updateProp({'position': newValue});
                }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!settings?.['z-index']}
                label={'Z-Index'}
                onDeselect={() => updateProp({['z-index']: undefined})}
            >
                <ZIndex defaultValue={settings?.['z-index']} callback={(newValue) => {
                    updateProp({'z-index': newValue});
                }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                hasValue={() => !!settings?.['top'] || !!settings?.['right'] || !!settings?.['bottom'] || !!settings?.['left']}
                label={'Box Position'}
                onDeselect={() => updateProp({
                    ['top']: undefined,
                    ['right']: undefined,
                    ['bottom']: undefined,
                    ['left']: undefined
                })}
            >
                <BoxPosition topValue={settings?.['top']}
                             rightValue={settings?.['right']}
                             bottomValue={settings?.['bottom']}
                             leftValue={settings?.['left']}
                             callback={(top, right, bottom, left) => {
                                 updateProp({
                                     'top': top,
                                     'right': right,
                                     'bottom': bottom,
                                     'left': left
                                 });
                             }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!settings?.['overflow']}
                label={'Overflow'}
                onDeselect={() => updateProp({['overflow']: undefined})}
            >
                <Overflow defaultValue={settings?.['overflow']} callback={(newValue) => {
                    updateProp({'overflow': newValue});
                }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!settings?.['aspect-ratio']}
                label={'Shape'}
                onDeselect={() => updateProp({['aspect-ratio']: undefined})}
            >
                <Shape defaultValue={settings?.['aspect-ratio']} callback={(newValue) => {
                    updateProp({['aspect-ratio']: newValue});
                }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!settings?.['order']}
                label={'Order'}
                onDeselect={() => updateProp({['order']: undefined})}
            >
                <Order defaultValue={settings?.['order']} callback={(newValue) => {
                    updateProp({['order']: newValue});
                }}/>
            </ToolsPanelItem>

            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!settings?.['outline-offset']}
                label={'Outline Offset'}
                onDeselect={() => updateProp({['outline-offset']: undefined})}
            >
                <OutlineOffset defaultValue={settings?.['outline-offset']}
                               callback={(newValue) => {
                                   updateProp({['outline-offset']: newValue});
                               }}/>
            </ToolsPanelItem>

            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!settings?.['offset-header']}
                label={'Offset Header'}
                onDeselect={() => updateProp({['offset-header']: undefined})}
            >
                <OffsetHeader defaultValue={settings?.['offset-header'] || undefined}
                              callback={(newValue) => {
                                  updateProp({['offset-header']: newValue});
                              }}/>
            </ToolsPanelItem>

            <ToolsPanelItem
                hasValue={() => !!settings?.['translate']}
                label={'Translate'}
                onDeselect={() => updateProp({['translate']: undefined})}
            >
                <Translate defaultValue={settings?.['translate']} callback={(newValue) => {
                    updateProp({['translate']: newValue});
                }}/>
            </ToolsPanelItem>

            <ToolsPanelItem
                hasValue={() => !!settings?.['outline']}
                label={'Outline'}
                onDeselect={() => updateProp({['outline']: undefined})}
            >
                <Outline defaultValue={settings?.['outline']} callback={(newValue) => {
                    updateProp({['outline']: newValue});
                }}/>
            </ToolsPanelItem>

            <ToolsPanelItem
                hasValue={() => !!settings?.['mask-image']}
                label={'Mask'}
                onDeselect={() => {
                    updateProp({
                        ['mask-image']: undefined,
                        ['mask-origin']: undefined,
                        ['mask-size']: undefined
                    });
                }}
            >
                <Mask
                    imageValue={settings?.['mask-image']}
                    originValue={settings?.['mask-origin']}
                    sizeValue={settings?.['mask-size']}
                    callback={(image, origin, size) => {
                        updateProp({
                            ['mask-image']: image,
                            ['mask-origin']: origin,
                            ['mask-size']: size
                        });
                    }}/>
            </ToolsPanelItem>


        </ToolsPanel>

        <ToolsPanel label={'Layout Mobile'} resetAll={resetAll_mobile}>
            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!settings?.['breakpoint']}
                label={'Breakpoint'}
                onDeselect={() => updateProp({['breakpoint']: undefined})}
            >
                <Breakpoint defaultValue={settings?.['breakpoint']}
                            callback={(newValue) => {
                                updateProp({['breakpoint']: newValue});
                            }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!settings?.['display-mobile']}
                label={'Display'}
                onDeselect={() => updateProp({['display-mobile']: undefined})}
            >
                <Display defaultValue={settings?.['display-mobile']} callback={(newValue) => {
                    updateProp({['display-mobile']: newValue});
                }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!settings?.['flex-direction-mobile']}
                label={'Direction'}
                onDeselect={() => updateProp({['flex-direction-mobile']: undefined})}
            >
                <FlexDirection defaultValue={settings?.['flex-direction-mobile']}
                               callback={(newValue) => {
                                   updateProp({['flex-direction-mobile']: newValue});
                               }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!settings?.['align-items-mobile']}
                label={'Align'}
                onDeselect={() => updateProp({['align-items-mobile']: undefined})}
            >
                <Align defaultValue={settings?.['align-items-mobile']}
                       callback={(newValue) => {
                           updateProp({['align-items-mobile']: newValue});
                       }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!settings?.['justify-content-mobile']}
                label={'Justify'}
                onDeselect={() => updateProp({['justify-content-mobile']: undefined})}
            >
                <Justify defaultValue={settings?.['justify-content-mobile']}
                         callback={(newValue) => {
                             updateProp({['justify-content-mobile']: newValue});
                         }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!settings?.['flex-grow-mobile']}
                label={'Grow'}
                onDeselect={() => updateProp({['flex-grow-mobile']: undefined})}
            >
                <Grow defaultValue={settings?.['flex-grow-mobile']} callback={(newValue) => {
                    updateProp({['flex-grow-mobile']: newValue});
                }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!settings?.['flex-shrink-mobile']}
                label={'Shrink'}
                onDeselect={() => updateProp({['flex-shrink-mobile']: undefined})}
            >
                <Shrink defaultValue={settings?.['flex-shrink-mobile']}
                        callback={(newValue) => {
                            updateProp({['flex-shrink-mobile']: newValue});
                        }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 2'}}
                hasValue={() => !!settings?.['opacity-mobile']}
                label={'Opacity'}
                onDeselect={() => updateProp({['opacity-mobile']: undefined})}
            >
                <Opacity defaultValue={settings?.['opacity-mobile'] || 100}
                         callback={(newValue) => {
                             updateProp({['opacity-mobile']: newValue});
                         }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 2'}}
                hasValue={() => !!settings?.['basis-mobile']}
                label={'Basis'}
                onDeselect={() => updateProp({['basis-mobile']: undefined})}
            >
                <Basis defaultValue={settings?.['basis-mobile']} callback={(newValue) => {
                    updateProp({['basis-mobile']: newValue});
                }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!settings?.['width-mobile']}
                label={'Width'}
                onDeselect={() => updateProp({['width-mobile']: undefined})}
            >
                <Width defaultValue={settings?.['width-mobile']} callback={(newValue) => {
                    updateProp({['width-mobile']: newValue});
                }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!settings?.['width-custom-mobile']}
                label={'Width Custom'}
                onDeselect={() => updateProp({['width-custom-mobile']: undefined})}
            >
                <WidthCustom defaultValue={settings?.['width-custom-mobile']}
                             callback={(newValue) => {
                                 updateProp({['width-custom-mobile']: newValue});
                             }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!settings?.['max-width-mobile']}
                label={'Max-Width'}
                onDeselect={() => updateProp({['max-width-mobile']: undefined})}
            >
                <WidthCustom label={'Max-Width'} defaultValue={settings?.['max-width-mobile']}
                             callback={(newValue) => {
                                 updateProp({['max-width-mobile']: newValue});
                             }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!settings?.['height-mobile']}
                label={'Height'}
                onDeselect={() => updateProp({['height-mobile']: undefined})}
            >
                <Height defaultValue={settings?.['height-mobile']} callback={(newValue) => {
                    updateProp({['height-mobile']: newValue});
                }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!settings?.['min-height-mobile']}
                label={'Min-Height'}
                onDeselect={() => updateProp({['min-height-mobile']: undefined})}
            >
                <MinHeight defaultValue={settings?.['min-height-mobile']}
                           callback={(newValue) => {
                               updateProp({['min-height-mobile']: newValue});
                           }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!settings?.['height-custom-mobile']}
                label={'Height Custom'}
                onDeselect={() => updateProp({['height-custom-mobile']: undefined})}
            >
                <HeightCustom defaultValue={settings?.['height-custom-mobile']}
                              callback={(newValue) => {
                                  updateProp({['height-custom-mobile']: newValue});
                              }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!settings?.['aspect-ratio-mobile']}
                label={'Shape'}
                onDeselect={() => updateProp({['aspect-ratio-mobile']: undefined})}
            >
                <Shape defaultValue={settings?.['aspect-ratio-mobile']}
                       callback={(newValue) => {
                           updateProp({['aspect-ratio-mobile']: newValue});
                       }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!settings?.['flex-wrap-mobile']}
                label={'Flex Wrap'}
                onDeselect={() => updateProp({['flex-wrap-mobile']: undefined})}
            >
                <FlexWrap defaultValue={settings?.['flex-wrap-mobile']}
                          callback={(newValue) => {
                              updateProp({['flex-wrap-mobile']: newValue});
                          }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!settings?.['position-mobile']}
                label={'Position'}
                onDeselect={() => updateProp({['position-mobile']: undefined})}
            >
                <Position defaultValue={settings?.['position-mobile']}
                          callback={(newValue) => {
                              updateProp({['position-mobile']: newValue});
                          }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!settings?.['z-index-mobile']}
                label={'Z-Index'}
                onDeselect={() => updateProp({['z-index-mobile']: undefined})}
            >
                <ZIndex defaultValue={settings?.['z-index-mobile']} callback={(newValue) => {
                    updateProp({['z-index-mobile']: newValue});
                }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                hasValue={() => !!settings?.['top-mobile'] || !!settings?.['right-mobile'] || !!settings?.['bottom-mobile'] || !!settings?.['left-mobile']}
                label={'Box Position'}
                onDeselect={() => updateProp({
                    ['top-mobile']: undefined,
                    ['right-mobile']: undefined,
                    ['bottom-mobile']: undefined,
                    ['left-mobile']: undefined
                })}
            >
                <BoxPosition topValue={settings?.['top-mobile']}
                             rightValue={settings?.['right-mobile']}
                             bottomValue={settings?.['bottom-mobile']}
                             leftValue={settings?.['left-mobile']}
                             callback={(top, right, bottom, left) => {
                                 updateProp({
                                     ['top-mobile']: top,
                                     ['right-mobile']: right,
                                     ['bottom-mobile']: bottom,
                                     ['left-mobile']: left
                                 });
                             }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!settings?.['order-mobile']}
                label={'Order'}
                onDeselect={() => updateProp({['order-mobile']: undefined})}
            >
                <Order defaultValue={settings?.['order-mobile']} callback={(newValue) => {
                    updateProp({['order-mobile']: newValue});
                }}/>
            </ToolsPanelItem>

            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!settings?.['offset-header-mobile']}
                label={'Offset Header'}
                onDeselect={() => updateProp({['offset-header-mobile']: undefined})}
            >
                <OffsetHeader defaultValue={settings?.['offset-header-mobile'] || undefined}
                              callback={(newValue) => {
                                  updateProp({['offset-header-mobile']: newValue});
                              }}/>
            </ToolsPanelItem>


            <ToolsPanelItem
                hasValue={() => !!settings?.['translate-mobile']}
                label={'Translate'}
                onDeselect={() => updateProp({['translate-mobile']: undefined})}
            >
                <Translate label={'Translate'}
                           defaultValue={settings?.['translate-mobile'] || {}}
                           callback={(newValue) => {
                               updateProp({['translate-mobile']: newValue});
                           }}/>
            </ToolsPanelItem>

            <ToolsPanelItem
                hasValue={() => !!settings?.['padding-mobile']}
                label={'Padding'}
                onDeselect={() => updateProp({['padding-mobile']: undefined})}
            >
                <Padding defaultValue={settings?.['padding-mobile'] || {}}
                         callback={(newValue) => {
                             updateProp({['padding-mobile']: newValue});
                         }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                hasValue={() => !!settings?.['margin-mobile']}
                label={'Margin'}
                onDeselect={() => updateProp({['margin-mobile']: undefined})}
            >
                <Margin defaultValue={settings?.['margin-mobile'] || {}}
                        callback={(newValue) => {
                            updateProp({['margin-mobile']: newValue});
                        }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                hasValue={() => !!settings?.['gap-mobile']}
                label={'Gap'}
                onDeselect={() => updateProp({['gap-mobile']: undefined})}
            >
                <Gap defaultValue={settings?.['gap-mobile'] || {}} callback={(newValue) => {
                    updateProp({['gap-mobile']: newValue});
                }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                hasValue={() => !!settings?.['border-radius-mobile']}
                label={'Rounded'}
                onDeselect={() => updateProp({['border-radius-mobile']: undefined})}
            >
                <Rounded defaultValue={settings?.['border-radius-mobile'] || {}}
                         callback={(newValue) => {
                             updateProp({['border-radius-mobile']: newValue});
                         }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!settings?.['font-size-mobile']}
                label={'Font Size'}
                onDeselect={() => updateProp({['font-size-mobile']: undefined})}
            >
                <FontSize defaultValue={settings?.['font-size-mobile']}
                          callback={(newValue) => {
                              updateProp({['font-size-mobile']: newValue});
                          }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!settings?.['line-height-mobile']}
                label={'Line Height'}
                onDeselect={() => updateProp({['line-height-mobile']: undefined})}
            >
                <LineHeight defaultValue={settings?.['line-height-mobile']}
                            callback={(newValue) => {
                                updateProp({['line-height-mobile']: newValue});
                            }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!settings?.['text-align-mobile']}
                label={'Text Align'}
                onDeselect={() => updateProp({['text-align-mobile']: undefined})}
            >
                <TextAlign defaultValue={settings?.['text-align-mobile']}
                           callback={(newValue) => {
                               updateProp({['text-align-mobile']: newValue});
                           }}/>
            </ToolsPanelItem>

            <ToolsPanelItem
                hasValue={() => !!settings?.['mask-image-mobile']}
                label={'Mask'}
                onDeselect={() => {
                    updateProp({
                        ['mask-image-mobile']: undefined,
                        ['mask-origin-mobile']: undefined,
                        ['mask-size-mobile']: undefined
                    });
                }}
            >
                <Mask
                    imageValue={settings?.['mask-image-mobile']}
                    originValue={settings?.['mask-origin-mobile']}
                    sizeValue={settings?.['mask-size-mobile']}
                    callback={(image, origin, size) => {
                        updateProp({
                            ['mask-image-mobile']: image,
                            ['mask-origin-mobile']: origin,
                            ['mask-size-mobile']: size
                        });
                    }}/>
            </ToolsPanelItem>


        </ToolsPanel>

        <PanelColorSettings
            title={'Additional Colors'}
            enableAlpha
            __experimentalIsRenderedInSidebar
            colorSettings={[
                {
                    slug: 'text-color-hover',
                    label: 'Text Hover'
                },
                {
                    slug: 'background-color-hover',
                    label: 'Background Hover'
                },
                {
                    slug: 'border-color-hover',
                    label: 'Border Hover'
                },
                {
                    slug: 'text-color-mobile',
                    label: 'Text Mobile'
                },
                {
                    slug: 'background-color-mobile',
                    label: 'Background Mobile'
                }
            ].map((color_control) => {
                return {
                    value: settings?.[color_control.slug],
                    onChange: (color) => updateProp({[color_control.slug]: color}),
                    label: color_control.label.trim(),
                    isShownByDefault: false
                }
            })}
        />

    </InspectorControls>;

}