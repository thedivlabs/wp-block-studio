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


function classNames(attributes, editor = false, isSelected = false) {
    return [
        'wpbs-content-tabs-panel',
        !!isSelected ? 'active' : null,
        attributes?.uniqueId ?? '',
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

        const uniqueId = useUniqueId(attributes, setAttributes, clientId);

        const isSelected = useSelect(
            (select) => select(blockEditorStore).isBlockSelected(clientId),
            [clientId]
        );

        const hasChildSelected = useSelect(
            (select) => select(blockEditorStore).hasSelectedInnerBlock(clientId, true),
            [clientId]
        );

        const isActive = (context?.activeTab === clientId) || isSelected || hasChildSelected;

        const blockProps = useBlockProps({
            className: classNames(attributes, true, isActive),
        });

        const innerBlocksProps = useInnerBlocksProps(blockProps);

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
            <div {...innerBlocksProps} role={'tabpanel'}></div>

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


