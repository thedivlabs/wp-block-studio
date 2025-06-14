import {
    InspectorControls,
    useBlockProps,
    useInnerBlocksProps,
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "../block.json"

import {useEffect} from '@wordpress/element';

import {useInstanceId} from "@wordpress/compose";

import React, {useCallback} from "react";
import {
    ToggleControl,
    __experimentalGrid as Grid
} from "@wordpress/components";

function classNames(attributes = {}, editor = false) {

    return [
        'wpbs-accordion-group-item',
        !!attributes['wpbs-accordion-group-item']?.open ? 'active' : null,
        attributes.uniqueId,
    ].filter(x => x).join(' ');
}

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        'wpbs-accordion-group-item': {
            type: 'object',
            default: {}
        }
    },
    edit: ({attributes, setAttributes, clientId, context}) => {

        const uniqueId = useInstanceId(registerBlockType, 'wpbs-accordion-group-item');

        useEffect(() => {
            setAttributes({
                'uniqueId': uniqueId
            });
        }, []);

        const updateSettings = useCallback((newValue) => {
            const result = {
                ...attributes['wpbs-accordion-group-item'],
                ...newValue
            };

            setAttributes({
                'wpbs-accordion-group-item': result
            });

        }, [setAttributes, attributes['wpbs-accordion-group-item']])

        const blockProps = useBlockProps({
            className: classNames(attributes, true),
        });

        const innerBlocksProps = useInnerBlocksProps(blockProps, {
            template: [
                ['wpbs/accordion-group-header'],
                ['wpbs/accordion-group-content'],
            ],
            allowedBlocks: [
                'wpbs/accordion-group-header',
                'wpbs/accordion-group-content',
            ],
            templateLock: 'all'
        });

        return <>

            <InspectorControls group="styles">
                <Grid columns={1} columnGap={0} rowGap={0}>
                    <ToggleControl
                        label={'Open'}
                        checked={!!attributes['wpbs-accordion-group-item']?.['open']}
                        onChange={(newValue) => updateSettings({'open': newValue})}
                        className={'flex items-center'}
                        __nextHasNoMarginBottom
                    />
                </Grid>
            </InspectorControls>

            <div {...innerBlocksProps}></div>

        </>;
    },
    save: (props) => {

        const blockProps = useBlockProps.save({
            className: classNames(props.attributes),
            'data-wp-interactive': 'wpbs/accordion-group-item',
            'data-wp-init': 'actions.init',
        });

        const innerBlocksProps = useInnerBlocksProps.save(blockProps);

        return <div {...innerBlocksProps}></div>;
    }
})


