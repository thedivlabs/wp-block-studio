import {
    useBlockProps,
    useInnerBlocksProps, InspectorControls, PanelColorSettings, BlockContextProvider
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "./block.json"

import {Style, STYLE_ATTRIBUTES} from "Components/Style.js";
import {LayoutControls, LAYOUT_ATTRIBUTES} from "Components/Layout"

import {useState, useEffect} from '@wordpress/element';
import {InnerBlocks} from '@wordpress/block-editor';
import {useSelect} from '@wordpress/data';
import {store as blockEditorStore} from '@wordpress/block-editor';
import {useMemo} from '@wordpress/element';
import {useInstanceId} from "@wordpress/compose";
import {TextControl} from "@wordpress/components";
import {useUniqueId} from "Includes/helper";


function classNames(attributes, isActive = false, editor = false) {
    return [
        'wpbs-content-tabs-panel',
        attributes?.uniqueId ?? '',
        !!isActive ? 'active' : null,
    ].filter(x => x).join(' ');
}


registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...LAYOUT_ATTRIBUTES,
        ...STYLE_ATTRIBUTES,
        'wpbs-content-tabs-panel': {
            type: 'object',
            default: {}
        }
    },
    edit: ({attributes, setAttributes, clientId, context}) => {

        //const uniqueId = useInstanceId(registerBlockType, 'wpbs-content-tabs-panel');

        const uniqueId = useUniqueId(attributes, setAttributes, clientId);

        const blockProps = useBlockProps({
            className: classNames(attributes, true),
        });

        const innerBlocksProps = useInnerBlocksProps(blockProps);

        const isActive = false;

        return <>
            <InspectorControls group={'advanced'}>
                <TextControl
                    __nextHasNoMarginBottom
                    __next40pxDefaultSize
                    label="Title"
                    value={attributes?.title}
                    onChange={(value) => setAttributes({title: value})}
                />
            </InspectorControls>
            <LayoutControls attributes={attributes} setAttributes={setAttributes}/>
            <Style attributes={attributes} setAttributes={setAttributes} uniqueId={uniqueId}
                   deps={['wpbs-content-tabs-panel']} selector={'wpbs-content-tabs-panel'}
            />
            <div {...innerBlocksProps} aria-selected={!!isActive} role={'tabpanel'}></div>

        </>;
    },
    save: (props) => {

        const blockProps = useBlockProps.save({
            className: classNames(props.attributes),
            ...(props.attributes?.['wpbs-props'] ?? {})
        });

        const innerBlocksProps = useInnerBlocksProps.save(blockProps);


        return <div {...innerBlocksProps}></div>;
    }
})


