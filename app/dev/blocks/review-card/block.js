import {
    InnerBlocks,
    InspectorControls,
    useBlockProps,
    useInnerBlocksProps,
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "./block.json"
import {LAYOUT_ATTRIBUTES, LayoutControls} from "Components/Layout"
import {BACKGROUND_ATTRIBUTES, BackgroundControls, BackgroundElement} from "Components/Background"
import {Style, STYLE_ATTRIBUTES} from "Components/Style"
import {useInstanceId} from "@wordpress/compose";
import React, {useCallback} from "react";
import {LinkPost} from "Components/LinkPost";
import {useUniqueId} from "Includes/helper";

function sectionClassNames(attributes = {}) {

    return [
        'wpbs-review-card loop-card',
        'w-full block relative',
        attributes?.uniqueId ?? '',
    ].filter(x => x).join(' ');
}

const containerClassNames = 'wpbs-review-card__container wpbs-layout-wrapper relative z-20'

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...LAYOUT_ATTRIBUTES,
        ...BACKGROUND_ATTRIBUTES,
        ...STYLE_ATTRIBUTES,
        'wpbs-review-card': {
            type: 'object',
            default: {
                linkNewTab: undefined,
                linkRel: undefined,
                linkPost: undefined,
                linkTitle: undefined,
            }
        }
    },
    edit: ({attributes, setAttributes, context, clientId}) => {

        //const uniqueId = useInstanceId(registerBlockType, 'wpbs-review-card');

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

        return (
            <>
                <LinkPost defaultValue={attributes?.['wpbs-review-card']?.linkPost}
                          callback={(value) => updateSettings({linkPost: value})}/>
                <LayoutControls attributes={attributes} setAttributes={setAttributes}/>
                <BackgroundControls attributes={attributes} setAttributes={setAttributes}/>
                <Style attributes={attributes} setAttributes={setAttributes} selector={'wpbs-review-card'}
                       uniqueId={uniqueId}/>

                <div {...blockProps}>
                    <div {...useInnerBlocksProps({
                        className: containerClassNames,
                    })} />
                    <BackgroundElement attributes={attributes} editor={true}/>
                </div>
            </>
        )
    },
    save: (props) => <>
        <InnerBlocks.Content/>
        <BackgroundElement attributes={props.attributes} editor={false}/>
    </>
})


