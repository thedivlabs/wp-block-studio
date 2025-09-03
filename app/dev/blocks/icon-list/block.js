import './scss/block.scss';

import {
    useBlockProps,
    useInnerBlocksProps, InspectorControls, PanelColorSettings
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "./block.json"

import React, {useCallback} from "react";
import {LayoutControls, LAYOUT_ATTRIBUTES} from "Components/Layout"
import {
    __experimentalGrid as Grid,
    PanelBody,
    TextControl,
    SelectControl,
    __experimentalUnitControl as UnitControl,
    __experimentalNumberControl as NumberControl, __experimentalBorderControl as BorderControl, ToggleControl,
} from "@wordpress/components";
import {Style, STYLE_ATTRIBUTES} from "Components/Style"
import Breakpoint from "Components/Breakpoint"
import {
    ICON_STYLES,
    DIMENSION_UNITS_TEXT,
} from "Includes/config"
import {useUniqueId} from "Includes/helper";
import {IconControl, MaterialIcon,iconProps} from "Components/IconControl";


function blockClasses(attributes = {}) {
    return [
        'wpbs-icon-list',
        attributes?.['wpbs-icon-list']?.divider ? 'wpbs-icon-list--divider' : null,
        'w-fit max-w-full',
        attributes?.uniqueId ?? '',
    ].filter(x => x).join(' ');
}

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...LAYOUT_ATTRIBUTES,
        ...STYLE_ATTRIBUTES,
        'wpbs-icon-list': {
            type: 'object',
            additionalProperties: true,
            default: {
                icon: undefined,
                iconStyle: undefined,
                iconColor: undefined,
                iconSize: undefined,
                iconSpace: undefined,
                columnsMobile: undefined,
                columnsLarge: undefined,
                divider: undefined,
                fit: undefined,
            }
        }
    },
    edit: ({attributes, setAttributes, clientId}) => {

        const {'wpbs-icon-list': settings = {}} = attributes;

        const uniqueId = useUniqueId(attributes, setAttributes, clientId);

        const breakpoint = WPBS.settings?.breakpoints[settings?.breakpoint ?? 'normal'];

        const updateSettings = useCallback((newValue) => {
            const result = {
                ...settings,
                ...newValue,
            };

            setAttributes({
                'wpbs-icon-list': result,
            });
        }, [settings, setAttributes]);

        const blockProps = useBlockProps({
            className: blockClasses(attributes),
        });

        return <>
            <InspectorControls group="styles">
                <PanelBody initialOpen={true}>
                    <Grid columns={1} columnGap={15} rowGap={20}>

                        <IconControl value={settings?.icon} label={'Icon'}
                                     onChange={(val) => updateSettings({icon: val})}/>

                        <Grid columns={2} columnGap={15} rowGap={20}>
                            <NumberControl
                                label="Columns Mobile"
                                value={settings?.columnsMobile ?? 1}
                                onChange={(val) => updateSettings({columnsMobile: val})}
                                min={1}
                                max={3}
                                step={1}
                                __next40pxDefaultSize
                                __nextHasNoMarginBottom
                            />
                            <NumberControl
                                label="Columns Large"
                                value={settings?.columnsLarge ?? 1}
                                onChange={(val) => updateSettings({columnsLarge: val})}
                                min={1}
                                max={3}
                                step={1}
                                __next40pxDefaultSize
                                __nextHasNoMarginBottom
                            />
                        </Grid>


                        <Grid columns={2} columnGap={15} rowGap={20}>

                            <UnitControl
                                label="Icon Space"
                                value={settings.iconSpace ?? ''}
                                onChange={(val) => updateSettings({iconSpace: val})}
                                units={DIMENSION_UNITS_TEXT}
                                isResetValueOnUnitChange={true}
                                __next40pxDefaultSize
                                __nextHasNoMarginBottom
                            />
                            <Breakpoint defaultValue={settings?.breakpoint}
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
                                    value: settings.iconColor ?? undefined,
                                    onChange: (newValue) => updateSettings({iconColor: newValue}),
                                    isShownByDefault: true,
                                }
                            ]}
                        />
                        <BorderControl
                            __next40pxDefaultSize
                            enableAlpha
                            enableStyle
                            disableUnits
                            value={settings?.divider || {}}
                            colors={WPBS?.settings?.colors ?? []}
                            __experimentalIsRenderedInSidebar={true}
                            label="Divider"
                            onChange={(newValue) => {
                                updateSettings({divider: newValue})
                            }}
                            shouldSanitizeBorder
                        />
                        <Grid columns={2} columnGap={15} rowGap={20}>
                            <ToggleControl
                                __nextHasNoMarginBottom
                                label="Fit Column"
                                checked={!!settings.fit ?? ''}
                                onChange={(val) => updateSettings({fit: val})}
                            />
                        </Grid>
                    </Grid>
                </PanelBody>
            </InspectorControls>
            <LayoutControls attributes={attributes} setAttributes={setAttributes}/>
            <Style attributes={attributes} setAttributes={setAttributes} uniqueId={uniqueId}
                   deps={['wpbs-icon-list']}
                   selector={'wpbs-icon-list'}
                   props={{
                       '--list-fit': !!settings?.fit ? 'auto' : null,
                       '--line-height': attributes?.style?.typography?.lineHeight ?? '1.5em',
                       ...iconProps(settings?.icon),
                       '--icon-color': settings?.iconColor,
                       '--icon-space': settings?.iconSpace,
                       '--list-columns': settings?.columnsMobile ?? settings?.columnsLarge ?? 1,
                       '--divider': settings?.divider ? [
                           settings?.divider?.width ?? '1px',
                           settings?.divider?.style ?? 'dashed',
                           settings?.divider?.color ?? null,
                       ].join(' ') : null,
                       breakpoints: {
                           [breakpoint]: {
                               '--list-columns': settings?.columnsLarge ?? settings?.columnsMobile ?? 1,
                           }
                       }
                   }}
            />
            <div {...blockProps}>
                <ul {...useInnerBlocksProps({
                    className: 'wpbs-icon-list__list'
                }, {
                    allowedBlocks: ['wpbs/icon-list-item'],
                    template: [['wpbs/icon-list-item']]
                })}></ul>
            </div>

        </>;
    },
    save: (props) => {

        const blockProps = useBlockProps.save({
            className: blockClasses(props.attributes),
            ...(props.attributes?.['wpbs-props'] ?? {})
        });

        return <div {...blockProps}>
            <ul {...useInnerBlocksProps.save({
                className: 'wpbs-icon-list__list'
            })}></ul>
        </div>
    }
})


