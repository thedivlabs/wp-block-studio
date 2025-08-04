import {
    BlockContextProvider,
    InnerBlocks,
    useInnerBlocksProps,
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "./block.json"
import {Style, STYLE_ATTRIBUTES} from "Components/Style"
import {LAYOUT_ATTRIBUTES, LayoutControls} from "Components/Layout"
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
        ...STYLE_ATTRIBUTES,
        ...LAYOUT_ATTRIBUTES,
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
                <LayoutControls attributes={attributes} setAttributes={setAttributes}/>
                <Style attributes={attributes} setAttributes={setAttributes} uniqueId={clientId} props={{
                    '--grid-col-gap': 'var(--column-gap, 0px)',
                    '--grid-row-gap': 'var(--row-gap, 0px)',
                }}/>

                <BlockContextProvider>
                    <div {...innerBlocksProps} />
                </BlockContextProvider>

            </>
        )
    },
    save: () => <InnerBlocks.Content/>
})


