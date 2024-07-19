import {useBlockProps} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import ServerSideRender from '@wordpress/server-side-render'
import metadata from "../block.json"

registerBlockType(metadata.name, {
    edit: (props) => {
        return (
            <>
                <ServerSideRender
                    block={metadata.name}
                />
            </>
        );
    },
    save() {
        return null; // Nothing to save here..
    }
})


