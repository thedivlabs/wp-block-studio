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

function component(props) {

    const blockProps = useBlockProps({
        className: componentClassNames(props.attributes),
        style: {}
    });

    return <div {...blockProps} data-wp-interactive='wpbs/content-row'>
        <InnerBlocks/>
    </div>;
}

function edit(props) {
    const {attributes, setAttributes, clientId} = props;

    const [layout, setLayout] = useState(attributes.layout || {});

    return (
        <>
            <InspectorControls group={'styles'}>
                <Layout/>
            </InspectorControls>

            {component(props)}
        </>
    )
}

registerBlockType(metadata.name, {
    apiVersion: 3,

    edit: (props) => {
        edit(props);
    },

    save: (props) => {
        component(props);
    }
})


