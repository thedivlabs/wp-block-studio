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

const blockAttributes = {
    layout: {
        display: {
            type: 'string'
        },
        container: {
            type: 'string'
        },
        align: {
            type: 'string'
        },
        justify: {
            type: 'string'
        },
        opacity: {
            type: 'integer'
        },
        basis: {
            type: 'integer'
        },
        width: {
            type: 'string'
        },
        maxWidth: {
            type: 'string'
        },
        height: {
            type: 'string'
        },
        heightCustom: {
            type: 'string'
        },
        flexWrap: {
            type: 'string'
        },
        space: {
            type: 'string'
        },
        position: {
            type: 'string'
        },
        zIndex: {
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
        overflow: {
            type: 'string'
        },
        shape: {
            type: 'string'
        },
        order: {
            type: 'string'
        },
        translate: {
            type: 'object'
        },
        outline: {
            type: 'object'
        },
    },
    mobile: {
        displayMobile: {
            type: 'string'
        },
        breakpoint: {
            type: 'string'
        },
        alignMobile: {
            type: 'string'
        },
        justifyMobile: {
            type: 'string'
        },
        opacityMobile: {
            type: 'string'
        },
        basisMobile: {
            type: 'integer'
        },
        widthMobile: {
            type: 'string'
        },
        maxWidthMobile: {
            type: 'string'
        },
        heightMobile: {
            type: 'string'
        },
        heightCustomMobile: {
            type: 'string'
        },
        spaceMobile: {
            type: 'string'
        },
        shapeMobile: {
            type: 'string'
        },
        positionMobile: {
            type: 'string'
        },
        zIndexMobile: {
            type: 'string'
        },
        topMobile: {
            type: 'string'
        },
        rightMobile: {
            type: 'string'
        },
        bottomMobile: {
            type: 'string'
        },
        leftMobile: {
            type: 'string'
        },
        orderMobile: {
            type: 'string'
        },
        translateMobile: {
            type: 'object'
        },
        paddingMobile: {
            type: 'object'
        },
        marginMobile: {
            type: 'object'
        },
        gapMobile: {
            type: 'object'
        },
        roundedMobile: {
            type: 'integer'
        },
        fontSizeMobile: {
            type: 'string'
        },
        lineHeightMobile: {
            type: 'string'
        },
        textAlignMobile: {
            type: 'string'
        },
        flexWrapMobile: {
            type: 'string'
        },
    },
    hover: {
        opacityHover: {
            type: 'integer'
        }
    },
    colors: {
        textHover: {
            type: 'string'
        },
        backgroundHover: {
            type: 'string'
        },
        borderColorHover: {
            type: 'string'
        },
        textMobile: {
            type: 'string'
        },
        backgroundMobile: {
            type: 'string'
        },
    }
};

export function LayoutProps(attributes) {

    console.log(attributes);

    const style = {};

    return {
        style: style
    };
}

export function LayoutAttributes() {
    return Object.assign({}, blockAttributes.layout, blockAttributes.mobile, blockAttributes.hover, blockAttributes.colors);
}

export function Layout({blockProps, attributes = {}, setAttributes}) {

    const resetAll_layout = () => {
        setAttributes(Object.keys(blockAttributes.layout).reduce((o, key) => ({...o, [key]: undefined}), {}))
    };

    const resetAll_layout_mobile = () => {
        setAttributes(Object.keys(blockAttributes.mobile).reduce((o, key) => ({...o, [key]: undefined}), {}))
    };

    const resetAll_hover = () => {
        setAttributes(Object.keys(blockAttributes.hover).reduce((o, key) => ({...o, [key]: undefined}), {}))
    };

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
                    style={{gridColumn: 'span 2'}}
                    hasValue={() => !!attributes.opacity || ''}
                    label={'Opacity'}
                    onDeselect={() => setAttributes({opacity: ''})}
                >
                    <Opacity defaultValue={attributes.opacity || 100} callback={(newValue) => {
                        setAttributes({opacity: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 2'}}
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
                    hasValue={() => !!attributes.maxWidth || ''}
                    label={'Max-Width'}
                    onDeselect={() => setAttributes({maxWidth: ''})}
                >
                    <Width label={'Max-Width'} defaultValue={attributes.maxWidth || ''}
                           callback={(newValue) => {
                               setAttributes({maxWidth: newValue});
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
                    hasValue={() => !!attributes.heightCustom || ''}
                    label={'Height Custom'}
                    onDeselect={() => setAttributes({heightCustom: ''})}
                >
                    <HeightCustom defaultValue={attributes.heightCustom || ''} callback={(newValue) => {
                        setAttributes({heightCustom: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes.flexWrap || ''}
                    label={'Flex Wrap'}
                    onDeselect={() => setAttributes({flexWrap: ''})}
                >
                    <FlexWrap defaultValue={attributes.flexWrap || ''} callback={(newValue) => {
                        setAttributes({flexWrap: newValue});
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
                    hasValue={() => !!attributes.zIndex || ''}
                    label={'Z-Index'}
                    onDeselect={() => setAttributes({zIndex: ''})}
                >
                    <ZIndex defaultValue={attributes.zIndex || ''} callback={(newValue) => {
                        setAttributes({zIndex: newValue});
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
                    hasValue={() => !!attributes.outlineOffset || ''}
                    label={'Outline Offset'}
                    onDeselect={() => setAttributes({outlineOffset: ''})}
                >
                    <OutlineOffset defaultValue={attributes.outlineOffset || ''} callback={(newValue) => {
                        setAttributes({outlineOffset: newValue});
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
                    hasValue={() => !!attributes.displayMobile || ''}
                    label={'Display'}
                    onDeselect={() => setAttributes({displayMobile: ''})}
                >
                    <Display defaultValue={attributes.displayMobile || ''} callback={(newValue) => {
                        setAttributes({displayMobile: newValue});
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
                    hasValue={() => !!attributes.alignMobile || ''}
                    label={'Align'}
                    onDeselect={() => setAttributes({alignMobile: ''})}
                >
                    <Align defaultValue={attributes.alignMobile || ''} callback={(newValue) => {
                        setAttributes({alignMobile: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes.justifyMobile || ''}
                    label={'Justify'}
                    onDeselect={() => setAttributes({justifyMobile: ''})}
                >
                    <Justify defaultValue={attributes.justifyMobile || ''} callback={(newValue) => {
                        setAttributes({justifyMobile: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 2'}}
                    hasValue={() => !!attributes.opacityMobile || ''}
                    label={'Opacity'}
                    onDeselect={() => setAttributes({opacityMobile: ''})}
                >
                    <Opacity defaultValue={attributes.opacityMobile || 100} callback={(newValue) => {
                        setAttributes({opacityMobile: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 2'}}
                    hasValue={() => !!attributes.basisMobile || ''}
                    label={'Basis'}
                    onDeselect={() => setAttributes({basisMobile: ''})}
                >
                    <Basis defaultValue={attributes.basisMobile || ''} callback={(newValue) => {
                        setAttributes({basisMobile: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes.widthMobile || ''}
                    label={'Width'}
                    onDeselect={() => setAttributes({widthMobile: ''})}
                >
                    <Width defaultValue={attributes.widthMobile || ''} callback={(newValue) => {
                        setAttributes({widthMobile: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes.maxWidthMobile || ''}
                    label={'Max-Width'}
                    onDeselect={() => setAttributes({maxWidthMobile: ''})}
                >
                    <Width label={'Max-Width'} defaultValue={attributes.maxWidthMobile || ''}
                           callback={(newValue) => {
                               setAttributes({maxWidthMobile: newValue});
                           }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes.heightMobile || ''}
                    label={'Height'}
                    onDeselect={() => setAttributes({heightMobile: ''})}
                >
                    <Height defaultValue={attributes.heightMobile || ''} callback={(newValue) => {
                        setAttributes({heightMobile: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes.heightCustomMobile || ''}
                    label={'Height Custom'}
                    onDeselect={() => setAttributes({heightCustomMobile: ''})}
                >
                    <HeightCustom defaultValue={attributes.heightCustomMobile || ''}
                                  callback={(newValue) => {
                                      setAttributes({heightCustomMobile: newValue});
                                  }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes.spaceMobile || ''}
                    label={'Space'}
                    onDeselect={() => setAttributes({spaceMobile: ''})}
                >
                    <Space defaultValue={attributes.spaceMobile || ''} callback={(newValue) => {
                        setAttributes({spaceMobile: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes.shapeMobile || ''}
                    label={'Shape'}
                    onDeselect={() => setAttributes({shapeMobile: ''})}
                >
                    <Shape defaultValue={attributes.shapeMobile || ''} callback={(newValue) => {
                        setAttributes({shapeMobile: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes.flexWrapMobile || ''}
                    label={'Flex Wrap'}
                    onDeselect={() => setAttributes({flexWrapMobile: ''})}
                >
                    <FlexWrap defaultValue={attributes.flexWrapMobile || ''} callback={(newValue) => {
                        setAttributes({flexWrapMobile: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes.positionMobile || ''}
                    label={'Position'}
                    onDeselect={() => setAttributes({positionMobile: ''})}
                >
                    <Position defaultValue={attributes.positionMobile || ''} callback={(newValue) => {
                        setAttributes({positionMobile: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes.zIndexMobile || ''}
                    label={'Z-Index'}
                    onDeselect={() => setAttributes({zIndexMobile: ''})}
                >
                    <ZIndex defaultValue={attributes.zIndexMobile || ''} callback={(newValue) => {
                        setAttributes({zIndexMobile: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    hasValue={() => !!attributes.topMobile || !!attributes.rightMobile || !!attributes.bottomMobile || !!attributes.leftMobile || ''}
                    label={'Box Position'}
                    onDeselect={() => setAttributes({
                        topMobile: '',
                        rightMobile: '',
                        bottomMobile: '',
                        leftMobile: ''
                    })}
                >
                    <BoxPosition topValue={attributes.topMobile || ''}
                                 rightValue={attributes.rightMobile || ''}
                                 bottomValue={attributes.bottomMobile || ''}
                                 leftValue={attributes.leftMobile || ''}
                                 callback={(top, right, bottom, left) => {
                                     setAttributes({
                                         topMobile: top,
                                         rightMobile: right,
                                         bottomMobile: bottom,
                                         leftMobile: left
                                     });
                                 }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes.orderMobile || undefined}
                    label={'Order'}
                    onDeselect={() => setAttributes({orderMobile: undefined})}
                >
                    <Order defaultValue={attributes.orderMobile || undefined} callback={(newValue) => {
                        setAttributes({orderMobile: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    hasValue={() => !!attributes.translateMobile || undefined}
                    label={'Translate'}
                    onDeselect={() => setAttributes({translateMobile: undefined})}
                >
                    <Translate label={'Translate'}
                               defaultValue={attributes.translateMobile || {}}
                               callback={(newValue) => {
                                   setAttributes({translateMobile: newValue});
                               }}/>
                </ToolsPanelItem>

                <ToolsPanelItem
                    hasValue={() => !!attributes.paddingMobile || undefined}
                    label={'Padding'}
                    onDeselect={() => setAttributes({paddingMobile: undefined})}
                >
                    <Padding defaultValue={attributes.paddingMobile || {}} callback={(newValue) => {
                        setAttributes({paddingMobile: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    hasValue={() => !!attributes.marginMobile || undefined}
                    label={'Margin'}
                    onDeselect={() => setAttributes({marginMobile: undefined})}
                >
                    <Margin defaultValue={attributes.marginMobile || {}} callback={(newValue) => {
                        setAttributes({marginMobile: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    hasValue={() => !!attributes.gapMobile || undefined}
                    label={'Gap'}
                    onDeselect={() => setAttributes({gapMobile: undefined})}
                >
                    <Gap defaultValue={attributes.gapMobile || {}} callback={(newValue) => {
                        setAttributes({gapMobile: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    hasValue={() => !!attributes.roundedMobile || undefined}
                    label={'Rounded'}
                    onDeselect={() => setAttributes({roundedMobile: undefined})}
                >
                    <Rounded defaultValue={attributes.roundedMobile || {}} callback={(newValue) => {
                        setAttributes({roundedMobile: newValue});
                    }}/>
                </ToolsPanelItem>


                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes.fontSizeMobile || ''}
                    label={'Font Size'}
                    onDeselect={() => setAttributes({fontSizeMobile: ''})}
                >
                    <FontSize defaultValue={attributes.fontSizeMobile || ''} callback={(newValue) => {
                        setAttributes({fontSizeMobile: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes.lineHeightMobile || ''}
                    label={'Line Height'}
                    onDeselect={() => setAttributes({lineHeightMobile: ''})}
                >
                    <LineHeight defaultValue={attributes.lineHeightMobile || ''} callback={(newValue) => {
                        setAttributes({lineHeightMobile: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes.textAlignMobile || ''}
                    label={'Text Align'}
                    onDeselect={() => setAttributes({textAlignMobile: ''})}
                >
                    <TextAlign defaultValue={attributes.textAlignMobile || ''} callback={(newValue) => {
                        setAttributes({textAlignMobile: newValue});
                    }}/>
                </ToolsPanelItem>
            </ToolsPanel>

            <ToolsPanel label={'Hover'} resetAll={resetAll_hover}>
                <ToolsPanelItem
                    style={{gridColumn: 'span 2'}}
                    hasValue={() => !!attributes.opacityHover || ''}
                    label={'Opacity'}
                    onDeselect={() => setAttributes({opacityHover: ''})}
                >
                    <Opacity defaultValue={attributes.opacityHover || ''} callback={(newValue) => {
                        setAttributes({opacityHover: newValue});
                    }}/>
                </ToolsPanelItem>
            </ToolsPanel>

            <PanelColorSettings
                title={'Colors'}
                enableAlpha
                __experimentalIsRenderedInSidebar
                colorSettings={[
                    {
                        slug: 'textHover',
                        label: 'Text Hover'
                    },
                    {
                        slug: 'backgroundHover',
                        label: 'Background Hover'
                    },
                    {
                        slug: 'borderColorHover',
                        label: 'Border Hover'
                    },
                    {
                        slug: 'textMobile',
                        label: 'Text Mobile'
                    },
                    {
                        slug: 'backgroundMobile',
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
