import {createHigherOrderComponent} from "@wordpress/compose";
import {
    InspectorControls,
    PanelColorSettings, BlockEdit,
} from "@wordpress/block-editor";
import {
    __experimentalToolsPanel as ToolsPanel,
    __experimentalToolsPanelItem as ToolsPanelItem,
} from "@wordpress/components";

import Outline from 'Components/Outline';
import Display from 'Components/Display';
import Align from 'Components/Align';
import Justify from 'Components/Justify';
import Height from 'Components/Height';
import HeightCustom from 'Components/HeightCustom';
import Container from 'Components/Container';
import FlexWrap from 'Components/FlexWrap';
import Space from 'Components/Space';
import Position from 'Components/Position';
import ZIndex from 'Components/ZIndex';
import Overflow from 'Components/Overflow';
import Padding from 'Components/Padding';
import Margin from 'Components/Margin';
import Gap from 'Components/Gap';
import Breakpoint from 'Components/Breakpoint';
import Width from 'Components/Width';
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

export function LayoutProps(attributes) {

    console.log(attributes);

    const style = {};

    return {
        style : style
    };
}

export function LayoutAttributes() {
    return {
        display: {
            type: 'string'
        },
        flex_wrap: {
            type: 'string'
        },
        outline_offset: {
            type: 'string'
        },
        basis: {
            type: 'integer'
        },
        text_mobile: {
            type: 'string'
        },
        background_mobile: {
            type: 'string'
        },
        basis_mobile: {
            type: 'integer'
        },
        rounded_mobile: {
            type: 'integer'
        },
        opacity: {
            type: 'integer'
        },
        opacity_mobile: {
            type: 'integer'
        },
        width: {
            type: 'string'
        },
        max_width: {
            type: 'string'
        },
        align: {
            type: 'string'
        },
        justify: {
            type: 'string'
        },
        shape: {
            type: 'string'
        },
        height: {
            type: 'string'
        },
        height_custom: {
            type: 'string'
        },
        container: {
            type: 'string'
        },
        space: {
            type: 'string'
        },
        position: {
            type: 'string'
        },
        position_mobile: {
            type: 'string'
        },
        top: {
            type: 'string'
        },
        right: {
            type: 'string'
        },
        bottom: {
            type: 'string'
        },
        left: {
            type: 'string'
        },
        top_mobile: {
            type: 'string'
        },
        right_mobile: {
            type: 'string'
        },
        bottom_mobile: {
            type: 'string'
        },
        left_mobile: {
            type: 'string'
        },
        overflow: {
            type: 'string'
        },
        font_size_mobile: {
            type: 'string'
        },
        line_height_mobile: {
            type: 'string'
        },
        display_mobile: {
            type: 'string'
        },
        flex_wrap_mobile: {
            type: 'string'
        },
        text_align_mobile: {
            type: 'string'
        },
        align_mobile: {
            type: 'string'
        },
        justify_mobile: {
            type: 'string'
        },
        height_mobile: {
            type: 'string'
        },
        height_custom_mobile: {
            type: 'string'
        },
        container_mobile: {
            type: 'string'
        },
        space_mobile: {
            type: 'string'
        },
        overflow_mobile: {
            type: 'string'
        },
        padding_mobile: {
            type: 'object'
        },
        margin_mobile: {
            type: 'object'
        },
        gap_mobile: {
            type: 'object'
        },
        width_mobile: {
            type: 'string'
        },
        max_width_mobile: {
            type: 'string'
        },
        breakpoint: {
            type: 'string'
        },
        zindex: {
            type: 'string'
        },
        zindex_mobile: {
            type: 'string'
        },
        order: {
            type: 'string'
        },
        order_mobile: {
            type: 'string'
        },
        shape_mobile: {
            type: 'string'
        },
        translate: {
            type: 'object'
        },
        translate_mobile: {
            type: 'object'
        },

        outline: {
            type: 'object'
        },

        text_hover: {
            type: 'string'
        },
        background_hover: {
            type: 'string'
        },
        links_hover: {
            type: 'string'
        },
        border_color_hover: {
            type: 'string'
        },
        scale_hover: {
            type: 'integer'
        },
        opacity_hover: {
            type: 'integer'
        },

        padding_hover: {
            type: 'object'
        },
        translate_hover: {
            type: 'object'
        },

    }

}

