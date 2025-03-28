import '../scss/block.scss';

import {
    useBlockProps,
    InspectorControls,
    BlockEdit,
    useInnerBlocksProps, useSettings
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "../block.json"
import {Layout, LayoutAttributes, LayoutClasses} from "Components/Layout"
import {
    __experimentalGrid as Grid,
    PanelBody,
    __experimentalNumberControl as NumberControl
} from "@wordpress/components";
import React, {useEffect, useState} from "react";
import {useInstanceId} from '@wordpress/compose';
import {swiperDefaultArgs} from "Includes/helper";

function blockClasses(attributes = {}) {
    return [
        'wpbs-slider swiper overflow-hidden w-full relative !flex flex-col',
        attributes.uniqueId,
        LayoutClasses(attributes)
    ].filter(x => x).join(' ');
}

const blockAttributes = {
    'wpbs-slides-mobile': {
        type: 'string'
    },
    'wpbs-slides-large': {
        type: 'string'
    },
    'wpbs-group-mobile': {
        type: 'string'
    },
    'wpbs-group-large': {
        type: 'string'
    },
    'wpbs-margin-mobile': {
        type: 'string'
    },
    'wpbs-margin-large': {
        type: 'string'
    },
    'wpbs-autoplay': {
        type: 'string'
    },
    'wpbs-hover-pause': {
        type: 'boolean'
    },
    'wpbs-fade-in': {
        type: 'boolean'
    },
    'wpbs-free-mode': {
        type: 'boolean'
    },
    'wpbs-centered': {
        type: 'boolean'
    },
    'wpbs-collapse': {
        type: 'boolean'
    },
    'wpbs-loop': {
        type: 'boolean'
    },
    'wpbs-dim': {
        type: 'boolean'
    },
    'wpbs-from-end': {
        type: 'boolean'
    },
}

function sliderArgs(attributes = {}, breakpoints) {

    console.log(attributes);

    return {
        //pagination:false
    };
}

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...LayoutAttributes,
        ...blockAttributes
    },
    edit: ({attributes, setAttributes, clientId}) => {

        const [slidesMobile, setSlidesMobile] = useState(attributes['wpbs-slides-mobile']);
        const [slidesLarge, setSlidesLarge] = useState(attributes['wpbs-slides-large']);

        const uniqueId = useInstanceId(registerBlockType, 'wpbs-slider');

        const [{breakpoints}] = useSettings(['custom']);

        useEffect(() => {


            setAttributes({
                uniqueId: uniqueId,
                breakpoint: breakpoints[attributes['wpbs-layout-breakpoint'] || 'lg'],
            });

            const swiper = new Swiper('#block-' + clientId, {
                ...swiperDefaultArgs,
                ...sliderArgs(attributes),
            });
        }, []);

        const blockProps = useBlockProps({
            className: [blockClasses(attributes), 'min-h-[10rem] bg-[rgba(0,0,0,.3)]'].join(' ')
        });

        const innerBlocksProps = useInnerBlocksProps(blockProps, {
            template: [
                ['wpbs/slider-wrapper', {}],
            ]
        });


        return <>
            <BlockEdit key="edit" {...blockProps} />
            <InspectorControls group="styles">
                <PanelBody initialOpen={true}>
                    <Grid columns={1} columnGap={15} rowGap={20}>
                        <Grid columns={2} columnGap={15} rowGap={20}>
                            <NumberControl
                                __next40pxDefaultSize
                                isShiftStepEnabled={true}
                                onChange={(newValue) => {
                                    setAttributes({['wpbs-slides-mobile']: newValue});
                                    setSlidesMobile(newValue);
                                }}
                                shiftStep={10}
                                value={slidesMobile}
                            />
                            <NumberControl
                                __next40pxDefaultSize
                                isShiftStepEnabled={true}
                                onChange={(newValue) => {
                                    setAttributes({['wpbs-slides-large']: newValue});
                                    setSlidesLarge(newValue);
                                }}
                                shiftStep={10}
                                value={slidesLarge}
                            />
                        </Grid>

                    </Grid>
                </PanelBody>
            </InspectorControls>

            <Layout blockProps={blockProps} attributes={attributes} setAttributes={setAttributes}
                    clientId={clientId}></Layout>

            <div {...innerBlocksProps}></div>


        </>;


    },
    save: (props) => {

        const blockProps = useBlockProps.save({
            className: blockClasses(props.attributes),
            'data-wp-interactive': 'wpbs',
            'data-wp-init': 'callbacks.observeSlider',
            'data-wp-context': JSON.stringify({
                args: {
                    ...sliderArgs(props.attributes)
                }
            })
        });

        const innerBlocksProps = useInnerBlocksProps.save(blockProps);

        return (
            <div {...innerBlocksProps}></div>
        );
    }
})


