import {
    useBlockProps,
    BlockEdit,
    useInnerBlocksProps
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "../block.json"
import React from "react";
import {useInstanceId} from "@wordpress/compose";
import {useEffect} from "react";

function blockClasses(attributes = {}) {
    return [
        'wpbs-slider-navigation',
    ].filter(x => x).join(' ');
}

const BlockContent = <>NAVIGATION</>;

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
    },
    edit: ({attributes, setAttributes, clientId}) => {

        const uniqueId = useInstanceId(registerBlockType, 'wpbs-layout-element');

        useEffect(() => {
            setAttributes({uniqueId: uniqueId});
        }, []);

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
            <BlockContent/>
        </>;
    },
    save: (props) => {

        const blockProps = useBlockProps.save({
            className: blockClasses(props.attributes),
        });

        return (
            <BlockContent/>
        );
    }
})


