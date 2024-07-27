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
import MobileDimensions from 'Theme/MobileDimensions';
import {setMobileProps, MobileStyles} from 'Theme/MobileDimensions';

function classNames(element, props) {
    if (element === 'section') {
        return [
            'wpbs-content-section w-full flex flex-col'
        ].filter(x => x).join(' ');
    }
    if (element === 'container') {
        return [
            'container wpbs-container gap-inherit'
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
        }
    },
    attributes: {
        height: {
            type: 'string'
        },
        padding: {
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
            className: classNames('section'),
            style: {}
        });

        const [align, setAlign] = useState('top');
        const [justify, setJustify] = useState('center');
        const [container, setContainer] = useState('');
        const [grow, setGrow] = useState(false);


        return (
            <>
                <MobileDimensions
                    settings={mobile_dimensions || {}}
                    pushSettings={(value) => {
                        setAttributes({mobile_dimensions: value});
                    }}
                >
                </MobileDimensions>

                <InspectorControls group={'styles'}>
                    <PanelBody title={'Layout'} initialOpen={false}>
                        <Grid columns={2} gap={4}>
                            <SelectControl
                                label="Align"
                                value={align}
                                options={[
                                    {label: 'Big', value: '100%'},
                                    {label: 'Medium', value: '50%'},
                                    {label: 'Small', value: '25%'},
                                ]}
                                onChange={(value) => setAlign(value)}
                                __nextHasNoMarginBottom
                            />
                            <SelectControl
                                label="Justify"
                                value={justify}
                                options={[
                                    {label: 'Big', value: '100%'},
                                    {label: 'Medium', value: '50%'},
                                    {label: 'Small', value: '25%'},
                                ]}
                                onChange={(value) => setJustify(value)}
                                __nextHasNoMarginBottom
                            />
                            <SelectControl
                                label="Container"
                                value={container}
                                options={[
                                    {label: 'Big', value: '100%'},
                                    {label: 'Medium', value: '50%'},
                                    {label: 'Small', value: '25%'},
                                ]}
                                onChange={(value) => setContainer(value)}
                                __nextHasNoMarginBottom
                            />
                            <ToggleControl
                                label="Grow"
                                checked={grow}
                                onChange={(value) => {
                                    setGrow(value);
                                }}
                                className={'flex items-center'}
                                __nextHasNoMarginBottom
                            />
                        </Grid>
                    </PanelBody>
                    <SelectControl>

                    </SelectControl>
                </InspectorControls>

                <section {...blockProps}>
                    <div className={'container wpbs-container'}>
                        <InnerBlocks/>
                    </div>
                </section>
            </>
        )
    },
    save: (props) => {
        const blockProps = useBlockProps.save({
            className: classNames('section')
        });

        return (
            <section {...setMobileProps(blockProps, props)}>
                <div className={classNames('container')}>
                    <InnerBlocks.Content/>
                </div>
                <MobileStyles blockProps={blockProps} props={props}/>
            </section>
        );
    }
})


