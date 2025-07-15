import "./scss/block.scss";

import {registerBlockType} from "@wordpress/blocks"
import metadata from "./block.json"

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
    },
    edit: () => null,
    save: () => null
})


