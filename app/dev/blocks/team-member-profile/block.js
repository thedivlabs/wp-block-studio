import {
    InnerBlocks,
    useInnerBlocksProps,
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "./block.json"
import {Style, STYLE_ATTRIBUTES} from "Components/Style"
import {LAYOUT_ATTRIBUTES, LayoutControls} from "Components/Layout"
import {useUniqueId} from "Includes/helper";

function blockClassnames(attributes = {}) {
    return [
        'wpbs-team-member-profile',
        attributes?.uniqueId ?? '',
    ].filter(x => x).join(' ');
}

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...STYLE_ATTRIBUTES,
        ...LAYOUT_ATTRIBUTES,
    },
    edit: ({attributes, setAttributes, clientId, context}) => {

        const uniqueId = useUniqueId(attributes, setAttributes, clientId);

        const blockProps = {
            className: blockClassnames(attributes),
        };

        const innerBlocksProps = useInnerBlocksProps(blockProps);

        return (
            <>
                <LayoutControls attributes={attributes} setAttributes={setAttributes}/>
                <Style attributes={attributes} setAttributes={setAttributes} uniqueId={uniqueId}
                       selector={'wpbs-team-member-profile'} deps={['wpbs-team-member-profile']}/>

                <div {...innerBlocksProps} />

            </>
        )
    },
    save: () => <InnerBlocks.Content/>
})


