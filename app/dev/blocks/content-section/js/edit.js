import {
    useBlockProps, InspectorControls, InnerBlocks,
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "../block.json"
import React, {useState} from 'react';

function sectionClassNames(attributes = {}) {

    return [
        'wpbs-content-section w-full flex relative'
    ].filter(x => x).join(' ');
}

function containerClassNames(attributes = {}) {

    return [
        'wpbs-container gap-inherit relative z-20',
    ].filter(x => x).join(' ');

}

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        'offset-header': {
            type: 'string'
        }
    },
    edit: ({attributes, setAttributes, clientId}) => {
        const {} = attributes;

        const blockProps = useBlockProps({
            className: sectionClassNames(attributes),
            style: {}
        });


        return (
            <>
                <section {...blockProps}
                         data-wp-interactive='wpbs/content-section'
                >
                    <div className={containerClassNames(attributes)}>
                        <InnerBlocks/>
                    </div>
                </section>
            </>
        )
    },
    save: (props) => {
        const blockProps = useBlockProps.save({
            className: sectionClassNames(props.attributes)
        });

        return (
            <section {...blockProps}
                     data-wp-interactive='wpbs/content-section'
            >
                <div className={containerClassNames(props.attributes)}>
                    <InnerBlocks.Content/>
                </div>
            </section>
        );
    }
})


