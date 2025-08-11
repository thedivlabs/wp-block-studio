import {
    InnerBlocks,
    InspectorControls,
    useBlockProps,
    useInnerBlocksProps,
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "./block.json"
import {LAYOUT_ATTRIBUTES, LayoutControls} from "Components/Layout"
import {Style, STYLE_ATTRIBUTES} from "Components/Style"
import React, {useCallback} from "react";
import {LinkPost} from "Components/LinkPost";
import {useUniqueId} from "Includes/helper";

function sectionClassNames(attributes = {}) {

    return [
        'wpbs-review-card loop-card swiper-slide',
        'w-full block relative',
        attributes?.uniqueId ?? '',
    ].filter(x => x).join(' ');
}

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...LAYOUT_ATTRIBUTES,
        ...STYLE_ATTRIBUTES,
        'wpbs-review-card': {
            type: 'object'
        }
    },
    edit: ({attributes, setAttributes, context, clientId}) => {

        const uniqueId = useUniqueId(attributes, setAttributes, clientId);

        const updateSettings = useCallback((newValue) => {
            const result = {
                ...attributes['wpbs-review-card'],
                ...newValue
            };

            setAttributes({
                'wpbs-review-card': result,
            });
        }, [setAttributes, attributes['wpbs-review-card']]);

        const blockProps = useBlockProps({
            className: sectionClassNames(attributes),
        });

        const innerBlocksProps = useInnerBlocksProps(blockProps);

        return (
            <>
                <LinkPost defaultValue={attributes?.['wpbs-review-card']?.linkPost}
                          callback={(value) => updateSettings({linkPost: value})}/>
                <LayoutControls attributes={attributes} setAttributes={setAttributes}/>
                <Style attributes={attributes} setAttributes={setAttributes} selector={'wpbs-review-card'}
                       uniqueId={uniqueId}/>

                <div {...innerBlocksProps}/>


            </>
        )
    },
    save: (props) => <>
        <InnerBlocks.Content/>
    </>
})


