import {
    useBlockProps,
    BlockEdit,
    useInnerBlocksProps, PanelColorSettings, InspectorControls
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "../block.json"
import React, {useState} from "react";
import {__experimentalGrid as Grid, PanelBody} from "@wordpress/components";
import Height from "Components/Height";

function blockClasses(attributes = {}) {
    return [
        'wpbs-slider-wrapper swiper-wrapper !flex !items-stretch grow min-w-full',
    ].filter(x => x).join(' ');
}

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        'wpbs-layout-height': {
            type: 'string'
        }
    },
    edit: ({attributes, setAttributes, clientId}) => {

        const blockProps = useBlockProps({
            className: blockClasses(attributes),
        });

        const [height, setHeight] = useState(attributes['wpbs-layout-height']);

        const innerBlocksProps = useInnerBlocksProps(blockProps, {
            template: [
                ['wpbs/slide', {content: 'Content Slide'}],
            ]
        });

        return <>
            <BlockEdit key="edit" {...blockProps} />

            <InspectorControls group="styles">
                <PanelBody initialOpen={true}>
                    <Grid columns={1} columnGap={15} rowGap={20}>
                        <Height defaultValue={height} callback={(newValue) => {
                            setAttributes({'wpbs-layout-height': newValue});
                            setHeight(newValue);
                        }}/>
                    </Grid>
                </PanelBody>
            </InspectorControls>

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