export function Layout({blockProps, attributes = {}, setAttributes}) {

    const resetAll_layout = () => {
        setAttributes({display: ''});
        setAttributes({container: ''});
        setAttributes({align: ''});
        setAttributes({justify: ''});
        setAttributes({opacity: ''});
        setAttributes({basis: ''});
        setAttributes({width: ''});
        setAttributes({max_width: ''});
        setAttributes({height: ''});
        setAttributes({height_custom: ''});
        setAttributes({flex_wrap: ''});
        setAttributes({space: ''});
        setAttributes({position: ''});
        setAttributes({zindex: ''});
        setAttributes({top: ''});
        setAttributes({right: ''});
        setAttributes({bottom: ''});
        setAttributes({left: ''});
        setAttributes({overflow: ''});
        setAttributes({shape: ''});
        setAttributes({order: ''});
        setAttributes({translate: ''});
        setAttributes({outline: undefined});
    };

    const resetAll_layout_mobile = () => {
        setAttributes({display_mobile: ''});
        setAttributes({breakpoint: ''});
        setAttributes({align_mobile: ''});
        setAttributes({justify_mobile: ''});
        setAttributes({opacity_mobile: ''});
        setAttributes({basis_mobile: ''});
        setAttributes({width_mobile: ''});
        setAttributes({max_width_mobile: ''});
        setAttributes({height_mobile: ''});
        setAttributes({height_custom_mobile: ''});
        setAttributes({space_mobile: ''});
        setAttributes({shape_mobile: ''});
        setAttributes({position_mobile: ''});
        setAttributes({zindex_mobile: ''});
        setAttributes({top_mobile: ''});
        setAttributes({right_mobile: ''});
        setAttributes({bottom_mobile: ''});
        setAttributes({left_mobile: ''});
        setAttributes({order_mobile: ''});
        setAttributes({translate_mobile: ''});
        setAttributes({padding_mobile: {}});
        setAttributes({margin_mobile: {}});
        setAttributes({gap_mobile: {}});
        setAttributes({rounded_mobile: ''});
        setAttributes({font_size_mobile: ''});
        setAttributes({line_height_mobile: ''});
        setAttributes({text_align_mobile: ''});
        setAttributes({flex_wrap_mobile: ''});
    };

    const resetAll_hover = () => {
        setAttributes({scale_hover: ''});
        setAttributes({opacity_hover: ''});
        setAttributes({padding_hover: ''});
        setAttributes({translate_hover: ''});
    };


    /*createHigherOrderComponent((BlockEdit) => {

        return (props) => {

            return <></>;
        };

    }, 'withClientIdClassName')*/


    return <>
        <BlockEdit key="edit" {...blockProps} />
        <InspectorControls group="styles">

            <ToolsPanel label={'Layout'} resetAll={resetAll_layout}>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes.display || ''}
                    label={'Display'}
                    onDeselect={() => setAttributes({display: ''})}
                >
                    <Display defaultValue={attributes.display || ''} callback={(newValue) => {
                        setAttributes({display: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes.container || ''}
                    label={'Container'}
                    onDeselect={() => setAttributes({container: ''})}
                >
                    <Container defaultValue={attributes.container || ''} callback={(newValue) => {
                        setAttributes({container: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes.align || ''}
                    label={'Align'}
                    onDeselect={() => setAttributes({align: ''})}
                >
                    <Align defaultValue={attributes.align || null} callback={(newValue) => {
                        setAttributes({align: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes.justify || ''}
                    label={'Justify'}
                    onDeselect={() => setAttributes({justify: ''})}
                >
                    <Justify defaultValue={attributes.justify || ''} callback={(newValue) => {
                        setAttributes({justify: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes.opacity || ''}
                    label={'Opacity'}
                    onDeselect={() => setAttributes({opacity: ''})}
                >
                    <Opacity defaultValue={attributes.opacity || 100} callback={(newValue) => {
                        setAttributes({opacity: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes.basis || ''}
                    label={'Basis'}
                    onDeselect={() => setAttributes({basis: ''})}
                >
                    <Basis defaultValue={attributes.basis || ''} callback={(newValue) => {
                        setAttributes({basis: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes.width || ''}
                    label={'Width'}
                    onDeselect={() => setAttributes({width: ''})}
                >
                    <Width defaultValue={attributes.width || ''} callback={(newValue) => {
                        setAttributes({width: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes.max_width || ''}
                    label={'Max-Width'}
                    onDeselect={() => setAttributes({max_width: ''})}
                >
                    <Width label={'Max-Width'} defaultValue={attributes.max_width || ''}
                           callback={(newValue) => {
                               setAttributes({max_width: newValue});
                           }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes.height || ''}
                    label={'Height'}
                    onDeselect={() => setAttributes({height: ''})}
                >
                    <Height defaultValue={attributes.height || ''} callback={(newValue) => {
                        setAttributes({height: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes.height_custom || ''}
                    label={'Height Custom'}
                    onDeselect={() => setAttributes({height_custom: ''})}
                >
                    <HeightCustom defaultValue={attributes.height_custom || ''} callback={(newValue) => {
                        setAttributes({height_custom: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes.flex_wrap || ''}
                    label={'Flex Wrap'}
                    onDeselect={() => setAttributes({flex_wrap: ''})}
                >
                    <FlexWrap defaultValue={attributes.flex_wrap || ''} callback={(newValue) => {
                        setAttributes({flex_wrap: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes.space || ''}
                    label={'Space'}
                    onDeselect={() => setAttributes({space: ''})}
                >
                    <Space defaultValue={attributes.space || ''} callback={(newValue) => {
                        setAttributes({space: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes.position || ''}
                    label={'Position'}
                    onDeselect={() => setAttributes({position: ''})}
                >
                    <Position defaultValue={attributes.position || ''} callback={(newValue) => {
                        setAttributes({position: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes.zindex || ''}
                    label={'Z-Index'}
                    onDeselect={() => setAttributes({zindex: ''})}
                >
                    <ZIndex defaultValue={attributes.zindex || ''} callback={(newValue) => {
                        setAttributes({zindex: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    hasValue={() => !!attributes.top || !!attributes.right || !!attributes.bottom || !!attributes.left || ''}
                    label={'Box Position'}
                    onDeselect={() => setAttributes({top: '', right: '', bottom: '', left: ''})}
                >
                    <BoxPosition topValue={attributes.top || ''}
                                 rightValue={attributes.right || ''}
                                 bottomValue={attributes.bottom || ''}
                                 leftValue={attributes.left || ''}
                                 callback={(top, right, bottom, left) => {
                                     setAttributes({top: top, right: right, bottom: bottom, left: left});
                                 }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes.overflow || ''}
                    label={'Overflow'}
                    onDeselect={() => setAttributes({overflow: ''})}
                >
                    <Overflow defaultValue={attributes.overflow || ''} callback={(newValue) => {
                        setAttributes({overflow: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes.shape || ''}
                    label={'Shape'}
                    onDeselect={() => setAttributes({shape: ''})}
                >
                    <Shape defaultValue={attributes.shape || ''} callback={(newValue) => {
                        setAttributes({shape: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes.order || undefined}
                    label={'Order'}
                    onDeselect={() => setAttributes({order: undefined})}
                >
                    <Order defaultValue={attributes.order || undefined} callback={(newValue) => {
                        setAttributes({order: newValue});
                    }}/>
                </ToolsPanelItem>

                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes.outline_offset || ''}
                    label={'Outline Offset'}
                    onDeselect={() => setAttributes({outline_offset: ''})}
                >
                    <OutlineOffset defaultValue={attributes.outline_offset || ''} callback={(newValue) => {
                        setAttributes({outline_offset: newValue});
                    }}/>
                </ToolsPanelItem>

                <ToolsPanelItem
                    hasValue={() => !!attributes.translate || undefined}
                    label={'Translate'}
                    onDeselect={() => setAttributes({translate: undefined})}
                >
                    <Translate defaultValue={attributes.translate || undefined} callback={(newValue) => {
                        setAttributes({translate: newValue});
                    }}/>
                </ToolsPanelItem>

                <ToolsPanelItem
                    hasValue={() => !!attributes.outline || undefined}
                    label={'Outline'}
                    onDeselect={() => setAttributes({outline: undefined})}
                >
                    <Outline defaultValue={attributes.outline || undefined} callback={(newValue) => {
                        setAttributes({outline: newValue});
                    }}/>
                </ToolsPanelItem>

            </ToolsPanel>
            <ToolsPanel label={'Mobile'} resetAll={resetAll_layout_mobile}>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes.display_mobile || ''}
                    label={'Display'}
                    onDeselect={() => setAttributes({display_mobile: ''})}
                >
                    <Display defaultValue={attributes.display_mobile || ''} callback={(newValue) => {
                        setAttributes({display_mobile: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes.breakpoint || ''}
                    label={'Breakpoint'}
                    onDeselect={() => setAttributes({breakpoint: ''})}
                >
                    <Breakpoint defaultValue={attributes.breakpoint || ''} callback={(newValue) => {
                        setAttributes({breakpoint: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes.align_mobile || ''}
                    label={'Align'}
                    onDeselect={() => setAttributes({align_mobile: ''})}
                >
                    <Align defaultValue={attributes.align_mobile || ''} callback={(newValue) => {
                        setAttributes({align_mobile: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes.justify_mobile || ''}
                    label={'Justify'}
                    onDeselect={() => setAttributes({justify_mobile: ''})}
                >
                    <Justify defaultValue={attributes.justify_mobile || ''} callback={(newValue) => {
                        setAttributes({justify_mobile: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes.opacity_mobile || ''}
                    label={'Opacity'}
                    onDeselect={() => setAttributes({opacity_mobile: ''})}
                >
                    <Opacity defaultValue={attributes.opacity_mobile || 100} callback={(newValue) => {
                        setAttributes({opacity_mobile: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes.basis_mobile || ''}
                    label={'Basis'}
                    onDeselect={() => setAttributes({basis_mobile: ''})}
                >
                    <Basis defaultValue={attributes.basis_mobile || ''} callback={(newValue) => {
                        setAttributes({basis_mobile: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes.width_mobile || ''}
                    label={'Width'}
                    onDeselect={() => setAttributes({width_mobile: ''})}
                >
                    <Width defaultValue={attributes.width_mobile || ''} callback={(newValue) => {
                        setAttributes({width_mobile: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes.max_width_mobile || ''}
                    label={'Max-Width'}
                    onDeselect={() => setAttributes({max_width_mobile: ''})}
                >
                    <Width label={'Max-Width'} defaultValue={attributes.max_width_mobile || ''}
                           callback={(newValue) => {
                               setAttributes({max_width_mobile: newValue});
                           }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes.height_mobile || ''}
                    label={'Height'}
                    onDeselect={() => setAttributes({height_mobile: ''})}
                >
                    <Height defaultValue={attributes.height_mobile || ''} callback={(newValue) => {
                        setAttributes({height_mobile: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes.height_custom_mobile || ''}
                    label={'Height Custom'}
                    onDeselect={() => setAttributes({height_custom_mobile: ''})}
                >
                    <HeightCustom defaultValue={attributes.height_custom_mobile || ''}
                                  callback={(newValue) => {
                                      setAttributes({height_custom_mobile: newValue});
                                  }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes.space_mobile || ''}
                    label={'Space'}
                    onDeselect={() => setAttributes({space_mobile: ''})}
                >
                    <Space defaultValue={attributes.space_mobile || ''} callback={(newValue) => {
                        setAttributes({space_mobile: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes.shape_mobile || ''}
                    label={'Shape'}
                    onDeselect={() => setAttributes({shape_mobile: ''})}
                >
                    <Shape defaultValue={attributes.shape_mobile || ''} callback={(newValue) => {
                        setAttributes({shape_mobile: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes.flex_wrap_mobile || ''}
                    label={'Flex Wrap'}
                    onDeselect={() => setAttributes({flex_wrap_mobile: ''})}
                >
                    <FlexWrap defaultValue={attributes.flex_wrap_mobile || ''} callback={(newValue) => {
                        setAttributes({flex_wrap_mobile: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes.position_mobile || ''}
                    label={'Position'}
                    onDeselect={() => setAttributes({position_mobile: ''})}
                >
                    <Position defaultValue={attributes.position_mobile || ''} callback={(newValue) => {
                        setAttributes({position_mobile: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes.zindex_mobile || ''}
                    label={'Z-Index'}
                    onDeselect={() => setAttributes({zindex_mobile: ''})}
                >
                    <ZIndex defaultValue={attributes.zindex_mobile || ''} callback={(newValue) => {
                        setAttributes({zindex_mobile: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    hasValue={() => !!attributes.top_mobile || !!attributes.right_mobile || !!attributes.bottom_mobile || !!attributes.left_mobile || ''}
                    label={'Box Position'}
                    onDeselect={() => setAttributes({
                        top_mobile: '',
                        right_mobile: '',
                        bottom_mobile: '',
                        left_mobile: ''
                    })}
                >
                    <BoxPosition topValue={attributes.top_mobile || ''}
                                 rightValue={attributes.right_mobile || ''}
                                 bottomValue={attributes.bottom_mobile || ''}
                                 leftValue={attributes.left_mobile || ''}
                                 callback={(top, right, bottom, left) => {
                                     setAttributes({
                                         top_mobile: top,
                                         right_mobile: right,
                                         bottom_mobile: bottom,
                                         left_mobile: left
                                     });
                                 }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes.order_mobile || undefined}
                    label={'Order'}
                    onDeselect={() => setAttributes({order_mobile: undefined})}
                >
                    <Order defaultValue={attributes.order_mobile || undefined} callback={(newValue) => {
                        setAttributes({order_mobile: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    hasValue={() => !!attributes.translate_mobile || undefined}
                    label={'Translate'}
                    onDeselect={() => setAttributes({translate_mobile: undefined})}
                >
                    <Translate label={'Translate'}
                               defaultValue={attributes.translate_mobile || {}}
                               callback={(newValue) => {
                                   setAttributes({translate_mobile: newValue});
                               }}/>
                </ToolsPanelItem>

                <ToolsPanelItem
                    hasValue={() => !!attributes.padding_mobile || undefined}
                    label={'Padding'}
                    onDeselect={() => setAttributes({padding_mobile: undefined})}
                >
                    <Padding defaultValue={attributes.padding_mobile || {}} callback={(newValue) => {
                        setAttributes({padding_mobile: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    hasValue={() => !!attributes.margin_mobile || undefined}
                    label={'Margin'}
                    onDeselect={() => setAttributes({margin_mobile: undefined})}
                >
                    <Margin defaultValue={attributes.margin_mobile || {}} callback={(newValue) => {
                        setAttributes({margin_mobile: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    hasValue={() => !!attributes.gap_mobile || undefined}
                    label={'Gap'}
                    onDeselect={() => setAttributes({gap_mobile: undefined})}
                >
                    <Gap defaultValue={attributes.gap_mobile || {}} callback={(newValue) => {
                        setAttributes({gap_mobile: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    hasValue={() => !!attributes.rounded_mobile || undefined}
                    label={'Rounded'}
                    onDeselect={() => setAttributes({rounded_mobile: undefined})}
                >
                    <Rounded defaultValue={attributes.rounded_mobile || {}} callback={(newValue) => {
                        setAttributes({rounded_mobile: newValue});
                    }}/>
                </ToolsPanelItem>


                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes.font_size_mobile || ''}
                    label={'Font Size'}
                    onDeselect={() => setAttributes({font_size_mobile: ''})}
                >
                    <FontSize defaultValue={attributes.font_size_mobile || ''} callback={(newValue) => {
                        setAttributes({font_size_mobile: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes.line_height_mobile || ''}
                    label={'Line Height'}
                    onDeselect={() => setAttributes({line_height_mobile: ''})}
                >
                    <LineHeight defaultValue={attributes.line_height_mobile || ''} callback={(newValue) => {
                        setAttributes({line_height_mobile: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes.text_align_mobile || ''}
                    label={'Text Align'}
                    onDeselect={() => setAttributes({text_align_mobile: ''})}
                >
                    <TextAlign defaultValue={attributes.text_align_mobile || ''} callback={(newValue) => {
                        setAttributes({text_align_mobile: newValue});
                    }}/>
                </ToolsPanelItem>
            </ToolsPanel>

            <ToolsPanel label={'Hover'} resetAll={resetAll_hover}>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes.opacity_hover || ''}
                    label={'Opacity'}
                    onDeselect={() => setAttributes({opacity_hover: ''})}
                >
                    <Opacity defaultValue={attributes.opacity_hover || ''} callback={(newValue) => {
                        setAttributes({opacity_hover: newValue});
                    }}/>
                </ToolsPanelItem>
            </ToolsPanel>

            <PanelColorSettings
                title={'Colors'}
                enableAlpha
                __experimentalIsRenderedInSidebar
                colorSettings={[
                    {
                        slug: 'text_hover',
                        label: 'Text Hover'
                    },
                    {
                        slug: 'background_hover',
                        label: 'Background Hover'
                    },
                    {
                        slug: 'links_hover',
                        label: 'Links Hover'
                    },
                    {
                        slug: 'border_color_hover',
                        label: 'Border Hover'
                    },
                    {
                        slug: 'text_mobile',
                        label: 'Text Mobile'
                    },
                    {
                        slug: 'background_mobile',
                        label: 'Background Mobile'
                    }
                ].map((color_control) => {
                    return {
                        value: attributes[color_control.slug],
                        onChange: (color) => setAttributes({[color_control.slug]: color}),
                        label: color_control.label.trim(),
                        isShownByDefault: false
                    }
                })}
            />


        </InspectorControls>
    </>;
}
