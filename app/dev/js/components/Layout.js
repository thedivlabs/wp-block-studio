import React, {useState} from "react";

import {
    InspectorControls, MediaUpload, MediaUploadCheck,
    PanelColorSettings,
} from "@wordpress/block-editor";
import {
    __experimentalGrid as Grid,
    __experimentalToolsPanel as ToolsPanel,
    __experimentalToolsPanelItem as ToolsPanelItem,
    __experimentalUnitControl as UnitControl, BaseControl, GradientPicker, PanelBody,
    RangeControl,
    SelectControl, TabPanel, ToggleControl
} from "@wordpress/components";

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
import PreviewThumbnail from "Components/PreviewThumbnail.js";

export const layoutAttributes = {
    'wpbs-layout': {
        type: 'object',
        default: {}
    },
    'wpbs-background': {
        type: 'object',
        default: {}
    }
};

export const layoutProps = {

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
        'breakpoint-large',
        'breakpoint-small',
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

    small: [
        'mask-image-small',
        'mask-origin-small',
        'mask-size-small',
        'offset-header-small',
        'display-small',
        'breakpoint-large',
        'breakpoint-small',
        'align-items-small',
        'justify-content-small',
        'opacity-small',
        'basis-small',
        'width-small',
        'width-custom-small',
        'max-width-small',
        'height-small',
        'height-custom-small',
        'min-height-small',
        'min-height-custom-small',
        'max-height-small',
        'max-height-custom-small',
        'flex-grow-small',
        'flex-shrink-small',
        'flex-direction-small',
        'aspect-ratio-small',
        'position-small',
        'z-index-small',
        'top-small',
        'right-small',
        'bottom-small',
        'left-small',
        'order-small',
        'translate-small',
        'padding-small',
        'margin-small',
        'gap-small',
        'border-radius-small',
        'font-size-small',
        'line-height-small',
        'text-align-small',
        'flex-wrap-small',
    ],

    colors: [
        'text-color-hover',
        'background-color-hover',
        'border-color-hover',
        'text-color-mobile',
        'background-color-mobile',
    ],

    background: [
        'type',
        'mobile-image',
        'large-image',
        'mobile-video',
        'large-video',
        'mask-image-mobile',
        'mask-image-large',
        'eager',
        'force',
        'fixed',
        'resolution',
        'size',
        'blend',
        'position',
        'origin',
        'mask-origin',
        'mask-size',
        'repeat',
        'scale',
        'opacity',
        'width',
        'height',
        'overlay',
        'color',
        'mask',
        'fade',
        'max-height',
        'resolution-mobile',
        'size-mobile',
        'blend-mobile',
        'position-mobile',
        'origin-mobile',
        'mask-origin-mobile',
        'mask-size-mobile',
        'repeat-mobile',
        'scale-mobile',
        'opacity-mobile',
        'width-mobile',
        'height-mobile',
        'color-mobile',
        'mask-mobile',
        'overlay-mobile',
        'fade-mobile',
        'max-height-mobile'
    ]

};

