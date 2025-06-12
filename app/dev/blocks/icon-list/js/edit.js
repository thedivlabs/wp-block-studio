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
    __experimentalNumberControl as NumberControl,
} from "@wordpress/components";
import {Style, STYLE_ATTRIBUTES} from "Components/Style"
import Breakpoint from "Components/Breakpoint"


const ICON_STYLES = [
    {label: 'Solid', value: '900'},
    {label: 'Regular', value: '400'},
    {label: 'Light', value: '300'},
    {label: 'Thin', value: '100'},
];

function blockClasses(attributes = {}) {
    return [
        'wpbs-icon-list',
        (attributes.className || '').split(' ').includes('is-style-image') ? 'wpbs-icon-list--image' : null,
        'w-fit max-w-full',
        attributes.uniqueId,
    ].filter(x => x).join(' ');
}

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...STYLE_ATTRIBUTES,
        'wpbs-icon-list': {
            type: 'object',
            default: {
                icon: undefined,
                iconStyle: undefined,
                iconColor: undefined,
                iconSize: undefined,
                iconSpace: undefined,
                columnsMobile: undefined,
                columnsLarge: undefined,
            }
        }
    },
    edit: ({attributes, setAttributes, clientId}) => {

        const uniqueId = useInstanceId(registerBlockType, 'wpbs-icon-list');
        const breakpoint = WPBS.settings?.breakpoints[attributes['wpbs-icon-list']?.breakpoint ?? 'normal'];


        useEffect(() => {
            setAttributes({uniqueId: uniqueId});
        }, []);


        const updateSettings = useCallback(({newValue}) => {
            setAttributes({
                'wpbs-icon-list': {
                    ...attributes['wpbs-icon-list'],
                    ...newValue,
                },
            });
        }, [attributes['wpbs-icon-list'], setAttributes, uniqueId]);

        const blockProps = useBlockProps({
            className: blockClasses(attributes),
        });

        return <>
            <InspectorControls group="styles">
                <Grid columns={1} columnGap={15} rowGap={20}>

                    <Grid columns={2} columnGap={15} rowGap={20}>
                        <NumberControl
                            label="Columns Mobile"
                            value={attributes['wpbs-icon-list']?.columnsMobile ?? 1}
                            onChange={(val) => updateSettings({columnsMobile: val})}
                            min={1}
                            max={3}
                            step={1}
                        />
                        <NumberControl
                            label="Columns Large"
                            value={attributes['wpbs-icon-list']?.columnsLarge ?? 1}
                            onChange={(val) => updateSettings({columnsLarge: val})}
                            min={1}
                            max={3}
                            step={1}
                        />
                    </Grid>

                    <TextControl
                        label="Icon"
                        value={attributes['wpbs-icon-list'].icon ?? ''}
                        onChange={(val) => updateSettings({icon: val})}
                    />


                    <Grid columns={2} columnGap={15} rowGap={20}>

                        <SelectControl
                            label="Icon Style"
                            value={attributes['wpbs-icon-list'].iconStyle ?? ''}
                            options={ICON_STYLES}
                            onChange={(val) => updateSettings({iconStyle: val})}
                        />
                        <UnitControl
                            label="Icon Size"
                            value={attributes['wpbs-icon-list'].iconSize ?? ''}
                            onChange={(val) => updateSettings({iconSize: val})}
                            units={['px', 'em', 'rem']}
                            isResettable
                        />
                        <UnitControl
                            label="Icon Space"
                            value={attributes['wpbs-icon-list'].iconSpace ?? ''}
                            onChange={(val) => updateSettings({iconSpace: val})}
                            units={['px', 'em', 'rem', 'ch']}
                            isResettable
                        />
                        <Breakpoint defaultValue={attributes['wpbs-icon-list']?.breakpoint}
                                    callback={(newValue) => updateSettings({breakpoint: newValue})}
                        />
                    </Grid>
                    <PanelColorSettings
                        enableAlpha
                        className={'!p-0 !border-0 [&_.components-tools-panel-item]:!m-0'}
                        colorSettings={[
                            {
                                slug: 'iconColor',
                                label: 'Icon Color',
                                value: attributes['wpbs-icon-list'].iconColor ?? '',
                                onChange: (newValue) => updateSettings({iconColor: newValue}),
                                isShownByDefault: true,
                            }
                        ]}
                    />
                </Grid>
            </InspectorControls>
            <Style attributes={attributes} setAttributes={setAttributes}
                   deps={['wpbs-icon-list']}
                   props={{
                       '--icon': attributes['wpbs-icon-list']?.icon,
                       '--icon-color': attributes['wpbs-icon-list']?.iconColor,
                       '--icon-size': attributes['wpbs-icon-list']?.iconSize,
                       '--icon-space': attributes['wpbs-icon-list']?.iconSpace,
                       '--icon-style': attributes['wpbs-icon-list']?.iconStyle,
                       '--list-columns': attributes['wpbs-icon-list']?.columnsMobile ?? attributes['wpbs-icon-list']?.columnsLarge ?? 1,
                       breakpoints: {
                           [breakpoint]: {
                               '--list-columns': attributes['wpbs-icon-list']?.columnsLarge ?? attributes['wpbs-icon-list']?.columnsMobile ?? 1,
                           }
                       }
                   }}
            />
            <div {...blockProps}>
                <ul {...useInnerBlocksProps({
                    className: 'wpbs-icon-list__list'
                }, {
                    allowedBlocks: ['wpbs/icon-list-item']
                })}></ul>
            </div>

        </>;
    },
    save: (props) => {

        const blockProps = useBlockProps.save({
            className: blockClasses(props.attributes)
        });

        return <div {...blockProps}>
            <ul {...useInnerBlocksProps.save( {
                className: 'wpbs-icon-list__list'
            })}></ul>
        </div>
    }
})


