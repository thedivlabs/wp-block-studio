import '../scss/block.scss'


import {
    useBlockProps,
    useInnerBlocksProps, InspectorControls, PanelColorSettings, BlockContextProvider
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "../block.json"

import {Style, STYLE_ATTRIBUTES} from "Components/Style.js";
import {LayoutControls, LAYOUT_ATTRIBUTES} from "Components/Layout"

import {useState, useEffect} from '@wordpress/element';
import {select, subscribe} from '@wordpress/data';
import {store as blockEditorStore} from '@wordpress/block-editor';
import {useInstanceId} from "@wordpress/compose";
import {
    PanelBody, TabPanel,
    __experimentalBorderControl as BorderControl,
    __experimentalGrid as Grid,
    __experimentalInputControl as InputControl,
    __experimentalNumberControl as NumberControl,
    __experimentalUnitControl as UnitControl,
    BaseControl,
    ToggleControl, __experimentalBoxControl as BoxControl
} from "@wordpress/components";
import React, {useCallback} from "react";

const DIMENSION_UNITS = [
    {value: 'px', label: 'px', default: 0},
    {value: 'em', label: 'em', default: 0},
    {value: 'rem', label: 'rem', default: 0},
]

function classNames(attributes = {}) {

    return [
        'wpbs-content-accordion',
        'w-full relative',
        attributes.uniqueId,
    ].filter(x => x).join(' ');
}

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...LAYOUT_ATTRIBUTES,
        ...STYLE_ATTRIBUTES,
        'wpbs-content-accordion': {
            type: 'object',
            default: {}
        }
    },
    edit: ({attributes, setAttributes, clientId}) => {

        const uniqueId = useInstanceId(registerBlockType, 'wpbs-content-accordion');

        useEffect(() => {
            setAttributes({
                'uniqueId': uniqueId
            });
        }, []);

        const updateSettings = useCallback((newValue) => {
            const result = {
                ...attributes['wpbs-content-accordion'],
                ...newValue
            };

            setAttributes({
                'wpbs-content-accordion': result
            });

        }, [setAttributes, attributes['wpbs-content-accordion']])


        const blockProps = useBlockProps({
            className: classNames(attributes),
        });

        const innerBlocksProps = useInnerBlocksProps(blockProps, {
            template: [
                ['wpbs/content-accordion-item'],
            ],
            allowedBlocks: [
                'wpbs/content-accordion-item',
            ],
        });

        return <>
            <InspectorControls group="styles">
                <Grid columns={1} columnGap={0} rowGap={0}>
                    <></>
                </Grid>
            </InspectorControls>

            <LayoutControls attributes={attributes} setAttributes={setAttributes}/>
            <Style attributes={attributes} setAttributes={setAttributes}
                   deps={['wpbs-content-accordion']}
            />

            <div {...innerBlocksProps}></div>

        </>;
    },
    save: (props) => {

        const blockProps = useBlockProps.save({
            className: classNames(props.attributes),
            'data-wp-interactive': 'wpbs/content-accordion',
            'data-wp-init': 'actions.init',
        });

        const innerBlocksProps = useInnerBlocksProps.save(blockProps);

        return <div {...innerBlocksProps}></div>;
    }
})


