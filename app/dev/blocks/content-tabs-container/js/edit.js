import {
    useBlockProps,
    useInnerBlocksProps, InspectorControls, PanelColorSettings, BlockContextProvider
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "../block.json"

import {Style, STYLE_ATTRIBUTES} from "Components/Style.js";
import {LayoutControls, LAYOUT_ATTRIBUTES} from "Components/Layout";

import {useState, useEffect} from '@wordpress/element';
import {InnerBlocks} from '@wordpress/block-editor';
import {useSelect} from '@wordpress/data';
import {store as blockEditorStore} from '@wordpress/block-editor';
import {useMemo} from '@wordpress/element';
import {useInstanceId} from "@wordpress/compose";


function classNames(attributes = {}) {
    return [
        'wpbs-content-tabs-container',
        'relative',
        attributes?.uniqueId ?? '',
    ].filter(x => x).join(' ');
}


registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...LAYOUT_ATTRIBUTES,
        ...STYLE_ATTRIBUTES,
        'wpbs-content-tabs-container': {
            type: 'object',
            default: {}
        }
    },
    edit: ({attributes, setAttributes, clientId}) => {

        const uniqueId = useInstanceId(registerBlockType, 'wpbs-figure');

        const blockProps = useBlockProps({
            className: classNames(attributes),
        });

        const innerBlocksProps = useInnerBlocksProps(blockProps, {
            allowedBlocks: [
                'wpbs/content-tabs-panel'
            ]
        });


        return <>

            <LayoutControls attributes={attributes} setAttributes={setAttributes}/>
            <Style attributes={attributes} setAttributes={setAttributes} uniqueId={uniqueId}
                   deps={['wpbs-content-tabs-container']}
            />
            <div {...innerBlocksProps}></div>
        </>;
    },
    save: (props) => {

        const blockProps = useBlockProps.save({
            className: classNames(props.attributes),
        });

        const innerBlocksProps = useInnerBlocksProps.save(blockProps);


        return <div {...innerBlocksProps}></div>;
    }
})


