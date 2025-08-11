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
        'wpbs-review-content',
        'w-fit inline-block',
        attributes?.uniqueId ?? '',
    ].filter(x => x).join(' ');
}

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...LAYOUT_ATTRIBUTES,
        ...STYLE_ATTRIBUTES,
        'wpbs-review-content': {
            type: 'object'
        }
    },
    edit: ({attributes, setAttributes, context, clientId}) => {

        const uniqueId = useUniqueId(attributes, setAttributes, clientId);

        const updateSettings = useCallback((newValue) => {
            const result = {
                ...attributes['wpbs-review-content'],
                ...newValue
            };

            setAttributes({
                'wpbs-review-content': result,
            });
        }, [setAttributes, attributes['wpbs-review-content']]);

        const blockProps = useBlockProps({
            className: sectionClassNames(attributes),
        });

        return (
            <>
                <LinkPost defaultValue={attributes?.['wpbs-review-content']?.linkPost}
                          callback={(value) => updateSettings({linkPost: value})}/>
                <LayoutControls attributes={attributes} setAttributes={setAttributes}/>
                <Style attributes={attributes} setAttributes={setAttributes} selector={'wpbs-review-content'}
                       uniqueId={uniqueId}/>

                <div {...blockProps}/>


            </>
        )
    },
    save: (props) => null
})


