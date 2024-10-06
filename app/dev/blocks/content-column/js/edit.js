import {
    useBlockProps, InspectorControls, InnerBlocks,
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "../block.json"
import React, {useState} from 'react';
import {Layout, LayoutProps} from 'Components/Layout'
import {Dimensions, DimensionsProps} from 'Components/Dimensions'


function componentClasses(props) {

    const layoutClassName = LayoutProps(props).className;
    const dimensionsClassName = DimensionsProps(props).className;

    return [
        'wpbs-column',
        layoutClassName,
        dimensionsClassName,
    ].filter(x => x).join(' ');
}

function componentStyles(props) {

    const layoutStyle = LayoutProps(props).style;
    const dimensionsStyle = DimensionsProps(props).style;

    return {...{},layoutStyle,dimensionsStyle};
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

        const componentStyles = componentStyles(props);

        const blockProps = useBlockProps.save({
            ...props,
            className: componentClasses(props),
            style: {
                ...props.style,
                componentStyles
            }
        });

        return <div {...blockProps}><InnerBlocks.Content/></div>;
    }
})


