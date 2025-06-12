import {
    useBlockProps,
    useInnerBlocksProps, InspectorControls, PanelColorSettings
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "../block.json"

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes
    },
    edit: ({attributes, setAttributes, clientId}) => {


        const blockProps = useBlockProps({
            className: 'wpbs-list-item',
        });

        return <li {...useInnerBlocksProps(blockProps, {
            allowedBlocks: [
                "core/paragraph",
                "core/heading"
            ]
        })}></li>;
    },
    save: (props) => {

        const blockProps = useBlockProps.save({
            className: 'wpbs-list-item',
        });

        return <li {...useInnerBlocksProps.save(blockProps)}></li>;
    }
})


