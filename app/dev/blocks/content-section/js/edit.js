import {
    useBlockProps, InspectorControls, InnerBlocks,
} from "@wordpress/block-editor"
import {
    __experimentalGrid as Grid,
    ToggleControl,
    SelectControl,
    PanelBody,
} from "@wordpress/components"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "../block.json"
import React, {useState} from 'react';
import MobileDimensions from '../../../js/components/MobileDimensions';
import {Flex, FlexStyles} from '../../../js/components/Flex';
import Background from '../../../js/components/Background';
import {BackgroundElement} from '../../../js/components/Background';
import {setMobileProps, MobileStyles} from '../../../js/components/MobileDimensions';


function containerClassNames(attributes = {}) {
    let {flex, container} = attributes;


    switch (container) {
        case 'sm':
            container = 'w-full container max-w-screen-lg';
            break;
        case 'lg':
            container = 'w-full container max-w-screen-2xl';
            break;
        case 'none':
            container = null;
            break;
        default:
            container = 'w-full container';
    }

    return [
        'wpbs-container gap-inherit relative z-20',
        container,
        FlexStyles({flex}),
    ].filter(x => x).join(' ');

}

function sectionClassNames(attributes = {}) {

    let {
        overflow,
        grow,
        align,
        justify,
        size
    } = attributes;


    switch (size) {
        case 'xs':
            size = 'min-h-section-xs';
            break;
        case 'sm':
            size = 'min-h-section-sm';
            break;
        case 'md':
            size = 'min-h-section-md';
            break;
        case 'lg':
            size = 'min-h-section-lg';
            break;
        case 'full':
            size = 'min-h-section-full';
            break;
        default:
            size = false;
    }

    switch (align) {
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

    switch (justify) {
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

    return [
        'wpbs-content-section w-full flex relative',
        grow ? 'grow' : false,
        align,
        justify,
        size,
        !overflow ? 'overflow-hidden' : false,
    ].filter(x => x).join(' ');
}

registerBlockType(metadata.name, {
    apiVersion: 3,
    supports: {
        interactivity: true,
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
        flex: {
            type: 'object'
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
    edit: ({attributes, setAttributes, clientId}) => {
        const {
            flex,
            mobile_dimensions,
            background,
        } = attributes;

        const blockProps = useBlockProps({
            className: sectionClassNames(attributes),
            style: {}
        });

        const [align, setAlign] = useState(attributes.align || 'top');
        const [justify, setJustify] = useState(attributes.align || 'center');
        const [container, setContainer] = useState(attributes.align || '');
        const [grow, setGrow] = useState(attributes.align || false);
        const [size, setSize] = useState(attributes.size || false);
        const [overflow, setOverflow] = useState(attributes.overflow || false);


        return (
            <>
                <section {...blockProps}
                         data-wp-interactive='wpbs/content-section'
                >
                    <div className={containerClassNames(attributes)}>
                        <InnerBlocks/>
                    </div>
                    <BackgroundElement settings={background || {}}/>
                </section>

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
                                        {label: 'Medium', value: 'md'},
                                        {label: 'Large', value: 'lg'},
                                        {label: 'Full', value: 'full'},
                                    ]}
                                    onChange={(value) => {
                                        setSize(value);
                                        setAttributes({size: value});
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
                    <Flex
                        settings={flex}
                        pushSettings={(value) => {
                            setAttributes({flex: value});
                        }}
                        clientId={clientId}
                    />
                    <Background
                        settings={background || {}}
                        pushSettings={(value) => {
                            setAttributes({background: value});
                        }}
                        clientId={clientId}
                    ></Background>

                    <MobileDimensions
                        settings={mobile_dimensions || {}}
                        pushSettings={(value) => {
                            setAttributes({mobile_dimensions: value});
                        }}
                    >
                    </MobileDimensions>

                </InspectorControls>
            </>
        )
    },
    save: (props) => {
        const blockProps = useBlockProps.save({
            className: sectionClassNames(props.attributes)
        });

        const {background} = props.attributes;

        return (
            <section {...setMobileProps(blockProps, props)}
                     data-wp-interactive='wpbs/content-section'
            >
                <div className={containerClassNames(props.attributes)}>
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


