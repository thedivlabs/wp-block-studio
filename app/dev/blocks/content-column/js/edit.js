import {
    useBlockProps, InspectorControls, InnerBlocks,
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "../block.json"
import React, {useState} from 'react';
import {Layout} from 'Components/Layout'

const classNames = [
    'wpbs-column',
].filter(x => x).join(' ');

registerBlockType(metadata.name, {
    apiVersion: 3,

    edit: (props) => {

        const {attributes, setAttributes, clientId} = props;

        const blockProps = useBlockProps({
            classNames: classNames,
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
                </InspectorControls>
                <div {...blockProps} data-wp-interactive='wpbs/content-column'>
                    <InnerBlocks/>
                </div>
            </>
        )
    },

    save: (props) => {

        const blockProps = useBlockProps.save();

        return <div {...blockProps}><InnerBlocks.Content/></div>;
    }
})


