import {
    useBlockProps,
    InspectorControls, PanelColorSettings
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "./block.json"

import {Style, STYLE_ATTRIBUTES} from "Components/Style";
import {LayoutControls, LAYOUT_ATTRIBUTES} from "Components/Layout"
import {
    __experimentalGrid as Grid, PanelBody,
    __experimentalUnitControl as UnitControl,
    TextControl
} from "@wordpress/components";
import React, {useCallback} from "react";
import {useUniqueId} from "Includes/helper";
import {DIMENSION_UNITS_TEXT} from "Includes/config";

function classNames(attributes = {}) {

    return [
        'wpbs-flyout-button wpbs-flyout-toggle',
        'relative flex flex-col items-center justify-center h-[1.2em] text-center cursor-pointer leading-none before:font-fa before:content-[var(--icon)] before:block',
        attributes?.uniqueId ?? '',
    ].filter(x => x).join(' ');
}

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...LAYOUT_ATTRIBUTES,
        ...STYLE_ATTRIBUTES,
        'wpbs-flyout-button': {
            type: 'object',
            default: {}
        }
    },
    edit: ({attributes, setAttributes, clientId}) => {

        const uniqueId = useUniqueId(attributes, setAttributes, clientId);

        const {'wpbs-flyout-button': settings = {}} = attributes;

        const updateSettings = useCallback((newValue) => {
            const result = {
                ...attributes['wpbs-flyout-button'],
                ...newValue
            };

            setAttributes({
                'wpbs-flyout-button': result
            });

        }, [setAttributes, settings])

        const blockProps = useBlockProps({
            className: classNames(attributes),
        });

        const cssProps = {
            '--icon': '\"' + '\\' + (settings?.icon ?? 'f0c9') + '\"',
            '--color-label': settings?.['color-label'] ?? null,
        };

        return <>

            <InspectorControls group={'styles'}>
                <PanelBody initialOpen={true}>
                    <Grid columns={1} columnGap={15} rowGap={20}>
                        <Grid columns={2} columnGap={15} rowGap={20}>
                            <TextControl
                                __nextHasNoMarginBottom
                                __next40pxDefaultSize
                                label="Icon"
                                value={settings?.icon ?? ''}
                                onChange={(newValue) => updateSettings({icon: newValue})}
                            />
                            <TextControl
                                __nextHasNoMarginBottom
                                __next40pxDefaultSize
                                label="Label"
                                value={settings?.label ?? ''}
                                onChange={(newValue) => updateSettings({label: newValue})}
                            />
                            <UnitControl
                                label="Label Size"
                                value={settings?.['label-size'] ?? ''}
                                units={DIMENSION_UNITS_TEXT}
                                isResetValueOnUnitChange={true}
                                __next40pxDefaultSize
                                __nextHasNoMarginBottom
                                onChange={(newValue) => updateSettings({'label-size': newValue})}
                            />
                        </Grid>
                        <PanelColorSettings
                            enableAlpha
                            className={'!p-0 !border-0 [&_.components-tools-panel-item]:!m-0'}
                            colorSettings={[
                                {
                                    slug: 'color-label',
                                    label: 'Label',
                                    value: settings?.['color-label'],
                                    onChange: (newValue) => updateSettings({'color-label': newValue}),
                                    isShownByDefault: true
                                }
                            ]}
                        />

                    </Grid>
                </PanelBody>
            </InspectorControls>

            <LayoutControls attributes={attributes} setAttributes={setAttributes}/>
            <Style attributes={attributes} setAttributes={setAttributes} uniqueId={uniqueId}
                   props={cssProps} selector={'wpbs-flyout-button'}
                   deps={['wpbs-flyout-button']}
            />

            <div {...blockProps} >
                {!!settings?.label ? <span>{settings?.label}</span> : null}
            </div>

        </>;
    },
    save: (props) => {

        const {'wpbs-flyout-button': settings = {}} = props.attributes;

        const blockProps = useBlockProps.save({
            className: classNames(props.attributes),
            'data-wp-interactive': 'wpbs/flyout',
            'data-wp-on--click': 'actions.toggle',
        });


        return <button {...blockProps} type={'button'}>
            {!!settings?.label ? <span>{settings?.label}</span> :
                <span className={'screen-reader-text'}>Toggle navigation menu</span>}
        </button>;
    }
})


