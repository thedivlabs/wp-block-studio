import {
    BlockContextProvider,
    InspectorControls,
    useBlockProps,
    useInnerBlocksProps,
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "./block.json"

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

        const {ElementTag: ParentElementTag = 'div'} = context || {};

        const ElementTag = ['ul', 'ol'].includes(ParentElementTag) ? 'li' : 'div';

        const ref = useRef(null);

        const updateSettings = useCallback((newValue) => {
            const result = {
                ...attributes['wpbs-accordion-group-item'],
                ...newValue
            };

            setAttributes({
                'wpbs-accordion-group-item': result,
                'ElementTag': ElementTag
            });

        }, [setAttributes, attributes['wpbs-accordion-group-item']])

        const blockProps = useBlockProps({
            ref: ref,
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


            if (event.target.closest('.wpbs-accordion-group-header__toggle')) {

                if (!ref.current) {
                    return false;
                }

                ref.current.classList.toggle('active');
                ref.current.classList.toggle('--open');


            }
        };


        return <>

            <InspectorControls group="styles">
                <PanelBody title="Options" initialOpen={true}>
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

            <ElementTag {...innerBlocksProps} onClick={handleClick}></ElementTag>

        </>;
    },
    save: (props) => {

        const {ElementTag = 'div'} = props.attributes;

        const blockProps = useBlockProps.save({
            className: classNames(props.attributes),
            'data-wp-interactive': 'wpbs/accordion-group-item',
            'data-wp-init': 'actions.init',
        });

        const innerBlocksProps = useInnerBlocksProps.save(blockProps);

        return <ElementTag {...innerBlocksProps}></ElementTag>;
    }
})