export function LayoutControls({attributes = {}, setAttributes, background = false}) {

    const resetAll_layout = () => {
        setAttributes(Object.keys(layoutProps.layout).reduce((o, key) => ({...o, [key]: undefined}), {}))
    };

    const resetAll_layout_small = () => {
        setAttributes(Object.keys(layoutProps.small).reduce((o, key) => ({...o, [key]: undefined}), {}))
    };

    const resetAll_layout_mobile = () => {
        setAttributes(Object.keys(layoutProps.mobile).reduce((o, key) => ({...o, [key]: undefined}), {}))
    };

    function updateProp(newValue) {
        setAttributes({
            'wpbs-layout': {
                ...attributes['wpbs-layout'],
                ...newValue
            }
        });
    }

    function Controls() {
        return <InspectorControls group="styles">
            <ToolsPanel label={'Layout'} resetAll={resetAll_layout} columnGap={15} rowGap={20}>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-layout']?.['display']}
                    label={'Display'}
                    onDeselect={() => updateProp({'display': undefined})}
                >
                    <Display defaultValue={attributes['wpbs-layout']?.['display']} callback={(newValue) => {
                        updateProp({'display': newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-layout']?.['flex-direction']}
                    label={'Direction'}
                    onDeselect={() => updateProp({'flex-direction': undefined})}
                >
                    <FlexDirection defaultValue={attributes['wpbs-layout']?.['flex-direction']}
                                   callback={(newValue) => {
                                       updateProp({'flex-direction': newValue});
                                   }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-layout']?.['container']}
                    label={'Container'}
                    onDeselect={() => updateProp({['container']: undefined})}
                >
                    <Container defaultValue={attributes['wpbs-layout']?.['container']} callback={(newValue) => {
                        updateProp({'container': newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-layout']?.['align-items']}
                    label={'Align'}
                    onDeselect={() => updateProp({['align-items']: undefined})}
                >
                    <Align defaultValue={attributes['wpbs-layout']?.['align-items']} callback={(newValue) => {
                        updateProp({'align-items': newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-layout']?.['justify-content']}
                    label={'Justify'}
                    onDeselect={() => updateProp({['justify-content']: undefined})}
                >
                    <Justify defaultValue={attributes['wpbs-layout']?.['justify-content']} callback={(newValue) => {
                        updateProp({'justify-content': newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 2'}}
                    hasValue={() => !!attributes['wpbs-layout']?.['opacity']}
                    label={'Opacity'}
                    onDeselect={() => updateProp({['opacity']: undefined})}
                >
                    <Opacity defaultValue={attributes['wpbs-layout']?.['opacity']} callback={(newValue) => {
                        updateProp({'opacity': newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 2'}}
                    hasValue={() => !!attributes['wpbs-layout']?.['basis']}
                    label={'Basis'}
                    onDeselect={() => updateProp({['basis']: undefined})}
                >
                    <Basis defaultValue={attributes['wpbs-layout']?.['basis']} callback={(newValue) => {
                        updateProp({'basis': newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-layout']?.['width']}
                    label={'Width'}
                    onDeselect={() => updateProp({['width']: undefined})}
                >
                    <Width defaultValue={attributes['wpbs-layout']?.['width']} callback={(newValue) => {
                        updateProp({'width': newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-layout']?.['width-custom']}
                    label={'Width Custom'}
                    onDeselect={() => updateProp({['width-custom']: undefined})}
                >
                    <WidthCustom defaultValue={attributes['wpbs-layout']?.['width-custom']} callback={(newValue) => {
                        updateProp({'width-custom': newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-layout']?.['max-width']}
                    label={'Max-Width'}
                    onDeselect={() => updateProp({['max-width']: undefined})}
                >
                    <WidthCustom label={'Max-Width'} defaultValue={attributes['wpbs-layout']?.['max-width']}
                                 callback={(newValue) => {
                                     updateProp({'max-width': newValue});
                                 }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-layout']?.['height']}
                    label={'Height'}
                    onDeselect={() => updateProp({['height']: undefined})}
                >
                    <Height defaultValue={attributes['wpbs-layout']?.['height']} callback={(newValue) => {
                        updateProp({'height': newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-layout']?.['height-custom']}
                    label={'Height Custom'}
                    onDeselect={() => updateProp({['height-custom']: undefined})}
                >
                    <HeightCustom defaultValue={attributes['wpbs-layout']?.['height-custom']} callback={(newValue) => {
                        updateProp({'height-custom': newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-layout']?.['min-height']}
                    label={'Min-Height'}
                    onDeselect={() => updateProp({['min-height']: undefined})}
                >
                    <MinHeight defaultValue={attributes['wpbs-layout']?.['min-height']} callback={(newValue) => {
                        updateProp({'min-height': newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-layout']?.['min-height-custom']}
                    label={'Min-Height Custom'}
                    onDeselect={() => updateProp({['min-height-custom']: undefined})}
                >
                    <MinHeightCustom defaultValue={attributes['wpbs-layout']?.['min-height-custom']}
                                     callback={(newValue) => {
                                         updateProp({'min-height-custom': newValue});
                                     }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-layout']?.['max-height']}
                    label={'Max-Height'}
                    onDeselect={() => updateProp({['max-height']: undefined})}
                >
                    <MaxHeight defaultValue={attributes['wpbs-layout']?.['max-height']} callback={(newValue) => {
                        updateProp({'max-height': newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-layout']?.['max-height-custom']}
                    label={'Max-Height Custom'}
                    onDeselect={() => updateProp({['max-height-custom']: undefined})}
                >
                    <MaxHeightCustom defaultValue={attributes['wpbs-layout']?.['max-height-custom']}
                                     callback={(newValue) => {
                                         updateProp({'max-height-custom': newValue});
                                     }}/>
                </ToolsPanelItem>

                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-layout']?.['flex-wrap']}
                    label={'Flex Wrap'}
                    onDeselect={() => updateProp({['flex-wrap']: undefined})}
                >
                    <FlexWrap defaultValue={attributes['wpbs-layout']?.['flex-wrap']} callback={(newValue) => {
                        updateProp({'flex-wrap': newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-layout']?.['flex-grow']}
                    label={'Grow'}
                    onDeselect={() => updateProp({['flex-grow']: undefined})}
                >
                    <Grow defaultValue={attributes['wpbs-layout']?.['flex-grow']} callback={(newValue) => {
                        updateProp({'flex-grow': newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-layout']?.['flex-shrink']}
                    label={'Shrink'}
                    onDeselect={() => updateProp({['flex-shrink']: undefined})}
                >
                    <Shrink defaultValue={attributes['wpbs-layout']?.['flex-shrink']} callback={(newValue) => {
                        updateProp({'flex-shrink': newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-layout']?.['position']}
                    label={'Position'}
                    onDeselect={() => updateProp({['position']: undefined})}
                >
                    <Position defaultValue={attributes['wpbs-layout']?.['position']} callback={(newValue) => {
                        updateProp({'position': newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-layout']?.['z-index']}
                    label={'Z-Index'}
                    onDeselect={() => updateProp({['z-index']: undefined})}
                >
                    <ZIndex defaultValue={attributes['wpbs-layout']?.['z-index']} callback={(newValue) => {
                        updateProp({'z-index': newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    hasValue={() => !!attributes['wpbs-layout']?.['top'] || !!attributes['wpbs-layout']?.['right'] || !!attributes['wpbs-layout']?.['bottom'] || !!attributes['wpbs-layout']?.['left']}
                    label={'Box Position'}
                    onDeselect={() => updateProp({
                        ['top']: undefined,
                        ['right']: undefined,
                        ['bottom']: undefined,
                        ['left']: undefined
                    })}
                >
                    <BoxPosition topValue={attributes['wpbs-layout']?.['top']}
                                 rightValue={attributes['wpbs-layout']?.['right']}
                                 bottomValue={attributes['wpbs-layout']?.['bottom']}
                                 leftValue={attributes['wpbs-layout']?.['left']}
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
                    hasValue={() => !!attributes['wpbs-layout']?.['overflow']}
                    label={'Overflow'}
                    onDeselect={() => updateProp({['overflow']: undefined})}
                >
                    <Overflow defaultValue={attributes['wpbs-layout']?.['overflow']} callback={(newValue) => {
                        updateProp({'overflow': newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-layout']?.['aspect-ratio']}
                    label={'Shape'}
                    onDeselect={() => updateProp({['aspect-ratio']: undefined})}
                >
                    <Shape defaultValue={attributes['wpbs-layout']?.['aspect-ratio']} callback={(newValue) => {
                        updateProp({['aspect-ratio']: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-layout']?.['order']}
                    label={'Order'}
                    onDeselect={() => updateProp({['order']: undefined})}
                >
                    <Order defaultValue={attributes['wpbs-layout']?.['order']} callback={(newValue) => {
                        updateProp({['order']: newValue});
                    }}/>
                </ToolsPanelItem>

                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-layout']?.['outline-offset']}
                    label={'Outline Offset'}
                    onDeselect={() => updateProp({['outline-offset']: undefined})}
                >
                    <OutlineOffset defaultValue={attributes['wpbs-layout']?.['outline-offset']}
                                   callback={(newValue) => {
                                       updateProp({['outline-offset']: newValue});
                                   }}/>
                </ToolsPanelItem>

                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-layout']?.['offset-header']}
                    label={'Offset Header'}
                    onDeselect={() => updateProp({['offset-header']: undefined})}
                >
                    <OffsetHeader defaultValue={attributes['wpbs-layout']?.['offset-header'] || undefined}
                                  callback={(newValue) => {
                                      updateProp({['offset-header']: newValue});
                                  }}/>
                </ToolsPanelItem>

                <ToolsPanelItem
                    hasValue={() => !!attributes['wpbs-layout']?.['translate']}
                    label={'Translate'}
                    onDeselect={() => updateProp({['translate']: undefined})}
                >
                    <Translate defaultValue={attributes['wpbs-layout']?.['translate']} callback={(newValue) => {
                        updateProp({['translate']: newValue});
                    }}/>
                </ToolsPanelItem>

                <ToolsPanelItem
                    hasValue={() => !!attributes['wpbs-layout']?.['outline']}
                    label={'Outline'}
                    onDeselect={() => updateProp({['outline']: undefined})}
                >
                    <Outline defaultValue={attributes['wpbs-layout']?.['outline']} callback={(newValue) => {
                        updateProp({['outline']: newValue});
                    }}/>
                </ToolsPanelItem>

                <ToolsPanelItem
                    hasValue={() => !!attributes['wpbs-layout']?.['mask-image']}
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
                        imageValue={attributes['wpbs-layout']?.['mask-image']}
                        originValue={attributes['wpbs-layout']?.['mask-origin']}
                        sizeValue={attributes['wpbs-layout']?.['mask-size']}
                        callback={(image, origin, size) => {
                            updateProp({
                                ['mask-image']: image,
                                ['mask-origin']: origin,
                                ['mask-size']: size
                            });
                        }}/>
                </ToolsPanelItem>


            </ToolsPanel>

            <ToolsPanel label={'Small'} resetAll={resetAll_layout_small}>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-layout']?.['breakpoint-small']}
                    label={'Breakpoint'}
                    onDeselect={() => updateProp({['breakpoint-small']: undefined})}
                >
                    <Breakpoint defaultValue={attributes['wpbs-layout']?.['breakpoint-small']} callback={(newValue) => {
                        updateProp({['breakpoint-small']: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-layout']?.['flex-direction-small']}
                    label={'Direction'}
                    onDeselect={() => updateProp({['flex-direction-small']: undefined})}
                >
                    <FlexDirection defaultValue={attributes['wpbs-layout']?.['flex-direction-small']}
                                   callback={(newValue) => {
                                       updateProp({['flex-direction-small']: newValue});
                                   }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-layout']?.['align-items-small']}
                    label={'Align'}
                    onDeselect={() => updateProp({['align-items-small']: undefined})}
                >
                    <Align defaultValue={attributes['wpbs-layout']?.['align-items-small']} callback={(newValue) => {
                        updateProp({['align-items-small']: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-layout']?.['justify-content-small']}
                    label={'Justify'}
                    onDeselect={() => updateProp({['justify-content-small']: undefined})}
                >
                    <Justify defaultValue={attributes['wpbs-layout']?.['justify-content-small']}
                             callback={(newValue) => {
                                 updateProp({['justify-content-small']: newValue});
                             }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-layout']?.['flex-grow-small']}
                    label={'Grow'}
                    onDeselect={() => updateProp({['flex-grow-small']: undefined})}
                >
                    <Grow defaultValue={attributes['wpbs-layout']?.['flex-grow-small']} callback={(newValue) => {
                        updateProp({['flex-grow-small']: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-layout']?.['flex-shrink-small']}
                    label={'Shrink'}
                    onDeselect={() => updateProp({['flex-shrink-small']: undefined})}
                >
                    <Shrink defaultValue={attributes['wpbs-layout']?.['flex-shrink-small']} callback={(newValue) => {
                        updateProp({['flex-shrink-small']: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 2'}}
                    hasValue={() => !!attributes['wpbs-layout']?.['opacity-small']}
                    label={'Opacity'}
                    onDeselect={() => updateProp({['opacity-small']: undefined})}
                >
                    <Opacity defaultValue={attributes['wpbs-layout']?.['opacity-small'] || 100}
                             callback={(newValue) => {
                                 updateProp({['opacity-small']: newValue});
                             }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 2'}}
                    hasValue={() => !!attributes['wpbs-layout']?.['basis-small']}
                    label={'Basis'}
                    onDeselect={() => updateProp({['basis-small']: undefined})}
                >
                    <Basis defaultValue={attributes['wpbs-layout']?.['basis-small']} callback={(newValue) => {
                        updateProp({['basis-small']: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-layout']?.['width-small']}
                    label={'Width'}
                    onDeselect={() => updateProp({['width-small']: undefined})}
                >
                    <Width defaultValue={attributes['wpbs-layout']?.['width-small']} callback={(newValue) => {
                        updateProp({['width-small']: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-layout']?.['width-custom-small']}
                    label={'Width Custom'}
                    onDeselect={() => updateProp({['width-custom-small']: undefined})}
                >
                    <WidthCustom defaultValue={attributes['wpbs-layout']?.['width-custom-small']}
                                 callback={(newValue) => {
                                     updateProp({['width-custom-small']: newValue});
                                 }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-layout']?.['max-width-small']}
                    label={'Max-Width'}
                    onDeselect={() => updateProp({['max-width-small']: undefined})}
                >
                    <WidthCustom label={'Max-Width'} defaultValue={attributes['wpbs-layout']?.['max-width-small']}
                                 callback={(newValue) => {
                                     updateProp({['max-width-small']: newValue});
                                 }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-layout']?.['height-small']}
                    label={'Height'}
                    onDeselect={() => updateProp({['height-small']: undefined})}
                >
                    <Height defaultValue={attributes['wpbs-layout']?.['height-small']} callback={(newValue) => {
                        updateProp({['height-small']: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-layout']?.['min-height-small']}
                    label={'Min-Height'}
                    onDeselect={() => updateProp({['min-height-small']: undefined})}
                >
                    <MinHeight defaultValue={attributes['wpbs-layout']?.['min-height-small']} callback={(newValue) => {
                        updateProp({['min-height-small']: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-layout']?.['height-custom-small']}
                    label={'Height Custom'}
                    onDeselect={() => updateProp({['height-custom-small']: undefined})}
                >
                    <HeightCustom defaultValue={attributes['wpbs-layout']?.['height-custom-small']}
                                  callback={(newValue) => {
                                      updateProp({['height-custom-small']: newValue});
                                  }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-layout']?.['aspect-ratio-small']}
                    label={'Shape'}
                    onDeselect={() => updateProp({['aspect-ratio-small']: undefined})}
                >
                    <Shape defaultValue={attributes['wpbs-layout']?.['aspect-ratio-small']} callback={(newValue) => {
                        updateProp({['aspect-ratio-small']: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-layout']?.['flex-wrap-small']}
                    label={'Flex Wrap'}
                    onDeselect={() => updateProp({['flex-wrap-small']: undefined})}
                >
                    <FlexWrap defaultValue={attributes['wpbs-layout']?.['flex-wrap-small']} callback={(newValue) => {
                        updateProp({['flex-wrap-small']: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-layout']?.['position-small']}
                    label={'Position'}
                    onDeselect={() => updateProp({['position-small']: undefined})}
                >
                    <Position defaultValue={attributes['wpbs-layout']?.['position-small']} callback={(newValue) => {
                        updateProp({['position-small']: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-layout']?.['z-index-small']}
                    label={'Z-Index'}
                    onDeselect={() => updateProp({['z-index-small']: undefined})}
                >
                    <ZIndex defaultValue={attributes['wpbs-layout']?.['z-index-small']} callback={(newValue) => {
                        updateProp({['z-index-small']: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    hasValue={() => !!attributes['wpbs-layout']?.['top-small'] || !!attributes['wpbs-layout']?.['right-small'] || !!attributes['wpbs-layout']?.['bottom-small'] || !!attributes['wpbs-layout']?.['left-small']}
                    label={'Box Position'}
                    onDeselect={() => updateProp({
                        ['top-small']: undefined,
                        ['right-small']: undefined,
                        ['bottom-small']: undefined,
                        ['left-small']: undefined
                    })}
                >
                    <BoxPosition topValue={attributes['wpbs-layout']?.['top-small']}
                                 rightValue={attributes['wpbs-layout']?.['right-small']}
                                 bottomValue={attributes['wpbs-layout']?.['bottom-small']}
                                 leftValue={attributes['wpbs-layout']?.['left-small']}
                                 callback={(top, right, bottom, left) => {
                                     updateProp({
                                         ['top-small']: top,
                                         ['right-small']: right,
                                         ['bottom-small']: bottom,
                                         ['left-small']: left
                                     });
                                 }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-layout']?.['order-small']}
                    label={'Order'}
                    onDeselect={() => updateProp({['order-small']: undefined})}
                >
                    <Order defaultValue={attributes['wpbs-layout']?.['order-small']} callback={(newValue) => {
                        updateProp({['order-small']: newValue});
                    }}/>
                </ToolsPanelItem>

                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-layout']?.['offset-header-small']}
                    label={'Offset Header'}
                    onDeselect={() => updateProp({['offset-header-small']: undefined})}
                >
                    <OffsetHeader defaultValue={attributes['wpbs-layout']?.['offset-header-small'] || undefined}
                                  callback={(newValue) => {
                                      updateProp({['offset-header-small']: newValue});
                                  }}/>
                </ToolsPanelItem>


                <ToolsPanelItem
                    hasValue={() => !!attributes['wpbs-layout']?.['translate-small']}
                    label={'Translate'}
                    onDeselect={() => updateProp({['translate-small']: undefined})}
                >
                    <Translate label={'Translate'}
                               defaultValue={attributes['wpbs-layout']?.['translate-small'] || {}}
                               callback={(newValue) => {
                                   updateProp({['translate-small']: newValue});
                               }}/>
                </ToolsPanelItem>

                <ToolsPanelItem
                    hasValue={() => !!attributes['wpbs-layout']?.['padding-small']}
                    label={'Padding'}
                    onDeselect={() => updateProp({['padding-small']: undefined})}
                >
                    <Padding defaultValue={attributes['wpbs-layout']?.['padding-small'] || {}}
                             callback={(newValue) => {
                                 updateProp({['padding-small']: newValue});
                             }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    hasValue={() => !!attributes['wpbs-layout']?.['margin-small']}
                    label={'Margin'}
                    onDeselect={() => updateProp({['margin-small']: undefined})}
                >
                    <Margin defaultValue={attributes['wpbs-layout']?.['margin-small'] || {}} callback={(newValue) => {
                        updateProp({['margin-small']: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    hasValue={() => !!attributes['wpbs-layout']?.['gap-small']}
                    label={'Gap'}
                    onDeselect={() => updateProp({['gap-small']: undefined})}
                >
                    <Gap defaultValue={attributes['wpbs-layout']?.['gap-small'] || {}} callback={(newValue) => {
                        updateProp({['gap-small']: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    hasValue={() => !!attributes['wpbs-layout']?.['border-radius-small']}
                    label={'Rounded'}
                    onDeselect={() => updateProp({['border-radius-small']: undefined})}
                >
                    <Rounded defaultValue={attributes['wpbs-layout']?.['border-radius-small'] || {}}
                             callback={(newValue) => {
                                 updateProp({['border-radius-small']: newValue});
                             }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-layout']?.['font-size-small']}
                    label={'Font Size'}
                    onDeselect={() => updateProp({['font-size-small']: undefined})}
                >
                    <FontSize defaultValue={attributes['wpbs-layout']?.['font-size-small']} callback={(newValue) => {
                        updateProp({['font-size-small']: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-layout']?.['line-height-small']}
                    label={'Line Height'}
                    onDeselect={() => updateProp({['line-height-small']: undefined})}
                >
                    <LineHeight defaultValue={attributes['wpbs-layout']?.['line-height-small']}
                                callback={(newValue) => {
                                    updateProp({['line-height-small']: newValue});
                                }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-layout']?.['text-align-small']}
                    label={'Text Align'}
                    onDeselect={() => updateProp({['text-align-small']: undefined})}
                >
                    <TextAlign defaultValue={attributes['wpbs-layout']?.['text-align-small']}
                               callback={(newValue) => {
                                   updateProp({['text-align-small']: newValue});
                               }}/>
                </ToolsPanelItem>

                <ToolsPanelItem
                    hasValue={() => !!attributes['wpbs-layout']?.['mask-image-small']}
                    label={'Mask'}
                    onDeselect={() => {
                        updateProp({
                            ['mask-image-small']: undefined,
                            ['mask-origin-small']: undefined,
                            ['mask-size-small']: undefined
                        });
                    }}
                >
                    <Mask
                        imageValue={attributes['wpbs-layout']?.['mask-image-small']}
                        originValue={attributes['wpbs-layout']?.['mask-origin-small']}
                        sizeValue={attributes['wpbs-layout']?.['mask-size-small']}
                        callback={(image, origin, size) => {
                            updateProp({
                                ['mask-image-small']: image,
                                ['mask-origin-small']: origin,
                                ['mask-size-small']: size
                            });
                        }}/>
                </ToolsPanelItem>


            </ToolsPanel>

            <ToolsPanel label={'Mobile'} resetAll={resetAll_layout_mobile}>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-layout']?.['breakpoint-mobile']}
                    label={'Breakpoint'}
                    onDeselect={() => updateProp({['breakpoint-mobile']: undefined})}
                >
                    <Breakpoint defaultValue={attributes['wpbs-layout']?.['breakpoint-mobile']}
                                callback={(newValue) => {
                                    updateProp({['breakpoint-mobile']: newValue});
                                }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-layout']?.['display-mobile']}
                    label={'Display'}
                    onDeselect={() => updateProp({['display-mobile']: undefined})}
                >
                    <Display defaultValue={attributes['wpbs-layout']?.['display-mobile']} callback={(newValue) => {
                        updateProp({['display-mobile']: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-layout']?.['flex-direction-mobile']}
                    label={'Direction'}
                    onDeselect={() => updateProp({['flex-direction-mobile']: undefined})}
                >
                    <FlexDirection defaultValue={attributes['wpbs-layout']?.['flex-direction-mobile']}
                                   callback={(newValue) => {
                                       updateProp({['flex-direction-mobile']: newValue});
                                   }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-layout']?.['align-items-mobile']}
                    label={'Align'}
                    onDeselect={() => updateProp({['align-items-mobile']: undefined})}
                >
                    <Align defaultValue={attributes['wpbs-layout']?.['align-items-mobile']} callback={(newValue) => {
                        updateProp({['align-items-mobile']: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-layout']?.['justify-content-mobile']}
                    label={'Justify'}
                    onDeselect={() => updateProp({['justify-content-mobile']: undefined})}
                >
                    <Justify defaultValue={attributes['wpbs-layout']?.['justify-content-mobile']}
                             callback={(newValue) => {
                                 updateProp({['justify-content-mobile']: newValue});
                             }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-layout']?.['flex-grow-mobile']}
                    label={'Grow'}
                    onDeselect={() => updateProp({['flex-grow-mobile']: undefined})}
                >
                    <Grow defaultValue={attributes['wpbs-layout']?.['flex-grow-mobile']} callback={(newValue) => {
                        updateProp({['flex-grow-mobile']: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-layout']?.['flex-shrink-mobile']}
                    label={'Shrink'}
                    onDeselect={() => updateProp({['flex-shrink-mobile']: undefined})}
                >
                    <Shrink defaultValue={attributes['wpbs-layout']?.['flex-shrink-mobile']} callback={(newValue) => {
                        updateProp({['flex-shrink-mobile']: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 2'}}
                    hasValue={() => !!attributes['wpbs-layout']?.['opacity-mobile']}
                    label={'Opacity'}
                    onDeselect={() => updateProp({['opacity-mobile']: undefined})}
                >
                    <Opacity defaultValue={attributes['wpbs-layout']?.['opacity-mobile'] || 100}
                             callback={(newValue) => {
                                 updateProp({['opacity-mobile']: newValue});
                             }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 2'}}
                    hasValue={() => !!attributes['wpbs-layout']?.['basis-mobile']}
                    label={'Basis'}
                    onDeselect={() => updateProp({['basis-mobile']: undefined})}
                >
                    <Basis defaultValue={attributes['wpbs-layout']?.['basis-mobile']} callback={(newValue) => {
                        updateProp({['basis-mobile']: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-layout']?.['width-mobile']}
                    label={'Width'}
                    onDeselect={() => updateProp({['width-mobile']: undefined})}
                >
                    <Width defaultValue={attributes['wpbs-layout']?.['width-mobile']} callback={(newValue) => {
                        updateProp({['width-mobile']: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-layout']?.['width-custom-mobile']}
                    label={'Width Custom'}
                    onDeselect={() => updateProp({['width-custom-mobile']: undefined})}
                >
                    <WidthCustom defaultValue={attributes['wpbs-layout']?.['width-custom-mobile']}
                                 callback={(newValue) => {
                                     updateProp({['width-custom-mobile']: newValue});
                                 }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-layout']?.['max-width-mobile']}
                    label={'Max-Width'}
                    onDeselect={() => updateProp({['max-width-mobile']: undefined})}
                >
                    <WidthCustom label={'Max-Width'} defaultValue={attributes['wpbs-layout']?.['max-width-mobile']}
                                 callback={(newValue) => {
                                     updateProp({['max-width-mobile']: newValue});
                                 }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-layout']?.['height-mobile']}
                    label={'Height'}
                    onDeselect={() => updateProp({['height-mobile']: undefined})}
                >
                    <Height defaultValue={attributes['wpbs-layout']?.['height-mobile']} callback={(newValue) => {
                        updateProp({['height-mobile']: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-layout']?.['min-height-mobile']}
                    label={'Min-Height'}
                    onDeselect={() => updateProp({['min-height-mobile']: undefined})}
                >
                    <MinHeight defaultValue={attributes['wpbs-layout']?.['min-height-mobile']} callback={(newValue) => {
                        updateProp({['min-height-mobile']: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-layout']?.['height-custom-mobile']}
                    label={'Height Custom'}
                    onDeselect={() => updateProp({['height-custom-mobile']: undefined})}
                >
                    <HeightCustom defaultValue={attributes['wpbs-layout']?.['height-custom-mobile']}
                                  callback={(newValue) => {
                                      updateProp({['height-custom-mobile']: newValue});
                                  }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-layout']?.['aspect-ratio-mobile']}
                    label={'Shape'}
                    onDeselect={() => updateProp({['aspect-ratio-mobile']: undefined})}
                >
                    <Shape defaultValue={attributes['wpbs-layout']?.['aspect-ratio-mobile']} callback={(newValue) => {
                        updateProp({['aspect-ratio-mobile']: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-layout']?.['flex-wrap-mobile']}
                    label={'Flex Wrap'}
                    onDeselect={() => updateProp({['flex-wrap-mobile']: undefined})}
                >
                    <FlexWrap defaultValue={attributes['wpbs-layout']?.['flex-wrap-mobile']} callback={(newValue) => {
                        updateProp({['flex-wrap-mobile']: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-layout']?.['position-mobile']}
                    label={'Position'}
                    onDeselect={() => updateProp({['position-mobile']: undefined})}
                >
                    <Position defaultValue={attributes['wpbs-layout']?.['position-mobile']} callback={(newValue) => {
                        updateProp({['position-mobile']: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-layout']?.['z-index-mobile']}
                    label={'Z-Index'}
                    onDeselect={() => updateProp({['z-index-mobile']: undefined})}
                >
                    <ZIndex defaultValue={attributes['wpbs-layout']?.['z-index-mobile']} callback={(newValue) => {
                        updateProp({['z-index-mobile']: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    hasValue={() => !!attributes['wpbs-layout']?.['top-mobile'] || !!attributes['wpbs-layout']?.['right-mobile'] || !!attributes['wpbs-layout']?.['bottom-mobile'] || !!attributes['wpbs-layout']?.['left-mobile']}
                    label={'Box Position'}
                    onDeselect={() => updateProp({
                        ['top-mobile']: undefined,
                        ['right-mobile']: undefined,
                        ['bottom-mobile']: undefined,
                        ['left-mobile']: undefined
                    })}
                >
                    <BoxPosition topValue={attributes['wpbs-layout']?.['top-mobile']}
                                 rightValue={attributes['wpbs-layout']?.['right-mobile']}
                                 bottomValue={attributes['wpbs-layout']?.['bottom-mobile']}
                                 leftValue={attributes['wpbs-layout']?.['left-mobile']}
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
                    hasValue={() => !!attributes['wpbs-layout']?.['order-mobile']}
                    label={'Order'}
                    onDeselect={() => updateProp({['order-mobile']: undefined})}
                >
                    <Order defaultValue={attributes['wpbs-layout']?.['order-mobile']} callback={(newValue) => {
                        updateProp({['order-mobile']: newValue});
                    }}/>
                </ToolsPanelItem>

                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-layout']?.['offset-header-mobile']}
                    label={'Offset Header'}
                    onDeselect={() => updateProp({['offset-header-mobile']: undefined})}
                >
                    <OffsetHeader defaultValue={attributes['wpbs-layout']?.['offset-header-mobile'] || undefined}
                                  callback={(newValue) => {
                                      updateProp({['offset-header-mobile']: newValue});
                                  }}/>
                </ToolsPanelItem>


                <ToolsPanelItem
                    hasValue={() => !!attributes['wpbs-layout']?.['translate-mobile']}
                    label={'Translate'}
                    onDeselect={() => updateProp({['translate-mobile']: undefined})}
                >
                    <Translate label={'Translate'}
                               defaultValue={attributes['wpbs-layout']?.['translate-mobile'] || {}}
                               callback={(newValue) => {
                                   updateProp({['translate-mobile']: newValue});
                               }}/>
                </ToolsPanelItem>

                <ToolsPanelItem
                    hasValue={() => !!attributes['wpbs-layout']?.['padding-mobile']}
                    label={'Padding'}
                    onDeselect={() => updateProp({['padding-mobile']: undefined})}
                >
                    <Padding defaultValue={attributes['wpbs-layout']?.['padding-mobile'] || {}}
                             callback={(newValue) => {
                                 updateProp({['padding-mobile']: newValue});
                             }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    hasValue={() => !!attributes['wpbs-layout']?.['margin-mobile']}
                    label={'Margin'}
                    onDeselect={() => updateProp({['margin-mobile']: undefined})}
                >
                    <Margin defaultValue={attributes['wpbs-layout']?.['margin-mobile'] || {}} callback={(newValue) => {
                        updateProp({['margin-mobile']: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    hasValue={() => !!attributes['wpbs-layout']?.['gap-mobile']}
                    label={'Gap'}
                    onDeselect={() => updateProp({['gap-mobile']: undefined})}
                >
                    <Gap defaultValue={attributes['wpbs-layout']?.['gap-mobile'] || {}} callback={(newValue) => {
                        updateProp({['gap-mobile']: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    hasValue={() => !!attributes['wpbs-layout']?.['border-radius-mobile']}
                    label={'Rounded'}
                    onDeselect={() => updateProp({['border-radius-mobile']: undefined})}
                >
                    <Rounded defaultValue={attributes['wpbs-layout']?.['border-radius-mobile'] || {}}
                             callback={(newValue) => {
                                 updateProp({['border-radius-mobile']: newValue});
                             }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-layout']?.['font-size-mobile']}
                    label={'Font Size'}
                    onDeselect={() => updateProp({['font-size-mobile']: undefined})}
                >
                    <FontSize defaultValue={attributes['wpbs-layout']?.['font-size-mobile']} callback={(newValue) => {
                        updateProp({['font-size-mobile']: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-layout']?.['line-height-mobile']}
                    label={'Line Height'}
                    onDeselect={() => updateProp({['line-height-mobile']: undefined})}
                >
                    <LineHeight defaultValue={attributes['wpbs-layout']?.['line-height-mobile']}
                                callback={(newValue) => {
                                    updateProp({['line-height-mobile']: newValue});
                                }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-layout']?.['text-align-mobile']}
                    label={'Text Align'}
                    onDeselect={() => updateProp({['text-align-mobile']: undefined})}
                >
                    <TextAlign defaultValue={attributes['wpbs-layout']?.['text-align-mobile']}
                               callback={(newValue) => {
                                   updateProp({['text-align-mobile']: newValue});
                               }}/>
                </ToolsPanelItem>

                <ToolsPanelItem
                    hasValue={() => !!attributes['wpbs-layout']?.['mask-image-mobile']}
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
                        imageValue={attributes['wpbs-layout']?.['mask-image-mobile']}
                        originValue={attributes['wpbs-layout']?.['mask-origin-mobile']}
                        sizeValue={attributes['wpbs-layout']?.['mask-size-mobile']}
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
                        value: attributes['wpbs-layout']?.[color_control.slug],
                        onChange: (color) => updateProp({[color_control.slug]: color}),
                        label: color_control.label.trim(),
                        isShownByDefault: false
                    }
                })}
            />

        </InspectorControls>;
    }

    return <>
        <BackgroundControls attributes={attributes} setAttributes={setAttributes} enabled={!!background}/>
        <Controls/>
    </>;
}

function BackgroundControls({attributes = {}, setAttributes, enabled = false}) {

    if (!enabled) {
        return <></>;
    }

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

        if (typeof callback === 'function') {
            callback(val);
        }

        setAttributes({
            'wpbs-background': {
                ...settings,
                ...{[attr]: val}
            }
        });

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
                    setResolution(value);
                    updateSettings('resolution', value);
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
                            updateSettings('maskImageLarge', {
                                type: value.type,
                                id: value.id,
                                url: value.url,
                            }, setMaskImageLarge);
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
                            updateSettings('maskImageMobile', {
                                type: value.type,
                                id: value.id,
                                url: value.url,
                            }, setMaskImageMobile);
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
        <InspectorControls group="styles">
            <PanelBody title={'Background'} initialOpen={!!type}>
                <Grid columns={1} columnGap={15} rowGap={20}>
                    <SelectControl
                        __next40pxDefaultSize
                        label="Type"
                        value={type}
                        options={[
                            {label: 'Select', value: ''},
                            {label: 'Image', value: 'image'},
                            {label: 'Featured Image', value: 'featured-image'},
                            {label: 'Video', value: 'video'},
                        ]}
                        onChange={(value) => {
                            updateSettings('type', value, setType);
                        }}
                        __nextHasNoMarginBottom
                    />
                    <Grid columns={1} columnGap={15} rowGap={20} style={{display: !type ? 'none' : null}}>

                        <Grid columns={2} columnGap={15} rowGap={20}
                              style={{display: type !== 'image' && type !== 'featured-image' ? 'none' : null}}>
                            <BaseControl label={'Mobile Image'} __nextHasNoMarginBottom={true}>
                                <MediaUploadCheck>
                                    <MediaUpload
                                        title={'Mobile Image'}
                                        onSelect={(value) => {
                                            updateSettings('mobileImage', {
                                                type: value.type,
                                                id: value.id,
                                                url: value.url,
                                            }, setMobileImage);
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
                                            updateSettings('largeImage', {
                                                type: value.type,
                                                id: value.id,
                                                url: value.url,
                                            }, setLargeImage);
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
                                            updateSettings('mobileVideo', {
                                                type: value.type,
                                                id: value.id,
                                                url: value.url,
                                            }, setMobileVideo);
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
                                            updateSettings('largeVideo', {
                                                type: value.type,
                                                id: value.id,
                                                url: value.url,
                                            }, setLargeVideo);
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

    function Media() {

        let MediaElement;

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
