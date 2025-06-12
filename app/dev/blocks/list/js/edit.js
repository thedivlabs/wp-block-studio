import '../scss/block.scss';

import {
    useBlockProps,
    useInnerBlocksProps, InspectorControls, PanelColorSettings
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "../block.json"

import React, {useCallback, useEffect, useMemo} from "react";
import {useInstanceId} from '@wordpress/compose';
import {
    __experimentalGrid as Grid,
    PanelBody,
    TextControl,
    SelectControl,
    ColorPalette,
    BaseControl,
    __experimentalUnitControl as UnitControl,
} from "@wordpress/components";
import {Style, STYLE_ATTRIBUTES} from "Components/Style"


const ICON_STYLES = [
    { label: 'Solid', value: 'fas' },
    { label: 'Regular', value: 'far' },
    { label: 'Light', value: 'fal' },
    { label: 'Thin', value: 'fat' },
    { label: 'Duotone', value: 'fad' },
    { label: 'Brands', value: 'fab' },
];

function blockClasses(attributes = {}) {
    return [
        'wpbs-list',
        (attributes.className || '').split(' ').includes('is-style-image') ? 'wpbs-list--image' : null,
        'w-fit max-w-full',
        attributes.uniqueId,
    ].filter(x => x).join(' ');
}

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...STYLE_ATTRIBUTES,
        'wpbs-list': {
            type: 'object',
            default: {
                icon: undefined,
                iconStyle: undefined,
                iconColor: undefined,
                iconSize: undefined,
            }
        }
    },
    edit: ({attributes, setAttributes, clientId}) => {

        const uniqueId = useInstanceId(registerBlockType, 'wpbs-list');

        useEffect(() => {
            setAttributes({uniqueId: uniqueId});
        }, []);


        const updateSettings = useCallback((newValue, prop) => {
            setAttributes({
                'wpbs-list': {
                    ...attributes['wpbs-list'],
                    [prop]: newValue,
                },
            });
        }, [attributes['wpbs-list'], setAttributes, uniqueId]);

        const blockProps = useBlockProps({
            className: blockClasses(attributes),
        });

        return <>
            <InspectorControls group="styles">
                <Grid columns={1} columnGap={15} rowGap={20}>

                    <PanelBody title="Icon Settings" initialOpen={true}>
                        <TextControl
                            label="FontAwesome Icon Name"
                            value={settings.icon ?? ''}
                            onChange={(val) => updateSettings({ icon: val })}
                            placeholder="e.g. check, arrow-right"
                        />

                        <SelectControl
                            label="Icon Style"
                            value={settings.iconStyle ?? ''}
                            options={[
                                { label: 'Default', value: '' },
                                { label: 'Solid', value: 'fas' },
                                { label: 'Regular', value: 'far' },
                                { label: 'Light', value: 'fal' },
                                { label: 'Thin', value: 'fat' },
                                { label: 'Duotone', value: 'fad' },
                                { label: 'Brands', value: 'fab' },
                            ]}
                            onChange={(val) => updateSettings({ iconStyle: val })}
                        />

                        <PanelColorSettings
                            enableAlpha
                            className={'!p-0 !border-0 [&_.components-tools-panel-item]:!m-0'}
                            colorSettings={[
                                {
                                    slug: 'iconColor',
                                    label: 'Icon Color',
                                    value: settings.iconColor ?? '',
                                    onChange: (newValue) => updateSettings({ iconColor: newValue }),
                                    isShownByDefault: true
                                }
                            ]}
                        />

                        <UnitControl
                            label="Icon Size"
                            value={settings.iconSize ?? ''}
                            onChange={(val) => updateSettings({ iconSize: val })}
                            units={['px', 'em', 'rem']}
                            isResettable
                        />
                    </PanelBody>

                </Grid>
            </InspectorControls>
            <Style attributes={attributes} setAttributes={setAttributes}
                   deps={['wpbs-list']}
                   props={{}}
            />

            <ul {...useInnerBlocksProps(blockProps, {
                allowedBlocks: ['your-namespace/list-item']
            })}></ul>

        </>;
    },
    save: (props) => {

        const blockProps = useBlockProps.save({
            className: blockClasses(props.attributes)
        });

        return <ul {...useInnerBlocksProps.save(blockProps)}></ul>;
    }
})


