import {
    useBlockProps,
    useInnerBlocksProps, InspectorControls, PanelColorSettings
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "./block.json"

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes
    },
    edit: ({attributes, setAttributes, clientId}) => {


        const blockProps = useBlockProps({
            className: 'wpbs-list-item material-icon-before',
        });

        return <li {...useInnerBlocksProps(blockProps, {
            allowedBlocks: [
                "core/paragraph",
                "core/heading"
            ],
            template: [
                ['core/paragraph', {placeholder: 'List item text...'}],
            ],
            templateLock: false
        })}></li>;
    },
    save: (props) => {

        const blockProps = useBlockProps.save({
            className: 'wpbs-list-item material-icon-before',
            ...(props.attributes?.['wpbs-props'] ?? {})
        });

        return <li {...useInnerBlocksProps.save(blockProps)}></li>;
    }
})


