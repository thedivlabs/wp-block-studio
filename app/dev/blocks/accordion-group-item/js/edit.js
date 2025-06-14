import {
    InspectorControls,
    useBlockProps,
    useInnerBlocksProps,
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "../block.json"

import {useEffect} from '@wordpress/element';

import {useInstanceId} from "@wordpress/compose";

import React, {useCallback, useRef} from "react";
import {
    ToggleControl,
    __experimentalGrid as Grid, PanelBody
} from "@wordpress/components";

function classNames(attributes = {}, editor = false) {

    return [
        'wpbs-accordion-group-item',
        !!attributes['wpbs-accordion-group-item']?.open ? 'active --open' : null,
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

        const ref = useRef(null);
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
            ref,
            className: classNames(attributes, true)
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

        const handleClick = (event) => {


            if (event.target.closest('button')) {


                if (!ref.current) {
                    return false;
                }

                ref.current.classList.toggle('active');
                ref.current.classList.toggle('--open');

            }
        };

        return <>

            <InspectorControls group="styles">
                <PanelBody title="Button" initialOpen={true}>
                    <Grid columns={1} columnGap={0} rowGap={0}>
                        <ToggleControl
                            label={'Open'}
                            checked={!!attributes['wpbs-accordion-group-item']?.['open']}
                            onChange={(newValue) => updateSettings({'open': newValue})}
                            className={'flex items-center'}
                            __nextHasNoMarginBottom
                        />
                    </Grid>
                </PanelBody>
            </InspectorControls>

            <div {...innerBlocksProps} onClick={handleClick}></div>

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


