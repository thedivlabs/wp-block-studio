import './scss/block.scss';

import {
    BlockContextProvider,
    useBlockProps,
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "./block.json"
import {LAYOUT_ATTRIBUTES, LayoutControls} from "Components/Layout"
import {Style, STYLE_ATTRIBUTES} from "Components/Style"
import {useInstanceId} from '@wordpress/compose';


function blockClasses(attributes = {}, editor = false) {

    return [
        'wpbs-translate relative',
        attributes?.uniqueId ?? '',
    ].filter(x => x).join(' ');
}


registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...LAYOUT_ATTRIBUTES,
        ...STYLE_ATTRIBUTES,
    },
    edit: ({attributes, setAttributes, clientId}) => {

        const uniqueId = useInstanceId(registerBlockType, 'wpbs-translate');

        const blockProps = useBlockProps({
            className: blockClasses(attributes),
        })

        return <>
            <LayoutControls attributes={attributes} setAttributes={setAttributes}/>
            <Style attributes={attributes} setAttributes={setAttributes} uniqueId={clientId}/>

            <div {...blockProps}>GTRANSLATE</div>

        </>;


    },
    save: (props) => null
})


