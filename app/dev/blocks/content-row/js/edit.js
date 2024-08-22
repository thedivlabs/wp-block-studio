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
import Background from '../../../js/components/Background';
import {BackgroundElement} from '../../../js/components/Background';
import {setMobileProps, MobileStyles} from '../../../js/components/MobileDimensions';


function containerClassNames(attributes = {}) {
    let container;

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

    return [
        'wpbs-container w-full gap-inherit relative z-20',
        container,
    ].filter(x => x).join(' ');

}

function componentClassNames(attributes = {}) {

    let size;

    switch (attributes.size) {
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


    return [
        'wpbs-content-row',
        size,
        !attributes.overflow ? 'overflow-hidden' : false,
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
        container: {
            type: 'string'
        },
        overflow: {
            type: 'boolean'
        },
        flex: {
            type: 'object'
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
            mobile_dimensions,
            background,
        } = attributes;

        const blockProps = useBlockProps({
            className: componentClassNames(attributes),
            style: {}
        });

        const [container, setContainer] = useState(attributes.container || '');
        const [size, setSize] = useState(attributes.size || false);
        const [overflow, setOverflow] = useState(attributes.overflow || false);


        return (
            <>
                <div {...blockProps}
                     data-wp-interactive='wpbs/content-row'
                >
                    <div className={containerClassNames(attributes)}>
                        <InnerBlocks/>
                    </div>
                    <BackgroundElement settings={background || {}}/>
                </div>

                <InspectorControls group={'styles'}>
                    <PanelBody title={'Layout'} initialOpen={false}>
                        <Grid columns={1} columnGap={20} rowGap={30}>
                            <Grid columns={2} columnGap={20} rowGap={30}>
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
            className: componentClassNames(props.attributes)
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


