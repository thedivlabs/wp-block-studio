import {dateI18n} from '@wordpress/date';

import {
    useBlockProps,
    InspectorControls, BlockEdit, RichText
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "./block.json"
import {LAYOUT_ATTRIBUTES, LayoutControls} from "Components/Layout"
import {
    __experimentalGrid as Grid,
    PanelBody, SelectControl,
    TextControl,
} from "@wordpress/components";
import React, {useCallback, useMemo} from "react";
import {Style, STYLE_ATTRIBUTES} from "Components/Style.js";
import {useUniqueId} from "Includes/helper";


function classNames(attributes = {}) {

    const {'wpbs-current-date': settings = {}} = attributes;

    return [
        'wpbs-current-date w-fit inline-flex',
        attributes?.uniqueId ?? '',
    ].filter(x => x).join(' ');
}


registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...LAYOUT_ATTRIBUTES,
        ...STYLE_ATTRIBUTES,
        'wpbs-current-date': {
            type: 'object',
            default: {}
        }
    },
    edit: ({attributes, setAttributes, clientId}) => {

        const uniqueId = useUniqueId(attributes, setAttributes, clientId);

        const {'wpbs-current-date': settings = {}} = attributes;

        const updateSettings = useCallback((newValue) => {

            const result = {
                ...settings,
                ...newValue,
            }

            setAttributes({
                'wpbs-current-date': result
            });

        }, [settings]);


        const blockProps = useBlockProps({
            className: classNames(attributes)
        });
        
        const Now = useMemo(() => {
            return dateI18n(settings?.format ?? 'm/d/Y', new Date());
        }, [settings]);

        return (
            <>
                <BlockEdit key="edit" {...blockProps} />
                <InspectorControls group="styles">
                    <PanelBody initialOpen={true}>
                        <Grid columns={1} columnGap={15} rowGap={20}>
                            <SelectControl
                                __nextHasNoMarginBottom
                                label="Format"
                                value={settings?.format ?? ''}
                                options={[
                                    {label: 'Select', value: ''},
                                    {label: 'Current Year', value: 'Y'},
                                    {label: 'Wednesday, August 27, 2025', value: 'l, F j, Y'},
                                    {label: '08/27/2025', value: 'm/d/Y'},
                                    {label: '27 Aug 2025', value: 'd M Y'},
                                ]}
                                onChange={(newValue) => updateSettings({'format': newValue})}
                            />

                            <TextControl
                                __nextHasNoMarginBottom
                                __next40pxDefaultSize
                                label="Format Custom"
                                value={settings?.['format-custom'] ?? ''}
                                onChange={(newValue) => updateSettings({'format-custom': newValue})}
                            />

                            <TextControl
                                __nextHasNoMarginBottom
                                __next40pxDefaultSize
                                label="Prefix"
                                value={settings?.prefix ?? ''}
                                onChange={(newValue) => updateSettings({prefix: newValue})}
                            />
                        </Grid>
                    </PanelBody>
                </InspectorControls>

                <LayoutControls attributes={attributes} setAttributes={setAttributes}/>
                <Style attributes={attributes} setAttributes={setAttributes}
                       uniqueId={uniqueId}
                       selector={'wpbs-current-date'}
                       deps={['wpbs-current-date']}
                />

                <div {...blockProps} >
                    {!!settings?.prefix ? <span>{settings?.prefix}</span> : null}
                    {Now}
                </div>
            </>
        )
    },
    save: (props) => null
})

