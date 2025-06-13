import {
    useBlockProps,
    useContext,
    useInnerBlocksProps, InspectorControls, PanelColorSettings, BlockContextProvider
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "../block.json"

import {Style, STYLE_ATTRIBUTES} from "Components/Style.js";
import {LayoutControls, LAYOUT_ATTRIBUTES} from "Components/Layout"

import {useEffect} from '@wordpress/element';

import {useInstanceId} from "@wordpress/compose";
import {
    __experimentalGrid as Grid,
} from "@wordpress/components";
import React, {useCallback} from "react";

function classNames(attributes = {}) {

    return [
        'wpbs-content-accordion-item',
        'w-full relative',
        attributes.uniqueId,
    ].filter(x => x).join(' ');
}

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        'wpbs-content-accordion-item': {
            type: 'object',
            default: {}
        }
    },
    edit: ({attributes, setAttributes, clientId, context}) => {

        const uniqueId = useInstanceId(registerBlockType, 'wpbs-content-accordion-item');
        const {itemStyles, setItemStyles} = context;

        useEffect(() => {
            setAttributes({
                'uniqueId': uniqueId
            });
        }, []);

        console.log(itemStyles);

        /* useEffect(() => {
             setStyles({
                 header: {
                     ...headerStyle,
                     ...attributes?.style,
                 },
             });
         }, [headerStyle, setStyles]);*/

        const blockProps = useBlockProps({
            className: classNames(attributes),
            style: itemStyles
        });

        const innerBlocksProps = useInnerBlocksProps(blockProps, {
            template: [
                ['wpbs/content-accordion-header'],
                ['wpbs/content-accordion-content'],
            ],
            allowedBlocks: [
                'wpbs/content-accordion-header',
                'wpbs/content-accordion-content',
            ],
            templateLock: 'all'
        });

        console.log(itemStyles);
        console.log(setItemStyles);

        return <>

            <div {...innerBlocksProps}></div>

        </>;
    },
    save: (props) => {

        const blockProps = useBlockProps.save({
            className: classNames(props.attributes),
            'data-wp-interactive': 'wpbs/content-accordion-item',
            'data-wp-init': 'actions.init',
        });

        const innerBlocksProps = useInnerBlocksProps.save(blockProps);

        return <div {...innerBlocksProps}></div>;
    }
})


