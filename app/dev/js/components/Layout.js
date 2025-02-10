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
        'wpbs-display': {
            type: 'string'
        },
        'wpbs-flex-direction': {
            type: 'string'
        },
        'wpbs-container': {
            type: 'string'
        },
        'wpbs-align': {
            type: 'string'
        },
        'wpbs-justify': {
            type: 'string'
        },
        'wpbs-opacity': {
            type: 'integer'
        },
        'wpbs-basis': {
            type: 'integer'
        },
        'wpbs-width': {
            type: 'string'
        },
        'wpbs-max-width': {
            type: 'string'
        },
        'wpbs-height': {
            type: 'string'
        },
        'wpbs-height-custom': {
            type: 'string'
        },
        'wpbs-flex-wrap': {
            type: 'string'
        },
        'wpbs-grow': {
            type: 'string'
        },
        'wpbs-shrink': {
            type: 'string'
        },
        'wpbs-position': {
            type: 'string'
        },
        'wpbs-z-index': {
            type: 'string'
        },
        'wpbs-top': {
            type: 'string'
        },
        'wpbs-right': {
            type: 'string'
        },
        'wpbs-bottom': {
            type: 'string'
        },
        'wpbs-left': {
            type: 'string'
        },
        'wpbs-overflow': {
            type: 'string'
        },
        'wpbs-shape': {
            type: 'string'
        },
        'wpbs-order': {
            type: 'string'
        },
        'wpbs-translate': {
            type: 'object'
        },
        'wpbs-outline': {
            type: 'object'
        },
    },
    mobile: {
        'wpbs-display-mobile': {
            type: 'string'
        },
        'wpbs-breakpoint': {
            type: 'string'
        },
        'wpbs-align-mobile': {
            type: 'string'
        },
        'wpbs-justify-mobile': {
            type: 'string'
        },
        'wpbs-opacity-mobile': {
            type: 'string'
        },
        'wpbs-basis-mobile': {
            type: 'integer'
        },
        'wpbs-width-mobile': {
            type: 'string'
        },
        'wpbs-max-width-mobile': {
            type: 'string'
        },
        'wpbs-height-mobile': {
            type: 'string'
        },
        'wpbs-height-custom-mobile': {
            type: 'string'
        },
        'wpbs-grow-mobile': {
            type: 'string'
        },
        'wpbs-shrink-mobile': {
            type: 'string'
        },
        'wpbs-flex-direction-mobile': {
            type: 'string'
        },
        'wpbs-shape-mobile': {
            type: 'string'
        },
        'wpbs-position-mobile': {
            type: 'string'
        },
        'wpbs-z-index-mobile': {
            type: 'string'
        },
        'wpbs-top-mobile': {
            type: 'string'
        },
        'wpbs-right-mobile': {
            type: 'string'
        },
        'wpbs-bottom-mobile': {
            type: 'string'
        },
        'wpbs-left-mobile': {
            type: 'string'
        },
        'wpbs-order-mobile': {
            type: 'string'
        },
        'wpbs-translate-mobile': {
            type: 'object'
        },
        'wpbs-padding-mobile': {
            type: 'object'
        },
        'wpbs-margin-mobile': {
            type: 'object'
        },
        'wpbs-gap-mobile': {
            type: 'object'
        },
        'wpbs-border-radius-mobile': {
            type: 'integer'
        },
        'wpbs-font-size-mobile': {
            type: 'string'
        },
        'wpbs-line-height-mobile': {
            type: 'string'
        },
        'wpbs-text-align-mobile': {
            type: 'string'
        },
        'wpbs-flex-wrap-mobile': {
            type: 'string'
        },
    },
    hover: {
        'wpbs-opacity-hover': {
            type: 'integer'
        }
    },
    colors: {
        'wpbs-text-color-hover': {
            type: 'string'
        },
        'wpbs-background-color-hove': {
            type: 'string'
        },
        'wpbs-border-color-hover': {
            type: 'string'
        },
        'wpbs-text-color-mobile': {
            type: 'string'
        },
        'wpbs-background-color-mobile': {
            type: 'string'
        },
    }
};


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
                    hasValue={() => !!attributes['wpbs-display'] || ''}
                    label={'Display'}
                    onDeselect={() => setAttributes({['wpbs-display']: ''})}
                >
                    <Display defaultValue={attributes['wpbs-display'] || ''} callback={(newValue) => {
                        setAttributes({['wpbs-display']: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-flex-direction'] || ''}
                    label={'Direction'}
                    onDeselect={() => setAttributes({['wpbs-flex-direction']: ''})}
                >
                    <FlexDirection defaultValue={attributes['wpbs-flex-direction'] || ''} callback={(newValue) => {
                        setAttributes({['wpbs-flex-direction']: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-container'] || ''}
                    label={'Container'}
                    onDeselect={() => setAttributes({['wpbs-container']: ''})}
                >
                    <Container defaultValue={attributes['wpbs-container'] || ''} callback={(newValue) => {
                        setAttributes({['wpbs-container']: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-align'] || ''}
                    label={'Align'}
                    onDeselect={() => setAttributes({['wpbs-align']: ''})}
                >
                    <Align defaultValue={attributes['wpbs-align'] || null} callback={(newValue) => {
                        setAttributes({['wpbs-align']: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-justify'] || ''}
                    label={'Justify'}
                    onDeselect={() => setAttributes({['wpbs-justify']: ''})}
                >
                    <Justify defaultValue={attributes['wpbs-justify'] || ''} callback={(newValue) => {
                        setAttributes({['wpbs-justify']: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 2'}}
                    hasValue={() => !!attributes['wpbs-opacity'] || ''}
                    label={'Opacity'}
                    onDeselect={() => setAttributes({['wpbs-opacity']: ''})}
                >
                    <Opacity defaultValue={attributes['wpbs-opacity'] || 100} callback={(newValue) => {
                        setAttributes({['wpbs-opacity']: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 2'}}
                    hasValue={() => !!attributes['wpbs-basis'] || ''}
                    label={'Basis'}
                    onDeselect={() => setAttributes({['wpbs-basis']: ''})}
                >
                    <Basis defaultValue={attributes['wpbs-basis'] || ''} callback={(newValue) => {
                        setAttributes({['wpbs-basis']: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-width'] || ''}
                    label={'Width'}
                    onDeselect={() => setAttributes({['wpbs-width']: ''})}
                >
                    <Width defaultValue={attributes['wpbs-width'] || ''} callback={(newValue) => {
                        setAttributes({['wpbs-width']: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-max-width'] || ''}
                    label={'Max-Width'}
                    onDeselect={() => setAttributes({['wpbs-max-width']: ''})}
                >
                    <Width label={'Max-Width'} defaultValue={attributes['wpbs-max-width'] || ''}
                           callback={(newValue) => {
                               setAttributes({['wpbs-max-width']: newValue});
                           }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-height'] || ''}
                    label={'Height'}
                    onDeselect={() => setAttributes({['wpbs-height']: ''})}
                >
                    <Height defaultValue={attributes['wpbs-height'] || ''} callback={(newValue) => {
                        setAttributes({['wpbs-height']: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-height-custom'] || ''}
                    label={'Height Custom'}
                    onDeselect={() => setAttributes({['wpbs-height-custom']: ''})}
                >
                    <HeightCustom defaultValue={attributes['wpbs-height-custom'] || ''} callback={(newValue) => {
                        setAttributes({['wpbs-height-custom']: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-flex-wrap'] || ''}
                    label={'Flex Wrap'}
                    onDeselect={() => setAttributes({['wpbs-flex-wrap']: ''})}
                >
                    <FlexWrap defaultValue={attributes['wpbs-flex-wrap'] || ''} callback={(newValue) => {
                        setAttributes({['wpbs-flex-wrap']: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-grow'] || ''}
                    label={'Grow'}
                    onDeselect={() => setAttributes({['wpbs-grow']: ''})}
                >
                    <Grow defaultValue={attributes['wpbs-grow'] || ''} callback={(newValue) => {
                        setAttributes({['wpbs-grow']: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-shrink'] || ''}
                    label={'Shrink'}
                    onDeselect={() => setAttributes({['wpbs-shrink']: ''})}
                >
                    <Shrink defaultValue={attributes['wpbs-shrink'] || ''} callback={(newValue) => {
                        setAttributes({['wpbs-shrink']: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-position'] || ''}
                    label={'Position'}
                    onDeselect={() => setAttributes({['wpbs-position']: ''})}
                >
                    <Position defaultValue={attributes['wpbs-position'] || ''} callback={(newValue) => {
                        setAttributes({['wpbs-position']: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-z-index'] || ''}
                    label={'Z-Index'}
                    onDeselect={() => setAttributes({['wpbs-z-index']: ''})}
                >
                    <ZIndex defaultValue={attributes['wpbs-z-index'] || ''} callback={(newValue) => {
                        setAttributes({['wpbs-z-index']: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    hasValue={() => !!attributes['wpbs-top'] || !!attributes['wpbs-right'] || !!attributes['wpbs-bottom'] || !!attributes['wpbs-left'] || ''}
                    label={'Box Position'}
                    onDeselect={() => setAttributes({
                        ['wpbs-top']: '',
                        ['wpbs-right']: '',
                        ['wpbs-bottom']: '',
                        ['wpbs-left']: ''
                    })}
                >
                    <BoxPosition topValue={attributes['wpbs-top'] || ''}
                                 rightValue={attributes['wpbs-right'] || ''}
                                 bottomValue={attributes['wpbs-bottom'] || ''}
                                 leftValue={attributes['wpbs-left'] || ''}
                                 callback={(top, right, bottom, left) => {
                                     setAttributes({
                                         ['wpbs-top']: top,
                                         ['wpbs-right']: right,
                                         ['wpbs-bottom']: bottom,
                                         ['wpbs-left']: left
                                     });
                                 }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-overflow'] || ''}
                    label={'Overflow'}
                    onDeselect={() => setAttributes({['wpbs-overflow']: ''})}
                >
                    <Overflow defaultValue={attributes['wpbs-overflow'] || ''} callback={(newValue) => {
                        setAttributes({['wpbs-overflow']: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-shape'] || ''}
                    label={'Shape'}
                    onDeselect={() => setAttributes({['wpbs-shape']: ''})}
                >
                    <Shape defaultValue={attributes['wpbs-shape'] || ''} callback={(newValue) => {
                        setAttributes({['wpbs-shape']: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-order'] || undefined}
                    label={'Order'}
                    onDeselect={() => setAttributes({['wpbs-order']: undefined})}
                >
                    <Order defaultValue={attributes['wpbs-order'] || undefined} callback={(newValue) => {
                        setAttributes({['wpbs-order']: newValue});
                    }}/>
                </ToolsPanelItem>

                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-outline-offset'] || ''}
                    label={'Outline Offset'}
                    onDeselect={() => setAttributes({['wpbs-outline-offset']: ''})}
                >
                    <OutlineOffset defaultValue={attributes['wpbs-outline-offset'] || ''} callback={(newValue) => {
                        setAttributes({['wpbs-outline-offset']: newValue});
                    }}/>
                </ToolsPanelItem>

                <ToolsPanelItem
                    hasValue={() => !!attributes['wpbs-translate'] || undefined}
                    label={'Translate'}
                    onDeselect={() => setAttributes({['wpbs-translate']: undefined})}
                >
                    <Translate defaultValue={attributes['wpbs-translate'] || undefined} callback={(newValue) => {
                        setAttributes({['wpbs-translate']: newValue});
                    }}/>
                </ToolsPanelItem>

                <ToolsPanelItem
                    hasValue={() => !!attributes['wpbs-outline'] || undefined}
                    label={'Outline'}
                    onDeselect={() => setAttributes({['wpbs-outline']: undefined})}
                >
                    <Outline defaultValue={attributes['wpbs-outline'] || undefined} callback={(newValue) => {
                        setAttributes({['wpbs-outline']: newValue});
                    }}/>
                </ToolsPanelItem>

            </ToolsPanel>

            <ToolsPanel label={'Mobile'} resetAll={resetAll_layout_mobile}>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-display-mobile'] || ''}
                    label={'Display'}
                    onDeselect={() => setAttributes({['wpbs-display-mobile']: ''})}
                >
                    <Display defaultValue={attributes['wpbs-display-mobile'] || ''} callback={(newValue) => {
                        setAttributes({['wpbs-display-mobile']: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-breakpoint'] || ''}
                    label={'Breakpoint'}
                    onDeselect={() => setAttributes({['wpbs-breakpoint']: ''})}
                >
                    <Breakpoint defaultValue={attributes['wpbs-breakpoint'] || ''} callback={(newValue) => {
                        setAttributes({['wpbs-breakpoint']: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-align-mobile'] || ''}
                    label={'Align'}
                    onDeselect={() => setAttributes({['wpbs-align-mobile']: ''})}
                >
                    <Align defaultValue={attributes['wpbs-align-mobile'] || ''} callback={(newValue) => {
                        setAttributes({['wpbs-align-mobile']: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-justify-mobile'] || ''}
                    label={'Justify'}
                    onDeselect={() => setAttributes({['wpbs-justify-mobile']: ''})}
                >
                    <Justify defaultValue={attributes['wpbs-justify-mobile'] || ''} callback={(newValue) => {
                        setAttributes({['wpbs-justify-mobile']: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-grow-mobile'] || ''}
                    label={'Grow'}
                    onDeselect={() => setAttributes({['wpbs-grow-mobile']: ''})}
                >
                    <Grow defaultValue={attributes['wpbs-grow-mobile'] || ''} callback={(newValue) => {
                        setAttributes({['wpbs-grow-mobile']: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-shrink-mobile'] || ''}
                    label={'Shrink'}
                    onDeselect={() => setAttributes({['wpbs-shrink-mobile']: ''})}
                >
                    <Shrink defaultValue={attributes['wpbs-shrink-mobile'] || ''} callback={(newValue) => {
                        setAttributes({['wpbs-shrink-mobile']: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 2'}}
                    hasValue={() => !!attributes['wpbs-opacity-mobile'] || ''}
                    label={'Opacity'}
                    onDeselect={() => setAttributes({['wpbs-opacity-mobile']: ''})}
                >
                    <Opacity defaultValue={attributes['wpbs-opacity-mobile'] || 100} callback={(newValue) => {
                        setAttributes({['wpbs-opacity-mobile']: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 2'}}
                    hasValue={() => !!attributes['wpbs-basis-mobile'] || ''}
                    label={'Basis'}
                    onDeselect={() => setAttributes({['wpbs-basis-mobile']: ''})}
                >
                    <Basis defaultValue={attributes['wpbs-basis-mobile'] || ''} callback={(newValue) => {
                        setAttributes({['wpbs-basis-mobile']: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-width-mobile'] || ''}
                    label={'Width'}
                    onDeselect={() => setAttributes({['wpbs-width-mobile']: ''})}
                >
                    <Width defaultValue={attributes['wpbs-width-mobile'] || ''} callback={(newValue) => {
                        setAttributes({['wpbs-width-mobile']: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-max-width-mobile'] || ''}
                    label={'Max-Width'}
                    onDeselect={() => setAttributes({['wpbs-max-width-mobile']: ''})}
                >
                    <Width label={'Max-Width'} defaultValue={attributes['wpbs-max-width-mobile'] || ''}
                           callback={(newValue) => {
                               setAttributes({['wpbs-max-width-mobile']: newValue});
                           }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-height-mobile'] || ''}
                    label={'Height'}
                    onDeselect={() => setAttributes({['wpbs-height-mobile']: ''})}
                >
                    <Height defaultValue={attributes['wpbs-height-mobile'] || ''} callback={(newValue) => {
                        setAttributes({['wpbs-height-mobile']: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-height-custom-mobile'] || ''}
                    label={'Height Custom'}
                    onDeselect={() => setAttributes({['wpbs-height-custom-mobile']: ''})}
                >
                    <HeightCustom defaultValue={attributes['wpbs-height-custom-mobile'] || ''}
                                  callback={(newValue) => {
                                      setAttributes({['wpbs-height-custom-mobile']: newValue});
                                  }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-shape-mobile'] || ''}
                    label={'Shape'}
                    onDeselect={() => setAttributes({['wpbs-shape-mobile']: ''})}
                >
                    <Shape defaultValue={attributes['wpbs-shape-mobile'] || ''} callback={(newValue) => {
                        setAttributes({['wpbs-shape-mobile']: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-flex-wrap-mobile'] || ''}
                    label={'Flex Wrap'}
                    onDeselect={() => setAttributes({['wpbs-flex-wrap-mobile']: ''})}
                >
                    <FlexWrap defaultValue={attributes['wpbs-flex-wrap-mobile'] || ''} callback={(newValue) => {
                        setAttributes({['wpbs-flex-wrap-mobile']: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-position-mobile'] || ''}
                    label={'Position'}
                    onDeselect={() => setAttributes({['wpbs-position-mobile']: ''})}
                >
                    <Position defaultValue={attributes['wpbs-position-mobile'] || ''} callback={(newValue) => {
                        setAttributes({['wpbs-position-mobile']: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-z-index-mobile'] || ''}
                    label={'Z-Index'}
                    onDeselect={() => setAttributes({['wpbs-z-index-mobile']: ''})}
                >
                    <ZIndex defaultValue={attributes['wpbs-z-index-mobile'] || ''} callback={(newValue) => {
                        setAttributes({['wpbs-z-index-mobile']: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    hasValue={() => !!attributes['wpbs-top-mobile'] || !!attributes['wpbs-right-mobile'] || !!attributes['wpbs-bottom-mobile'] || !!attributes['wpbs-left-mobile'] || ''}
                    label={'Box Position'}
                    onDeselect={() => setAttributes({
                        ['wpbs-top-mobile']: '',
                        ['wpbs-right-mobile']: '',
                        ['wpbs-bottom-mobile']: '',
                        ['wpbs-left-mobile']: ''
                    })}
                >
                    <BoxPosition topValue={attributes['wpbs-top-mobile'] || ''}
                                 rightValue={attributes['wpbs-right-mobile'] || ''}
                                 bottomValue={attributes['wpbs-bottom-mobile'] || ''}
                                 leftValue={attributes['wpbs-left-mobile'] || ''}
                                 callback={(top, right, bottom, left) => {
                                     setAttributes({
                                         ['wpbs-top-mobile']: top,
                                         ['wpbs-right-mobile']: right,
                                         ['wpbs-bottom-mobile']: bottom,
                                         ['wpbs-left-mobile']: left
                                     });
                                 }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-order-mobile'] || undefined}
                    label={'Order'}
                    onDeselect={() => setAttributes({['wpbs-order-mobile']: undefined})}
                >
                    <Order defaultValue={attributes['wpbs-order-mobile'] || undefined} callback={(newValue) => {
                        setAttributes({['wpbs-order-mobile']: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    hasValue={() => !!attributes['wpbs-translate-mobile'] || undefined}
                    label={'Translate'}
                    onDeselect={() => setAttributes({['wpbs-translate-mobile']: undefined})}
                >
                    <Translate label={'Translate'}
                               defaultValue={attributes['wpbs-translate-mobile'] || {}}
                               callback={(newValue) => {
                                   setAttributes({['wpbs-translate-mobile']: newValue});
                               }}/>
                </ToolsPanelItem>

                <ToolsPanelItem
                    hasValue={() => !!attributes['wpbs-padding-mobile'] || undefined}
                    label={'Padding'}
                    onDeselect={() => setAttributes({['wpbs-padding-mobile']: undefined})}
                >
                    <Padding defaultValue={attributes['wpbs-padding-mobile'] || {}} callback={(newValue) => {
                        setAttributes({['wpbs-padding-mobile']: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    hasValue={() => !!attributes['wpbs-margin-mobile'] || undefined}
                    label={'Margin'}
                    onDeselect={() => setAttributes({['wpbs-margin-mobile']: undefined})}
                >
                    <Margin defaultValue={attributes['wpbs-margin-mobile'] || {}} callback={(newValue) => {
                        setAttributes({['wpbs-margin-mobile']: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    hasValue={() => !!attributes['wpbs-gap-mobile'] || undefined}
                    label={'Gap'}
                    onDeselect={() => setAttributes({['wpbs-gap-mobile']: undefined})}
                >
                    <Gap defaultValue={attributes['wpbs-gap-mobile'] || {}} callback={(newValue) => {
                        setAttributes({['wpbs-gap-mobile']: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    hasValue={() => !!attributes['wpbs-border-radius-mobile'] || undefined}
                    label={'Rounded'}
                    onDeselect={() => setAttributes({['wpbs-border-radius-mobile']: undefined})}
                >
                    <Rounded defaultValue={attributes['wpbs-border-radius-mobile'] || {}} callback={(newValue) => {
                        setAttributes({['wpbs-border-radius-mobile']: newValue});
                    }}/>
                </ToolsPanelItem>


                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-font-size-mobile'] || ''}
                    label={'Font Size'}
                    onDeselect={() => setAttributes({['wpbs-font-size-mobile']: ''})}
                >
                    <FontSize defaultValue={attributes['wpbs-font-size-mobile'] || ''} callback={(newValue) => {
                        setAttributes({['wpbs-font-size-mobile']: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-line-height-mobile'] || ''}
                    label={'Line Height'}
                    onDeselect={() => setAttributes({['wpbs-line-height-mobile']: ''})}
                >
                    <LineHeight defaultValue={attributes['wpbs-line-height-mobile'] || ''} callback={(newValue) => {
                        setAttributes({['wpbs-line-height-mobile']: newValue});
                    }}/>
                </ToolsPanelItem>
                <ToolsPanelItem
                    style={{gridColumn: 'span 1'}}
                    hasValue={() => !!attributes['wpbs-text-align-mobile'] || ''}
                    label={'Text Align'}
                    onDeselect={() => setAttributes({['wpbs-text-align-mobile']: ''})}
                >
                    <TextAlign defaultValue={attributes['wpbs-text-align-mobile'] || ''} callback={(newValue) => {
                        setAttributes({['wpbs-text-align-mobile']: newValue});
                    }}/>
                </ToolsPanelItem>
            </ToolsPanel>

            <ToolsPanel label={'Hover'} resetAll={resetAll_hover}>
                <ToolsPanelItem
                    style={{gridColumn: 'span 2'}}
                    hasValue={() => !!attributes['wpbs-opacity-mobile'] || ''}
                    label={'Opacity'}
                    onDeselect={() => setAttributes({['wpbs-opacity-mobile']: ''})}
                >
                    <Opacity defaultValue={attributes['wpbs-opacity-mobile'] || ''} callback={(newValue) => {
                        setAttributes({['wpbs-opacity-mobile']: newValue});
                    }}/>
                </ToolsPanelItem>
            </ToolsPanel>

            <PanelColorSettings
                title={'Colors'}
                enableAlpha
                __experimentalIsRenderedInSidebar
                colorSettings={[
                    {
                        slug: 'wpbs-text-color-hover',
                        label: 'Text Hover'
                    },
                    {
                        slug: 'wpbs-background-color-hover',
                        label: 'Background Hover'
                    },
                    {
                        slug: 'wpbs-border-color-hover',
                        label: 'Border Hover'
                    },
                    {
                        slug: 'wpbs-text-color-mobile',
                        label: 'Text Mobile'
                    },
                    {
                        slug: 'wpbs-background-color-mobile',
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
