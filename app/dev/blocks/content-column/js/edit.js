import {
    useBlockProps, InspectorControls, InnerBlocks,
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "../block.json"
import React, {useState} from 'react';
import {Layout, LayoutProps} from 'Components/Layout'
import {Dimensions, DimensionsProps} from 'Components/Dimensions'


function componentClassAttr(props) {

    return [
        'wpbs-column',
        LayoutProps(props).className,
        DimensionsProps(props).className,
    ].filter(x => x).join(' ');
}


registerBlockType(metadata.name, {
    apiVersion: 3,

    edit: (props) => {

        const {attributes, setAttributes, clientId} = props;

        const layoutStyles = LayoutProps(props).style;
        const dimensionStyles = DimensionsProps(props).style;

        const blockProps = useBlockProps({
            ...props,
            className: componentClassAttr(props),
            style: {
                ...props.style,
                ...layoutStyles,
                ...dimensionStyles
            }
        });

        return (
            <>
                <InspectorControls group={'styles'}>
                    <Layout
                        attr={attributes.layout}
                        update={(value) => {
                            setAttributes({'layout': value});
                        }}
                    />
                    <Dimensions
                        attr={attributes.dimensions}
                        update={(value) => {
                            setAttributes({'dimensions': value});
                        }}
                    />
                </InspectorControls>
                <div {...blockProps} data-wp-interactive='wpbs/content-column'>
                    <InnerBlocks/>
                </div>
            </>
        )
    },

    save: (props) => {

        const layoutStyles = LayoutProps(props).style;
        const dimensionStyles = DimensionsProps(props).style;

        const blockProps = useBlockProps.save({
            ...props,
            className: componentClassAttr(props),
            style: {
                ...props.style,
                ...layoutStyles,
                ...dimensionStyles
            }
        });

        return <div {...blockProps}><InnerBlocks.Content/></div>;
    }
})


