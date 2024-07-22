import {
    useBlockProps, InspectorControls, RichText, InnerBlocks, withColors,
    __experimentalColorGradientSettingsDropdown as ColorGradientSettingsDropdown,
    __experimentalUseMultipleOriginColorsAndGradients as useMultipleOriginColorsAndGradients
} from "@wordpress/block-editor"
import {Dropdown,SelectControl, ToggleControl, PanelBody,RangeControl, Button, BaseControl, useBaseControlProps } from "@wordpress/components"
import {MediaUpload} from "@wordpress/media-utils"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "../block.json"
import { useState } from 'react';
import Background from 'components/Background';


registerBlockType(metadata.name, {
    apiVersion: 3,
    supports: {
        innerBlocks: true,
        color: {
            background: true,
            text: true,
            link: true,
            gradients: true,
        },
        spacing: {
            blockGap: true,
            padding: true,
            margin: true,
        },
    },
    styles: [
        {
            name: 'split',
            label: 'Split'
        },
        {
            name: 'card',
            label: 'Card'
        },
        {
            name: 'card-reverse',
            label: 'Card Reverse'
        },
        {
            name: 'sidebar',
            label: 'Sidebar'
        },
        {
            name: 'sidebar-reverse',
            label: 'Sidebar Reverse'
        },
        {
            name: 'block',
            label: 'Block'
        }
    ],
    attributes: {
        height: {
            type: 'string'
        },
        align: {
            type: 'string'
        },
        justify: {
            type: 'string'
        },
        container: {
            type: 'string'
        },
        grow: {
            type: 'boolean'
        },
        background: {
            type: 'object'
        }
    },
    edit: ({attributes, setAttributes, style, clientId}) => {
        const {
            height,
            align,
            justify,
            container,
            grow
        } = attributes;

        const blockProps = useBlockProps({
            className: 'wpbs-content-section w-full',
            style: {}
        });


        return (
            <>
                <Background></Background>
                <InspectorControls>
                    <PanelBody title={'Layout'}>

                        <ToggleControl
                            label="Grow"
                            checked={grow}
                            onChange={(value)=>setAttributes({grow: value})}
                        />

                        <SelectControl
                            label="Select Control"
                            //value={'selectField'}
                            options={[
                                {value: 'a', label: 'Option A'},
                                {value: 'b', label: 'Option B'},
                                {value: 'c', label: 'Option C'},
                            ]}
                            //onChange={onChangeSelectField}
                        />
                    </PanelBody>
                </InspectorControls>

                <section {...blockProps}>
                    <div className={'container wpbs-container'}>
                        <InnerBlocks/>
                    </div>
                </section>
            </>
        )
    },
    save: (props) => {
        const blockProps = useBlockProps.save({
            className: 'wpbs-content-section w-full',
        });

        return (
            <section {...blockProps}>
                <div className={'container wpbs-container'}>
                    <InnerBlocks.Content/>
                </div>
            </section>
        );
    }
})


