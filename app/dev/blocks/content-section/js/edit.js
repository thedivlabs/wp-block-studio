import {
    useBlockProps, InspectorControls, InnerBlocks,
} from "@wordpress/block-editor"
import {
    __experimentalGrid as Grid,
    ToggleControl,
    PanelBody,
    SelectControl,
} from "@wordpress/components"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "../block.json"
import React, {useState} from 'react';
import MobileDimensions from '../../../js/components/MobileDimensions';
import Background from '../../../js/components/Background';
import {BackgroundElement} from '../../../js/components/Background';
import {setMobileProps, MobileStyles} from '../../../js/components/MobileDimensions';

function classNames(element, attributes = {}) {

    let align;
    let justify;
    let container;
    let flex;

    switch (attributes.flex) {
        case 'col':
            flex = 'flex flex-col';
            break;
        case 'none':
            flex = false;
            break;
        default:
            flex = 'flex flex-col sm:flex-row';
    }
    switch (attributes.align) {
        case 'start':
            align = 'items-start';
            break;
        case 'center':
            align = 'items-center';
            break;
        case 'end':
            align = 'items-end';
            break;
        default:
            align = false;
    }

    switch (attributes.justify) {
        case 'start':
            justify = 'justify-start';
            break;
        case 'center':
            justify = 'justify-center';
            break;
        case 'end':
            justify = 'justify-end';
            break;
        default:
            justify = false;
    }

    switch (attributes.container) {
        case 'sm':
            container = 'container max-w-screen-lg';
            break;
        case 'lg':
            container = 'container  max-w-screen-2xl';
            break;
        case 'none':
            container = false;
            break;
        default:
            container = 'container';
    }

    if (element === 'section') {
        return [
            'wpbs-content-section w-full flex flex-row relative',
            attributes.grow ? 'grow' : false,
            align,
            justify
        ].filter(x => x).join(' ');
    }
    if (element === 'container') {
        return [
            'wpbs-container w-full gap-inherit relative z-20',
            container,
            flex,
            attributes.wrap ? 'flex-wrap' : false,
        ].filter(x => x).join(' ');
    }

    return '';
}

