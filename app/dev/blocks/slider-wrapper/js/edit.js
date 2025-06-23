import {
    useBlockProps,
    useInnerBlocksProps, InnerBlocks
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "../block.json"
import React, {useEffect} from "react";

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

        const {loopQuery = {}, isLoop = false} = context;

        const blockProps = useBlockProps({
            className: blockClasses(attributes),
        });

        const innerBlocksProps = useInnerBlocksProps(blockProps, {
            template: [
                ['wpbs/slide', {content: 'Content Slide'}],
            ]
        });

        useEffect(() => {
            setAttributes({'wpbs-query': isLoop ? loopQuery : {}});
        }, [loopQuery, setAttributes]);

        return <>

            <div {...innerBlocksProps}></div>

        </>;
    },
    save: () => {

        return <InnerBlocks.Content/>;
    }
})


