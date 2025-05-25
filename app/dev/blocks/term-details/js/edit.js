import {
    useBlockProps,
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "../block.json"
import React from "react";


function blockClassNames(attributes = {}) {

    return [
        'wpbs-term-details w-max inline-block',
        attributes.uniqueId,
    ].filter(x => x).join(' ');
}

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes
    },
    edit: (props) => {


        const {attributes, setAttributes} = props;

        const blockProps = useBlockProps({
            className: blockClassNames(attributes),
        });

        return (
            <>
                <div {...blockProps}>Term Details</div>
            </>
        )
    },
    save: (props) => {

        const blockProps = useBlockProps.save({
            className: blockClassNames(props.attributes),
        });


        return <div {...blockProps}></div>;


    }
})


