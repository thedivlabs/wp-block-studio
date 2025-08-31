import {
    useBlockProps,
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "./block.json"

import React from "react";

function blockClasses(attributes = {}) {
    return [
        'wpbs-authors-list',
    ].filter(x => x).join(' ');
}

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes
    },
    edit: ({attributes}) => {

        const blockProps = useBlockProps({
            className: blockClasses(attributes),
        });

        return <ul {...blockProps}>
            <li>Author Name</li>
            <li>Author Name</li>
            <li>Author Name</li>
            <li>Author Name</li>
        </ul>;
    },
    save: (props) => null
})


