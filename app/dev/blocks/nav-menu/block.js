import "./scss/block.scss";

import {
    useBlockProps,
    useInnerBlocksProps, InspectorControls, PanelColorSettings
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "./block.json"

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        'wpbs-nav-menu': {
            type: 'object'
        }
    },
    edit: () => {
        return null;
    },
    save: () => {
        return null;
    }
})


