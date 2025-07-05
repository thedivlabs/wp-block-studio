import {
    InnerBlocks,
    useBlockProps,
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "./block.json"


registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        'wpbs-grid-pagination-button': {
            type: 'object'
        }
    },
    edit: ({attributes, setAttributes, context}) => {

        const {label = 'View More'} = context;

        const blockProps = useBlockProps({
            className: 'wpbs-grid-pagination-button',
        });

        return <button {...blockProps}>{label}</button>;
    },
    save: (props) => null
})


