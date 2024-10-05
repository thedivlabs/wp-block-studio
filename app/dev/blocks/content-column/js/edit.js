import {
    useBlockProps, InspectorControls, InnerBlocks,
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "../block.json"
import React, {useState} from 'react';
import {Layout} from 'Components/Layout'

function componentClassNames(attributes = {}) {

    const classNames = [
        'wpbs-column',
    ].filter(x => x);

    return classNames.join(' ');

}

registerBlockType(metadata.name, {
    apiVersion: 3,

    edit: (props) => {

        const {attributes, setAttributes, clientId} = props;

        const [layout, setLayout] = useState(attributes.layout || {});

        const blockProps = useBlockProps({
            className: componentClassNames(props.attributes),
            style: {}
        });

        return (
            <>
                <InspectorControls group={'styles'}>
                    <Layout
                        settings={layout}
                        update={(value) => {
                            setLayout(value);
                            setAttributes({layout: value});
                        }}
                    />
                </InspectorControls>
                <div {...blockProps} data-wp-interactive='wpbs/content-row'>
                    <InnerBlocks/>
                </div>
            </>
        )
    },

    save: (props) => {

        return (
            <div {...props}
                 data-wp-interactive='wpbs/content-column'
            >
                <InnerBlocks.Content/>

            </div>
        );
    }
})


