import {
    useBlockProps, InspectorControls, InnerBlocks,
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "../block.json"
import React, {useState} from 'react';
import {Layout, LayoutProps} from 'Components/Layout'
import {Dimensions, DimensionsProps} from 'Components/Dimensions'


function className(props) {

    const layoutProps = LayoutProps(props);
    const dimensionsProps = DimensionsProps(props);

    return [
        'wpbs-column',
        layoutProps.className,
        dimensionsProps.className,
    ].filter(x => x).join(' ');
}

registerBlockType(metadata.name, {
    apiVersion: 3,

    edit: (props) => {

        const {attributes, setAttributes, clientId} = props;

        const blockProps = useBlockProps({
            className: className(props),
            style: {}
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

        const layoutStyle = LayoutProps(props).style;
        const dimensionsStyle = DimensionsProps(props).style;

        const blockProps = useBlockProps.save({
            ...props,
            className: className(props),
            style: {
                ...props.style,
                layoutStyle,
                dimensionsStyle
            }
        });

        return <div {...blockProps}><InnerBlocks.Content/></div>;
    }
})


