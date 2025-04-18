import {
    useBlockProps,
    BlockEdit,
    useInnerBlocksProps
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "../block.json"
import React from "react";

function blockClasses(attributes = {}) {
    return [
        'wpbs-slider-wrapper swiper-wrapper !flex !items-stretch grow min-w-full',
    ].filter(x => x).join(' ');
}

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
    },
    edit: ({attributes, setAttributes, clientId}) => {

        const blockProps = useBlockProps({
            className: blockClasses(attributes),
        });

        const innerBlocksProps = useInnerBlocksProps(blockProps, {
            template: [
                ['wpbs/slide', {content: 'Content Slide'}],
            ]
        });

        return <>
            <BlockEdit key="edit" {...blockProps} />

            <div {...innerBlocksProps}></div>

        </>;
    },
    save: (props) => {

        const blockProps = useBlockProps.save({
            className: blockClasses(props.attributes),
        });

        const innerBlocksProps = useInnerBlocksProps.save(blockProps);

        return (
            <div {...innerBlocksProps}></div>
        );
    }
})


