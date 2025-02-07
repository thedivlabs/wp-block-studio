import {
    useBlockProps, InspectorControls, InnerBlocks,
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "../block.json"
import {Layout, LayoutAttributes, LayoutProps} from "Components/Layout"
import React from 'react';

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
        },
        ...LayoutAttributes()
    },
    edit: ({attributes, setAttributes, clientId}) => {
        const {} = attributes;

        const blockProps = useBlockProps({
            ...LayoutProps(attributes),
            className: sectionClassNames(attributes),
            style: {}
        });

        return (
            <>
                <Layout blockProps={blockProps} attributes={attributes} setAttributes={setAttributes}></Layout>
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


