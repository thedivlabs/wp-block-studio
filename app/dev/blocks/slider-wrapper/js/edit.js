import {
    useBlockProps,
    BlockEdit,
    useInnerBlocksProps, InnerBlocks
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "../block.json"
import {BackgroundElement} from "Components/Background.js";
import React, {useEffect} from "react";
import useBlockContext from "@wordpress/block-editor/build/components/inner-blocks/use-block-context";

function blockClasses(attributes = {}) {
    return [
        'wpbs-slider-wrapper swiper-wrapper !flex !items-stretch grow min-w-full',
    ].filter(x => x).join(' ');
}

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        'wpbs-query': {
            type: 'object'
        }
    },
    edit: ({attributes, setAttributes, clientId, context}) => {

        const {loopQuery = {}} = context;

        console.log(loopQuery);

        const blockProps = useBlockProps({
            className: blockClasses(attributes),
        });

        const innerBlocksProps = useInnerBlocksProps(blockProps, {
            template: [
                ['wpbs/slide', {content: 'Content Slide'}],
            ]
        });

        /*useEffect(() => {
            setAttributes({'wpbs-query': query});
        }, [query, setAttributes]);*/

        return <>
            <BlockEdit key="edit" {...blockProps} />

            <div {...innerBlocksProps}></div>

        </>;
    },
    save: (props) => {

        return <InnerBlocks.Content/>;
    }
})