registerBlockType(metadata.name, {
    apiVersion: 3,
    supports: {
        innerBlocks: true,
        color: {
            background: true,
            text: true,
            link: true,
            gradients: true,
        },
        spacing: {
            blockGap: true,
            padding: true,
            margin: true,
        },
        typography: {
            textAlign: true,
        }
    },
    attributes: {
        size: {
            type: 'string'
        },
        padding: {
            type: 'string'
        },
        flex: {
            type: 'string'
        },
        align: {
            type: 'string'
        },
        justify: {
            type: 'string'
        },
        container: {
            type: 'string'
        },
        grow: {
            type: 'boolean'
        },
        wrap: {
            type: 'boolean'
        },
        overflow: {
            type: 'boolean'
        },
        background: {
            type: 'object'
        },
        mobile_dimensions: {
            type: 'object'
        }
    },
    edit: ({attributes, setAttributes}) => {
        const {
            mobile_dimensions,
            background,
        } = attributes;

        const blockProps = useBlockProps({
            className: classNames('section', attributes),
            style: {}
        });

        const [align, setAlign] = useState(attributes.align || 'top');
        const [justify, setJustify] = useState(attributes.align || 'center');
        const [container, setContainer] = useState(attributes.align || '');
        const [grow, setGrow] = useState(attributes.align || false);
        const [flex, setFlex] = useState(attributes.align || null);
        const [wrap, setWrap] = useState(attributes.align || false);
        const [size, setSize] = useState(attributes.size || false);
        const [overflow, setOverflow] = useState(attributes.overflow || false);

        return (
            <>
                <MobileDimensions
                    settings={mobile_dimensions || {}}
                    pushSettings={(value) => {
                        setAttributes({mobile_dimensions: value});
                    }}
                >
                </MobileDimensions>

                <Background
                    settings={background || {}}
                    pushSettings={(value) => {
                        setAttributes({background: value});
                    }}
                ></Background>

                <InspectorControls group={'styles'}>
                    <PanelBody title={'Layout'} initialOpen={false}>
                        <Grid columns={1} columnGap={20} rowGap={30}>
                            <Grid columns={2} columnGap={20} rowGap={30}>
                                <SelectControl
                                    label="Align"
                                    value={align}
                                    options={[
                                        {label: 'Default', value: null},
                                        {label: 'Center', value: 'center'},
                                        {label: 'Start', value: 'start'},
                                        {label: 'End', value: 'end'},
                                    ]}
                                    onChange={(value) => {
                                        setAlign(value);
                                        setAttributes({align: value});
                                    }}
                                    __nextHasNoMarginBottom
                                />
                                <SelectControl
                                    label="Justify"
                                    value={justify}
                                    options={[
                                        {label: 'Default', value: null},
                                        {label: 'Center', value: 'center'},
                                        {label: 'Start', value: 'start'},
                                        {label: 'End', value: 'end'},
                                    ]}
                                    onChange={(value) => {
                                        setJustify(value);
                                        setAttributes({justify: value});
                                    }}
                                    __nextHasNoMarginBottom
                                />
                                <SelectControl
                                    label="Container"
                                    value={container}
                                    options={[
                                        {label: 'Default', value: null},
                                        {label: 'Large', value: 'lg'},
                                        {label: 'Small', value: 'sm'},
                                        {label: 'None', value: 'none'},
                                    ]}
                                    onChange={(value) => {
                                        setContainer(value);
                                        setAttributes({container: value});
                                    }}
                                    __nextHasNoMarginBottom
                                />
                                <SelectControl
                                    label="Size"
                                    value={size}
                                    options={[
                                        {label: 'Default', value: null},
                                        {label: 'Extra Small', value: 'xs'},
                                        {label: 'Small', value: 'sm'},
                                        {label: 'Large', value: 'lg'},
                                        {label: 'Full', value: 'full'},
                                    ]}
                                    onChange={(value) => {
                                        setContainer(value);
                                        setAttributes({size: value});
                                    }}
                                    __nextHasNoMarginBottom
                                />
                                <SelectControl
                                    label="Flex"
                                    value={flex}
                                    options={[
                                        {label: 'Default', value: null},
                                        {label: 'Column', value: 'col'},
                                        {label: 'None', value: 'none'},
                                    ]}
                                    onChange={(value) => {
                                        setFlex(value);
                                        setAttributes({flex: value});
                                    }}
                                    __nextHasNoMarginBottom
                                />
                            </Grid>
                            <Grid columns={2} columnGap={20} rowGap={30}>
                                <ToggleControl
                                    label="Grow"
                                    checked={grow}
                                    onChange={(value) => {
                                        setGrow(value);
                                        setAttributes({grow: value});
                                    }}
                                    className={'flex items-center'}
                                    __nextHasNoMarginBottom
                                />
                                <ToggleControl
                                    label="Wrap"
                                    checked={wrap}
                                    onChange={(value) => {
                                        setWrap(value);
                                        setAttributes({wrap: value});
                                    }}
                                    className={'flex items-center'}
                                    __nextHasNoMarginBottom
                                />
                                <ToggleControl
                                    label="Overflow"
                                    checked={overflow}
                                    onChange={(value) => {
                                        setOverflow(value);
                                        setAttributes({overflow: value});
                                    }}
                                    className={'flex items-center'}
                                    __nextHasNoMarginBottom
                                />
                            </Grid>
                        </Grid>
                    </PanelBody>
                </InspectorControls>

                <section {...blockProps}>
                    <div className={classNames('container', attributes)}>
                        <InnerBlocks/>
                    </div>
                </section>
                <BackgroundElement
                    settings={background || {}}
                ></BackgroundElement>
            </>
        )
    },
    save: (props) => {
        const blockProps = useBlockProps.save({
            className: classNames('section', props.attributes)
        });

        const {background} = props.attributes;

        return (
            <section {...setMobileProps(blockProps, props)}>
                <div className={classNames('container', props.attributes)}>
                    <InnerBlocks.Content/>
                </div>
                <MobileStyles blockProps={blockProps} props={props}/>
                <BackgroundElement
                    settings={background || {}}
                ></BackgroundElement>
            </section>
        );
    }
})


