import {
    InspectorControls,
    PanelColorSettings,
} from "@wordpress/block-editor";
import {
    __experimentalToolsPanel as ToolsPanel,
    __experimentalToolsPanelItem as ToolsPanelItem
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

const blockAttributes = {
    layout: {
        'wpbs-layout-offset-header': {
            type: 'string'
        },
        'wpbs-layout-display': {
            type: 'string'
        },
        'wpbs-layout-mask-image': {
            type: 'object'
        },
        'wpbs-layout-mask-origin': {
            type: 'string'
        },
        'wpbs-layout-mask-size': {
            type: 'string'
        },
        'wpbs-layout-flex-direction': {
            type: 'string'
        },
        'wpbs-layout-container': {
            type: 'string'
        },
        'wpbs-layout-align-items': {
            type: 'string'
        },
        'wpbs-layout-justify-content': {
            type: 'string'
        },
        'wpbs-layout-opacity': {
            type: 'string'
        },
        'wpbs-layout-basis': {
            type: 'string'
        },
        'wpbs-layout-width': {
            type: 'string'
        },
        'wpbs-layout-width-custom': {
            type: 'string'
        },
        'wpbs-layout-max-width': {
            type: 'string'
        },
        'wpbs-layout-height': {
            type: 'string'
        },
        'wpbs-layout-height-custom': {
            type: 'string'
        },
        'wpbs-layout-min-height': {
            type: 'string'
        },
        'wpbs-layout-min-height-custom': {
            type: 'string'
        },
        'wpbs-layout-max-height': {
            type: 'string'
        },
        'wpbs-layout-max-height-custom': {
            type: 'string'
        },
        'wpbs-layout-flex-wrap': {
            type: 'string'
        },
        'wpbs-layout-flex-grow': {
            type: 'string'
        },
        'wpbs-layout-flex-shrink': {
            type: 'string'
        },
        'wpbs-layout-position': {
            type: 'string'
        },
        'wpbs-layout-z-index': {
            type: 'string'
        },
        'wpbs-layout-top': {
            type: 'string'
        },
        'wpbs-layout-right': {
            type: 'string'
        },
        'wpbs-layout-bottom': {
            type: 'string'
        },
        'wpbs-layout-left': {
            type: 'string'
        },
        'wpbs-layout-overflow': {
            type: 'string'
        },
        'wpbs-layout-aspect-ratio': {
            type: 'string'
        },
        'wpbs-layout-order': {
            type: 'string'
        },
        'wpbs-layout-translate': {
            type: 'object'
        },
        'wpbs-layout-outline': {
            type: 'object'
        }
    },
    mobile: {
        'wpbs-layout-mask-image-mobile': {
            type: 'object'
        },
        'wpbs-layout-mask-origin-mobile': {
            type: 'string'
        },
        'wpbs-layout-mask-size-mobile': {
            type: 'string'
        },
        'wpbs-layout-offset-header-mobile': {
            type: 'string'
        },
        'wpbs-layout-display-mobile': {
            type: 'string'
        },
        'wpbs-layout-breakpoint': {
            type: 'string'
        },
        'wpbs-layout-align-items-mobile': {
            type: 'string'
        },
        'wpbs-layout-justify-content-mobile': {
            type: 'string'
        },
        'wpbs-layout-opacity-mobile': {
            type: 'string'
        },
        'wpbs-layout-basis-mobile': {
            type: 'string'
        },
        'wpbs-layout-width-mobile': {
            type: 'string'
        },
        'wpbs-layout-width-custom-mobile': {
            type: 'string'
        },
        'wpbs-layout-max-width-mobile': {
            type: 'string'
        },
        'wpbs-layout-height-mobile': {
            type: 'string'
        },
        'wpbs-layout-height-custom-mobile': {
            type: 'string'
        },
        'wpbs-layout-min-height-mobile': {
            type: 'string'
        },
        'wpbs-layout-min-height-custom-mobile': {
            type: 'string'
        },
        'wpbs-layout-max-height-mobile': {
            type: 'string'
        },
        'wpbs-layout-max-height-custom-mobile': {
            type: 'string'
        },
        'wpbs-layout-flex-grow-mobile': {
            type: 'string'
        },
        'wpbs-layout-flex-shrink-mobile': {
            type: 'string'
        },
        'wpbs-layout-flex-direction-mobile': {
            type: 'string'
        },
        'wpbs-layout-aspect-ratio-mobile': {
            type: 'string'
        },
        'wpbs-layout-position-mobile': {
            type: 'string'
        },
        'wpbs-layout-z-index-mobile': {
            type: 'string'
        },
        'wpbs-layout-top-mobile': {
            type: 'string'
        },
        'wpbs-layout-right-mobile': {
            type: 'string'
        },
        'wpbs-layout-bottom-mobile': {
            type: 'string'
        },
        'wpbs-layout-left-mobile': {
            type: 'string'
        },
        'wpbs-layout-order-mobile': {
            type: 'string'
        },
        'wpbs-layout-translate-mobile': {
            type: 'object'
        },
        'wpbs-layout-padding-mobile': {
            type: 'object'
        },
        'wpbs-layout-margin-mobile': {
            type: 'object'
        },
        'wpbs-layout-gap-mobile': {
            type: 'object'
        },
        'wpbs-layout-border-radius-mobile': {
            type: 'string'
        },
        'wpbs-layout-font-size-mobile': {
            type: 'string'
        },
        'wpbs-layout-line-height-mobile': {
            type: 'string'
        },
        'wpbs-layout-text-align-mobile': {
            type: 'string'
        },
        'wpbs-layout-flex-wrap-mobile': {
            type: 'string'
        }
    },
    colors: {
        'wpbs-layout-text-color-hover': {
            type: 'string'
        },
        'wpbs-layout-background-color-hover': {
            type: 'string'
        },
        'wpbs-layout-border-color-hover': {
            type: 'string'
        },
        'wpbs-layout-text-color-mobile': {
            type: 'string'
        },
        'wpbs-layout-background-color-mobile': {
            type: 'string'
        },
    }
};

export const LayoutAttributes = {...blockAttributes.layout, ...blockAttributes.mobile, ...blockAttributes.colors};

export function LayoutClasses(attributes) {

    let classes = [];

    if (Object.keys(attributes).some(attr => blockAttributes.layout[attr])) {
        classes.push('has-layout');
    }

    classes = [...classes, ...[...Object.keys(attributes)].map(attr => {
        if (!attributes[attr]) {
            return false;
        }
        switch (attr) {

            case 'wpbs-layout-container':
                if (attributes[attr] === 'normal') {
                    return 'wpbs-layout-container';
                }
                return ['wpbs-layout-container', attributes[attr]].filter(x => x).join('-')
        }
    }).filter(x => x)];

    return classes.join(' ');
}

export function LayoutSettings({attributes = {}, setAttributes}) {

    const resetAll_layout = () => {
        setAttributes(Object.keys(blockAttributes.layout).reduce((o, key) => ({...o, [key]: undefined}), {}))
    };

    const resetAll_layout_mobile = () => {
        setAttributes(Object.keys(blockAttributes.mobile).reduce((o, key) => ({...o, [key]: undefined}), {}))
    };

    return <InspectorControls group="styles">

        <ToolsPanel label={'Layout'} resetAll={resetAll_layout} columnGap={15} rowGap={20}>
            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!attributes['wpbs-layout-display']}
                label={'Display'}
                onDeselect={() => setAttributes({['wpbs-layout-display']: undefined})}
            >
                <Display defaultValue={attributes['wpbs-layout-display']} callback={(newValue) => {
                    setAttributes({['wpbs-layout-display']: newValue});
                }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!attributes['wpbs-layout-flex-direction']}
                label={'Direction'}
                onDeselect={() => setAttributes({['wpbs-layout-flex-direction']: undefined})}
            >
                <FlexDirection defaultValue={attributes['wpbs-layout-flex-direction']}
                               callback={(newValue) => {
                                   setAttributes({['wpbs-layout-flex-direction']: newValue});
                               }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!attributes['wpbs-layout-container']}
                label={'Container'}
                onDeselect={() => setAttributes({['wpbs-layout-container']: undefined})}
            >
                <Container defaultValue={attributes['wpbs-layout-container']} callback={(newValue) => {
                    setAttributes({['wpbs-layout-container']: newValue});
                }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!attributes['wpbs-layout-align-items']}
                label={'Align'}
                onDeselect={() => setAttributes({['wpbs-layout-align-items']: undefined})}
            >
                <Align defaultValue={attributes['wpbs-layout-align-items']} callback={(newValue) => {
                    setAttributes({['wpbs-layout-align-items']: newValue});
                }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!attributes['wpbs-layout-justify-content']}
                label={'Justify'}
                onDeselect={() => setAttributes({['wpbs-layout-justify-content']: undefined})}
            >
                <Justify defaultValue={attributes['wpbs-layout-justify-content']} callback={(newValue) => {
                    setAttributes({['wpbs-layout-justify-content']: newValue});
                }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 2'}}
                hasValue={() => !!attributes['wpbs-layout-opacity']}
                label={'Opacity'}
                onDeselect={() => setAttributes({['wpbs-layout-opacity']: undefined})}
            >
                <Opacity defaultValue={attributes['wpbs-layout-opacity']} callback={(newValue) => {
                    setAttributes({['wpbs-layout-opacity']: newValue});
                }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 2'}}
                hasValue={() => !!attributes['wpbs-layout-basis']}
                label={'Basis'}
                onDeselect={() => setAttributes({['wpbs-layout-basis']: undefined})}
            >
                <Basis defaultValue={attributes['wpbs-layout-basis']} callback={(newValue) => {
                    setAttributes({['wpbs-layout-basis']: newValue});
                }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!attributes['wpbs-layout-width']}
                label={'Width'}
                onDeselect={() => setAttributes({['wpbs-layout-width']: undefined})}
            >
                <Width defaultValue={attributes['wpbs-layout-width']} callback={(newValue) => {
                    setAttributes({['wpbs-layout-width']: newValue});
                }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!attributes['wpbs-layout-width-custom']}
                label={'Width Custom'}
                onDeselect={() => setAttributes({['wpbs-layout-width-custom']: undefined})}
            >
                <WidthCustom defaultValue={attributes['wpbs-layout-width-custom']} callback={(newValue) => {
                    setAttributes({['wpbs-layout-width-custom']: newValue});
                }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!attributes['wpbs-layout-max-width']}
                label={'Max-Width'}
                onDeselect={() => setAttributes({['wpbs-layout-max-width']: undefined})}
            >
                <WidthCustom label={'Max-Width'} defaultValue={attributes['wpbs-layout-max-width']}
                             callback={(newValue) => {
                                 setAttributes({['wpbs-layout-max-width']: newValue});
                             }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!attributes['wpbs-layout-height']}
                label={'Height'}
                onDeselect={() => setAttributes({['wpbs-layout-height']: undefined})}
            >
                <Height defaultValue={attributes['wpbs-layout-height']} callback={(newValue) => {
                    setAttributes({['wpbs-layout-height']: newValue});
                }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!attributes['wpbs-layout-height-custom']}
                label={'Height Custom'}
                onDeselect={() => setAttributes({['wpbs-layout-height-custom']: undefined})}
            >
                <HeightCustom defaultValue={attributes['wpbs-layout-height-custom']} callback={(newValue) => {
                    setAttributes({['wpbs-layout-height-custom']: newValue});
                }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!attributes['wpbs-layout-min-height']}
                label={'Min-Height'}
                onDeselect={() => setAttributes({['wpbs-layout-min-height']: undefined})}
            >
                <MinHeight defaultValue={attributes['wpbs-layout-min-height']} callback={(newValue) => {
                    setAttributes({['wpbs-layout-min-height']: newValue});
                }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!attributes['wpbs-layout-min-height-custom']}
                label={'Min-Height Custom'}
                onDeselect={() => setAttributes({['wpbs-layout-min-height-custom']: undefined})}
            >
                <MinHeightCustom defaultValue={attributes['wpbs-layout-min-height-custom']}
                                 callback={(newValue) => {
                                     setAttributes({['wpbs-layout-min-height-custom']: newValue});
                                 }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!attributes['wpbs-layout-max-height']}
                label={'Max-Height'}
                onDeselect={() => setAttributes({['wpbs-layout-max-height']: undefined})}
            >
                <MaxHeight defaultValue={attributes['wpbs-layout-max-height']} callback={(newValue) => {
                    setAttributes({['wpbs-layout-max-height']: newValue});
                }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!attributes['wpbs-layout-max-height-custom']}
                label={'Max-Height Custom'}
                onDeselect={() => setAttributes({['wpbs-layout-max-height-custom']: undefined})}
            >
                <MaxHeightCustom defaultValue={attributes['wpbs-layout-max-height-custom']}
                                 callback={(newValue) => {
                                     setAttributes({['wpbs-layout-max-height-custom']: newValue});
                                 }}/>
            </ToolsPanelItem>

            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!attributes['wpbs-layout-flex-wrap']}
                label={'Flex Wrap'}
                onDeselect={() => setAttributes({['wpbs-layout-flex-wrap']: undefined})}
            >
                <FlexWrap defaultValue={attributes['wpbs-layout-flex-wrap']} callback={(newValue) => {
                    setAttributes({['wpbs-layout-flex-wrap']: newValue});
                }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!attributes['wpbs-layout-flex-grow']}
                label={'Grow'}
                onDeselect={() => setAttributes({['wpbs-layout-flex-grow']: undefined})}
            >
                <Grow defaultValue={attributes['wpbs-layout-flex-grow']} callback={(newValue) => {
                    setAttributes({['wpbs-layout-flex-grow']: newValue});
                }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!attributes['wpbs-layout-flex-shrink']}
                label={'Shrink'}
                onDeselect={() => setAttributes({['wpbs-layout-flex-shrink']: undefined})}
            >
                <Shrink defaultValue={attributes['wpbs-layout-flex-shrink']} callback={(newValue) => {
                    setAttributes({['wpbs-layout-flex-shrink']: newValue});
                }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!attributes['wpbs-layout-position']}
                label={'Position'}
                onDeselect={() => setAttributes({['wpbs-layout-position']: undefined})}
            >
                <Position defaultValue={attributes['wpbs-layout-position']} callback={(newValue) => {
                    setAttributes({['wpbs-layout-position']: newValue});
                }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!attributes['wpbs-layout-z-index']}
                label={'Z-Index'}
                onDeselect={() => setAttributes({['wpbs-layout-z-index']: undefined})}
            >
                <ZIndex defaultValue={attributes['wpbs-layout-z-index']} callback={(newValue) => {
                    setAttributes({['wpbs-layout-z-index']: newValue});
                }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                hasValue={() => !!attributes['wpbs-layout-top'] || !!attributes['wpbs-layout-right'] || !!attributes['wpbs-layout-bottom'] || !!attributes['wpbs-layout-left']}
                label={'Box Position'}
                onDeselect={() => setAttributes({
                    ['wpbs-layout-top']: undefined,
                    ['wpbs-layout-right']: undefined,
                    ['wpbs-layout-bottom']: undefined,
                    ['wpbs-layout-left']: undefined
                })}
            >
                <BoxPosition topValue={attributes['wpbs-layout-top']}
                             rightValue={attributes['wpbs-layout-right']}
                             bottomValue={attributes['wpbs-layout-bottom']}
                             leftValue={attributes['wpbs-layout-left']}
                             callback={(top, right, bottom, left) => {
                                 setAttributes({
                                     ['wpbs-layout-top']: top,
                                     ['wpbs-layout-right']: right,
                                     ['wpbs-layout-bottom']: bottom,
                                     ['wpbs-layout-left']: left
                                 });
                             }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!attributes['wpbs-layout-overflow']}
                label={'Overflow'}
                onDeselect={() => setAttributes({['wpbs-layout-overflow']: undefined})}
            >
                <Overflow defaultValue={attributes['wpbs-layout-overflow']} callback={(newValue) => {
                    setAttributes({['wpbs-layout-overflow']: newValue});
                }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!attributes['wpbs-layout-aspect-ratio']}
                label={'Shape'}
                onDeselect={() => setAttributes({['wpbs-layout-aspect-ratio']: undefined})}
            >
                <Shape defaultValue={attributes['wpbs-layout-aspect-ratio']} callback={(newValue) => {
                    setAttributes({['wpbs-layout-aspect-ratio']: newValue});
                }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!attributes['wpbs-layout-order']}
                label={'Order'}
                onDeselect={() => setAttributes({['wpbs-layout-order']: undefined})}
            >
                <Order defaultValue={attributes['wpbs-layout-order']} callback={(newValue) => {
                    setAttributes({['wpbs-layout-order']: newValue});
                }}/>
            </ToolsPanelItem>

            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!attributes['wpbs-layout-outline-offset']}
                label={'Outline Offset'}
                onDeselect={() => setAttributes({['wpbs-layout-outline-offset']: undefined})}
            >
                <OutlineOffset defaultValue={attributes['wpbs-layout-outline-offset']}
                               callback={(newValue) => {
                                   setAttributes({['wpbs-layout-outline-offset']: newValue});
                               }}/>
            </ToolsPanelItem>

            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!attributes['wpbs-layout-offset-header']}
                label={'Offset Header'}
                onDeselect={() => setAttributes({['wpbs-layout-offset-header']: undefined})}
            >
                <OffsetHeader defaultValue={attributes['wpbs-layout-offset-header'] || undefined}
                              callback={(newValue) => {
                                  setAttributes({['wpbs-layout-offset-header']: newValue});
                              }}/>
            </ToolsPanelItem>

            <ToolsPanelItem
                hasValue={() => !!attributes['wpbs-layout-translate']}
                label={'Translate'}
                onDeselect={() => setAttributes({['wpbs-layout-translate']: undefined})}
            >
                <Translate defaultValue={attributes['wpbs-layout-translate']} callback={(newValue) => {
                    setAttributes({['wpbs-layout-translate']: newValue});
                }}/>
            </ToolsPanelItem>

            <ToolsPanelItem
                hasValue={() => !!attributes['wpbs-layout-outline']}
                label={'Outline'}
                onDeselect={() => setAttributes({['wpbs-layout-outline']: undefined})}
            >
                <Outline defaultValue={attributes['wpbs-layout-outline']} callback={(newValue) => {
                    setAttributes({['wpbs-layout-outline']: newValue});
                }}/>
            </ToolsPanelItem>

            <ToolsPanelItem
                hasValue={() => !!attributes['wpbs-layout-mask-image']}
                label={'Mask'}
                onDeselect={() => {
                    setAttributes({
                        ['wpbs-layout-mask-image']: undefined,
                        ['wpbs-layout-mask-origin']: undefined,
                        ['wpbs-layout-mask-size']: undefined
                    });
                }}
            >
                <Mask
                    imageValue={attributes['wpbs-layout-mask-image']}
                    originValue={attributes['wpbs-layout-mask-origin']}
                    sizeValue={attributes['wpbs-layout-mask-size']}
                    callback={(image, origin, size) => {
                        setAttributes({
                            ['wpbs-layout-mask-image']: image,
                            ['wpbs-layout-mask-origin']: origin,
                            ['wpbs-layout-mask-size']: size
                        });
                    }}/>
            </ToolsPanelItem>


        </ToolsPanel>

        <ToolsPanel label={'Mobile'} resetAll={resetAll_layout_mobile}>
            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!attributes['wpbs-layout-breakpoint']}
                label={'Breakpoint'}
                onDeselect={() => setAttributes({['wpbs-layout-breakpoint']: undefined})}
            >
                <Breakpoint defaultValue={attributes['wpbs-layout-breakpoint']} callback={(newValue) => {
                    setAttributes({['wpbs-layout-breakpoint']: newValue});
                }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!attributes['wpbs-layout-display-mobile']}
                label={'Display'}
                onDeselect={() => setAttributes({['wpbs-layout-display-mobile']: undefined})}
            >
                <Display defaultValue={attributes['wpbs-layout-display-mobile']} callback={(newValue) => {
                    setAttributes({['wpbs-layout-display-mobile']: newValue});
                }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!attributes['wpbs-layout-flex-direction-mobile']}
                label={'Direction'}
                onDeselect={() => setAttributes({['wpbs-layout-flex-direction-mobile']: undefined})}
            >
                <FlexDirection defaultValue={attributes['wpbs-layout-flex-direction-mobile']}
                               callback={(newValue) => {
                                   setAttributes({['wpbs-layout-flex-direction-mobile']: newValue});
                               }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!attributes['wpbs-layout-align-items-mobile']}
                label={'Align'}
                onDeselect={() => setAttributes({['wpbs-layout-align-items-mobile']: undefined})}
            >
                <Align defaultValue={attributes['wpbs-layout-align-items-mobile']} callback={(newValue) => {
                    setAttributes({['wpbs-layout-align-items-mobile']: newValue});
                }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!attributes['wpbs-layout-justify-content-mobile']}
                label={'Justify'}
                onDeselect={() => setAttributes({['wpbs-layout-justify-content-mobile']: undefined})}
            >
                <Justify defaultValue={attributes['wpbs-layout-justify-content-mobile']}
                         callback={(newValue) => {
                             setAttributes({['wpbs-layout-justify-content-mobile']: newValue});
                         }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!attributes['wpbs-layout-flex-grow-mobile']}
                label={'Grow'}
                onDeselect={() => setAttributes({['wpbs-layout-flex-grow-mobile']: undefined})}
            >
                <Grow defaultValue={attributes['wpbs-layout-flex-grow-mobile']} callback={(newValue) => {
                    setAttributes({['wpbs-layout-flex-grow-mobile']: newValue});
                }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!attributes['wpbs-layout-flex-shrink-mobile']}
                label={'Shrink'}
                onDeselect={() => setAttributes({['wpbs-layout-flex-shrink-mobile']: undefined})}
            >
                <Shrink defaultValue={attributes['wpbs-layout-flex-shrink-mobile']} callback={(newValue) => {
                    setAttributes({['wpbs-layout-flex-shrink-mobile']: newValue});
                }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 2'}}
                hasValue={() => !!attributes['wpbs-layout-opacity-mobile']}
                label={'Opacity'}
                onDeselect={() => setAttributes({['wpbs-layout-opacity-mobile']: undefined})}
            >
                <Opacity defaultValue={attributes['wpbs-layout-opacity-mobile'] || 100} callback={(newValue) => {
                    setAttributes({['wpbs-layout-opacity-mobile']: newValue});
                }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 2'}}
                hasValue={() => !!attributes['wpbs-layout-basis-mobile']}
                label={'Basis'}
                onDeselect={() => setAttributes({['wpbs-layout-basis-mobile']: undefined})}
            >
                <Basis defaultValue={attributes['wpbs-layout-basis-mobile']} callback={(newValue) => {
                    setAttributes({['wpbs-layout-basis-mobile']: newValue});
                }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!attributes['wpbs-layout-width-mobile']}
                label={'Width'}
                onDeselect={() => setAttributes({['wpbs-layout-width-mobile']: undefined})}
            >
                <Width defaultValue={attributes['wpbs-layout-width-mobile']} callback={(newValue) => {
                    setAttributes({['wpbs-layout-width-mobile']: newValue});
                }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!attributes['wpbs-layout-width-custom-mobile']}
                label={'Width Custom'}
                onDeselect={() => setAttributes({['wpbs-layout-width-custom-mobile']: undefined})}
            >
                <WidthCustom defaultValue={attributes['wpbs-layout-width-custom-mobile']} callback={(newValue) => {
                    setAttributes({['wpbs-layout-width-custom-mobile']: newValue});
                }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!attributes['wpbs-layout-max-width-mobile']}
                label={'Max-Width'}
                onDeselect={() => setAttributes({['wpbs-layout-max-width-mobile']: undefined})}
            >
                <WidthCustom label={'Max-Width'} defaultValue={attributes['wpbs-layout-max-width-mobile']}
                             callback={(newValue) => {
                                 setAttributes({['wpbs-layout-max-width-mobile']: newValue});
                             }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!attributes['wpbs-layout-height-mobile']}
                label={'Height'}
                onDeselect={() => setAttributes({['wpbs-layout-height-mobile']: undefined})}
            >
                <Height defaultValue={attributes['wpbs-layout-height-mobile']} callback={(newValue) => {
                    setAttributes({['wpbs-layout-height-mobile']: newValue});
                }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!attributes['wpbs-layout-min-height-mobile']}
                label={'Min-Height'}
                onDeselect={() => setAttributes({['wpbs-layout-min-height-mobile']: undefined})}
            >
                <MinHeight defaultValue={attributes['wpbs-layout-min-height-mobile']} callback={(newValue) => {
                    setAttributes({['wpbs-layout-min-height-mobile']: newValue});
                }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!attributes['wpbs-layout-height-custom-mobile']}
                label={'Height Custom'}
                onDeselect={() => setAttributes({['wpbs-layout-height-custom-mobile']: undefined})}
            >
                <HeightCustom defaultValue={attributes['wpbs-layout-height-custom-mobile']}
                              callback={(newValue) => {
                                  setAttributes({['wpbs-layout-height-custom-mobile']: newValue});
                              }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!attributes['wpbs-layout-aspect-ratio-mobile']}
                label={'Shape'}
                onDeselect={() => setAttributes({['wpbs-layout-aspect-ratio-mobile']: undefined})}
            >
                <Shape defaultValue={attributes['wpbs-layout-aspect-ratio-mobile']} callback={(newValue) => {
                    setAttributes({['wpbs-layout-aspect-ratio-mobile']: newValue});
                }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!attributes['wpbs-layout-flex-wrap-mobile']}
                label={'Flex Wrap'}
                onDeselect={() => setAttributes({['wpbs-layout-flex-wrap-mobile']: undefined})}
            >
                <FlexWrap defaultValue={attributes['wpbs-layout-flex-wrap-mobile']} callback={(newValue) => {
                    setAttributes({['wpbs-layout-flex-wrap-mobile']: newValue});
                }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!attributes['wpbs-layout-position-mobile']}
                label={'Position'}
                onDeselect={() => setAttributes({['wpbs-layout-position-mobile']: undefined})}
            >
                <Position defaultValue={attributes['wpbs-layout-position-mobile']} callback={(newValue) => {
                    setAttributes({['wpbs-layout-position-mobile']: newValue});
                }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!attributes['wpbs-layout-z-index-mobile']}
                label={'Z-Index'}
                onDeselect={() => setAttributes({['wpbs-layout-z-index-mobile']: undefined})}
            >
                <ZIndex defaultValue={attributes['wpbs-layout-z-index-mobile']} callback={(newValue) => {
                    setAttributes({['wpbs-layout-z-index-mobile']: newValue});
                }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                hasValue={() => !!attributes['wpbs-layout-top-mobile'] || !!attributes['wpbs-layout-right-mobile'] || !!attributes['wpbs-layout-bottom-mobile'] || !!attributes['wpbs-layout-left-mobile']}
                label={'Box Position'}
                onDeselect={() => setAttributes({
                    ['wpbs-layout-top-mobile']: undefined,
                    ['wpbs-layout-right-mobile']: undefined,
                    ['wpbs-layout-bottom-mobile']: undefined,
                    ['wpbs-layout-left-mobile']: undefined
                })}
            >
                <BoxPosition topValue={attributes['wpbs-layout-top-mobile']}
                             rightValue={attributes['wpbs-layout-right-mobile']}
                             bottomValue={attributes['wpbs-layout-bottom-mobile']}
                             leftValue={attributes['wpbs-layout-left-mobile']}
                             callback={(top, right, bottom, left) => {
                                 setAttributes({
                                     ['wpbs-layout-top-mobile']: top,
                                     ['wpbs-layout-right-mobile']: right,
                                     ['wpbs-layout-bottom-mobile']: bottom,
                                     ['wpbs-layout-left-mobile']: left
                                 });
                             }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!attributes['wpbs-layout-order-mobile']}
                label={'Order'}
                onDeselect={() => setAttributes({['wpbs-layout-order-mobile']: undefined})}
            >
                <Order defaultValue={attributes['wpbs-layout-order-mobile']} callback={(newValue) => {
                    setAttributes({['wpbs-layout-order-mobile']: newValue});
                }}/>
            </ToolsPanelItem>

            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!attributes['wpbs-layout-offset-header-mobile']}
                label={'Offset Header'}
                onDeselect={() => setAttributes({['wpbs-layout-offset-header-mobile']: undefined})}
            >
                <OffsetHeader defaultValue={attributes['wpbs-layout-offset-header-mobile'] || undefined}
                              callback={(newValue) => {
                                  setAttributes({['wpbs-layout-offset-header-mobile']: newValue});
                              }}/>
            </ToolsPanelItem>


            <ToolsPanelItem
                hasValue={() => !!attributes['wpbs-layout-translate-mobile']}
                label={'Translate'}
                onDeselect={() => setAttributes({['wpbs-layout-translate-mobile']: undefined})}
            >
                <Translate label={'Translate'}
                           defaultValue={attributes['wpbs-layout-translate-mobile'] || {}}
                           callback={(newValue) => {
                               setAttributes({['wpbs-layout-translate-mobile']: newValue});
                           }}/>
            </ToolsPanelItem>

            <ToolsPanelItem
                hasValue={() => !!attributes['wpbs-layout-padding-mobile']}
                label={'Padding'}
                onDeselect={() => setAttributes({['wpbs-layout-padding-mobile']: undefined})}
            >
                <Padding defaultValue={attributes['wpbs-layout-padding-mobile'] || {}} callback={(newValue) => {
                    setAttributes({['wpbs-layout-padding-mobile']: newValue});
                }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                hasValue={() => !!attributes['wpbs-layout-margin-mobile']}
                label={'Margin'}
                onDeselect={() => setAttributes({['wpbs-layout-margin-mobile']: undefined})}
            >
                <Margin defaultValue={attributes['wpbs-layout-margin-mobile'] || {}} callback={(newValue) => {
                    setAttributes({['wpbs-layout-margin-mobile']: newValue});
                }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                hasValue={() => !!attributes['wpbs-layout-gap-mobile']}
                label={'Gap'}
                onDeselect={() => setAttributes({['wpbs-layout-gap-mobile']: undefined})}
            >
                <Gap defaultValue={attributes['wpbs-layout-gap-mobile'] || {}} callback={(newValue) => {
                    setAttributes({['wpbs-layout-gap-mobile']: newValue});
                }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                hasValue={() => !!attributes['wpbs-layout-border-radius-mobile']}
                label={'Rounded'}
                onDeselect={() => setAttributes({['wpbs-layout-border-radius-mobile']: undefined})}
            >
                <Rounded defaultValue={attributes['wpbs-layout-border-radius-mobile'] || {}}
                         callback={(newValue) => {
                             setAttributes({['wpbs-layout-border-radius-mobile']: newValue});
                         }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!attributes['wpbs-layout-font-size-mobile']}
                label={'Font Size'}
                onDeselect={() => setAttributes({['wpbs-layout-font-size-mobile']: undefined})}
            >
                <FontSize defaultValue={attributes['wpbs-layout-font-size-mobile']} callback={(newValue) => {
                    setAttributes({['wpbs-layout-font-size-mobile']: newValue});
                }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!attributes['wpbs-layout-line-height-mobile']}
                label={'Line Height'}
                onDeselect={() => setAttributes({['wpbs-layout-line-height-mobile']: undefined})}
            >
                <LineHeight defaultValue={attributes['wpbs-layout-line-height-mobile']}
                            callback={(newValue) => {
                                setAttributes({['wpbs-layout-line-height-mobile']: newValue});
                            }}/>
            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!attributes['wpbs-layout-text-align-mobile']}
                label={'Text Align'}
                onDeselect={() => setAttributes({['wpbs-layout-text-align-mobile']: undefined})}
            >
                <TextAlign defaultValue={attributes['wpbs-layout-text-align-mobile']}
                           callback={(newValue) => {
                               setAttributes({['wpbs-layout-text-align-mobile']: newValue});
                           }}/>
            </ToolsPanelItem>

            <ToolsPanelItem
                hasValue={() => !!attributes['wpbs-layout-mask-image-mobile']}
                label={'Mask'}
                onDeselect={() => {
                    setAttributes({
                        ['wpbs-layout-mask-image-mobile']: undefined,
                        ['wpbs-layout-mask-origin-mobile']: undefined,
                        ['wpbs-layout-mask-size-mobile']: undefined
                    });
                }}
            >
                <Mask
                    imageValue={attributes['wpbs-layout-mask-image-mobile']}
                    originValue={attributes['wpbs-layout-mask-origin-mobile']}
                    sizeValue={attributes['wpbs-layout-mask-size-mobile']}
                    callback={(image, origin, size) => {
                        setAttributes({
                            ['wpbs-layout-mask-image-mobile']: image,
                            ['wpbs-layout-mask-origin-mobile']: origin,
                            ['wpbs-layout-mask-size-mobile']: size
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
                    slug: 'wpbs-layout-text-color-hover',
                    label: 'Text Hover'
                },
                {
                    slug: 'wpbs-layout-background-color-hover',
                    label: 'Background Hover'
                },
                {
                    slug: 'wpbs-layout-border-color-hover',
                    label: 'Border Hover'
                },
                {
                    slug: 'wpbs-layout-text-color-mobile',
                    label: 'Text Mobile'
                },
                {
                    slug: 'wpbs-layout-background-color-mobile',
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

    </InspectorControls>;
}
