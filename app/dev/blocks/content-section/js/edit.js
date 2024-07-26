import {
    useBlockProps, InspectorControls, InnerBlocks,
} from "@wordpress/block-editor"
import {
    PanelBody,
} from "@wordpress/components"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "../block.json"
import React, {useState} from 'react';
import MobileDimensions from '../../../js/components/MobileDimensions';
import {setMobileProps,MobileStyles} from '../../../js/components/MobileDimensions';

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
    styles: [
        {
            name: 'split',
            label: 'Split'
        },
        {
            name: 'card',
            label: 'Card'
        },
        {
            name: 'card-reverse',
            label: 'Card Reverse'
        },
        {
            name: 'sidebar',
            label: 'Sidebar'
        },
        {
            name: 'sidebar-reverse',
            label: 'Sidebar Reverse'
        },
        {
            name: 'block',
            label: 'Block'
        }
    ],
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
            align,
            justify,
            container,
            grow
        } = attributes;

        const blockProps = useBlockProps({
            className: 'wpbs-content-section w-full flex flex-col',
            style: {}
        });


        return (
            <>
                <MobileDimensions
                    settings={mobile_dimensions || {}}
                    pushSettings={(value) => {
                        setAttributes({mobile_dimensions: value});
                    }}
                >
                </MobileDimensions>

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
            className: 'wpbs-content-section w-full',
        });

        return (
            <section {...setMobileProps(blockProps, props)}>
                <div className={'container wpbs-container gap-inherit'}>
                    <InnerBlocks.Content/>
                </div>
                <MobileStyles blockProps={blockProps} props={props}/>
            </section>
        );
    }
})


