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
    __experimentalUnitControl as UnitControl,
    __experimentalNumberControl as NumberControl,
} from "@wordpress/components";
import {Style, STYLE_ATTRIBUTES} from "Components/Style"
import Breakpoint from "Components/Breakpoint"


const ICON_STYLES = [
    {label: 'Select', value: ''},
    {label: 'Solid', value: '900'},
    {label: 'Regular', value: '400'},
    {label: 'Light', value: '300'},
];

const DIMENSION_UNITS = [
    {label: 'Select', value: ''},
    {value: 'px', label: 'px', default: 0, step: 1},
    {value: 'em', label: 'em', default: 0, step: .1},
    {value: 'rem', label: 'rem', default: 0, step: .1},
    {value: 'ch', label: 'ch', default: 0, step: 1},
]

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


        const updateSettings = useCallback((newValue) => {
            const result = {
                ...attributes['wpbs-icon-list'],
                ...newValue,
            };

            setAttributes({
                'wpbs-icon-list': result,
            });
        }, [attributes['wpbs-icon-list'], setAttributes]);

        const blockProps = useBlockProps({
            className: blockClasses(attributes),
        });

        const icon = attributes['wpbs-icon-list']?.icon?.match(/^[a-fA-F0-9]{4,6}$/) ? attributes['wpbs-icon-list'].icon : 'f00c';

        return <>
            <InspectorControls group="styles">
                <PanelBody initialOpen={true}>
                    <Grid columns={1} columnGap={15} rowGap={20}>

                        <Grid columns={2} columnGap={15} rowGap={20}>
                            <NumberControl
                                label="Columns Mobile"
                                value={attributes['wpbs-icon-list']?.columnsMobile ?? 1}
                                onChange={(val) => updateSettings({columnsMobile: val})}
                                min={1}
                                max={3}
                                step={1}
                                __next40pxDefaultSize
                                __nextHasNoMarginBottom
                            />
                            <NumberControl
                                label="Columns Large"
                                value={attributes['wpbs-icon-list']?.columnsLarge ?? 1}
                                onChange={(val) => updateSettings({columnsLarge: val})}
                                min={1}
                                max={3}
                                step={1}
                                __next40pxDefaultSize
                                __nextHasNoMarginBottom
                            />
                        </Grid>

                        <TextControl
                            label="Icon"
                            value={attributes['wpbs-icon-list'].icon ?? ''}
                            onChange={(val) => updateSettings({icon: val})}
                            __next40pxDefaultSize
                            __nextHasNoMarginBottom
                        />


                        <Grid columns={2} columnGap={15} rowGap={20}>

                            <SelectControl
                                label="Icon Style"
                                value={attributes['wpbs-icon-list'].iconStyle ?? ''}
                                options={ICON_STYLES}
                                onChange={(val) => updateSettings({iconStyle: val})}
                                __next40pxDefaultSize
                                __nextHasNoMarginBottom
                            />

                            <UnitControl
                                label="Icon Size"
                                value={attributes['wpbs-icon-list'].iconSize ?? ''}
                                onChange={(val) => updateSettings({iconSize: val})}
                                units={DIMENSION_UNITS}
                                isResetValueOnUnitChange={true}
                                __next40pxDefaultSize
                                __nextHasNoMarginBottom
                            />
                            <UnitControl
                                label="Icon Space"
                                value={attributes['wpbs-icon-list'].iconSpace ?? ''}
                                onChange={(val) => updateSettings({iconSpace: val})}
                                units={DIMENSION_UNITS}
                                isResetValueOnUnitChange={true}
                                __next40pxDefaultSize
                                __nextHasNoMarginBottom
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
                                    value: attributes['wpbs-icon-list'].iconColor ?? undefined,
                                    onChange: (newValue) => updateSettings({iconColor: newValue}),
                                    isShownByDefault: true,
                                }
                            ]}
                        />
                    </Grid>
                </PanelBody>
            </InspectorControls>
            <Style attributes={attributes} setAttributes={setAttributes}
                   deps={['wpbs-icon-list']}
                   props={{
                       '--line-height': attributes?.style?.typography?.lineHeight ?? '1.5em',
                       '--icon': `"\\${icon}"`,
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
            <ul {...useInnerBlocksProps.save({
                className: 'wpbs-icon-list__list'
            })}></ul>
        </div>
    }
})


