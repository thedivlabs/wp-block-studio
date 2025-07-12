import {
    BlockContextProvider,
    InnerBlocks,
    useInnerBlocksProps,
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "./block.json"
import {Style, STYLE_ATTRIBUTES} from "Components/Style"
import {useInstanceId} from "@wordpress/compose";
import React from "react";

function blockClassnames(attributes = {}, is_slider) {
    return [
        'wpbs-layout-grid-container loop-container w-full flex flex-wrap relative z-20',
        attributes?.uniqueId ?? '',
    ].filter(x => x).join(' ');
}

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...STYLE_ATTRIBUTES
    },
    edit: ({attributes, setAttributes, clientId, context}) => {

        const uniqueId = useInstanceId(registerBlockType, 'wpbs-layout-grid-container');


        const blockProps = {
            className: blockClassnames(attributes),
        };

        const innerBlocksProps = useInnerBlocksProps(blockProps, {
            template: [
                ['wpbs/layout-grid-card'],
            ]
        });


        return (
            <>

                <BlockContextProvider>
                    <div {...innerBlocksProps} />
                </BlockContextProvider>

                <Style attributes={attributes} setAttributes={setAttributes} uniqueId={uniqueId} props={{
                    '--grid-col-gap': 'var(--column-gap, 0px)',
                    '--grid-row-gap': 'var(--row-gap, 0px)',
                }}/>
            </>
        )
    },
    save: () => <InnerBlocks.Content/>
})


