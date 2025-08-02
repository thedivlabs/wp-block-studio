import "./scss/block.scss";

import {
    useBlockProps,
    useInnerBlocksProps, InspectorControls, PanelColorSettings
} from "@wordpress/block-editor"
import ServerSideRender from '@wordpress/server-side-render';
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
    edit: ({attributes}) => {

        const blockProps = useBlockProps({
            className: 'wpbs-nav-menu'
        });

        return <ServerSideRender
            block={metadata.name}
            attributes={attributes}
        />


    },
    save: () => {
        return null;
    }
})


