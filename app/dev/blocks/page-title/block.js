import {ElementTag, ELEMENT_TAG_ATTRIBUTES, ElementTagSettings} from 'Components/ElementTag'

import {
    InspectorControls,
    useBlockProps,
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "./block.json"
import {Style, STYLE_ATTRIBUTES} from "Components/Style"
import React, {useCallback, useEffect, useMemo} from "react";
import {
    __experimentalGrid as Grid, __experimentalNumberControl as NumberControl,
    PanelBody,
    SelectControl, TextControl,
    ToggleControl,
} from "@wordpress/components";
import {useUniqueId} from "Includes/helper";
import {

    ELEMENT_TAG_TEXT_OPTIONS,
} from "Includes/config";

function blockClassnames(attributes = {}, editor = false) {

    const {'wpbs-page-title': settings = {}} = attributes;

    const result = [
        'wpbs-page-title',
        settings?.['line-clamp'] ? '--line-clamp' : null,
        attributes?.uniqueId ?? null,
    ];

    return result.filter(x => x).join(' ');
}

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...STYLE_ATTRIBUTES,
        ...ELEMENT_TAG_ATTRIBUTES,
        'wpbs-page-title': {
            type: 'object'
        }
    },
    edit: ({attributes, setAttributes, clientId}) => {

        const uniqueId = useUniqueId(attributes, setAttributes, clientId);

        const {'wpbs-page-title': settings = {}} = attributes;

        const blockProps = useBlockProps({className: blockClassnames(attributes, true)});

        const cssProps = useMemo(() => {
            return Object.fromEntries(Object.entries({
                '--line-clamp': settings?.['line-clamp'] ?? null,
            }).filter(x => x));
        }, [settings]);

        const updateSettings = useCallback((newValue) => {

            const result = {
                ...settings,
                ...newValue
            }

            setAttributes({'wpbs-page-title': result});

        }, [setAttributes, settings]);

        const ElementTagName = ElementTag(attributes);

        return (
            <>

                <InspectorControls group="styles">

                    <PanelBody initialOpen={true}>
                        <Grid columnGap={15} columns={1} rowGap={20}>

                            <SelectControl
                                __next40pxDefaultSize
                                label="Type"
                                value={settings?.type}
                                options={[
                                    {label: 'Select', value: ''},
                                    {label: 'Single', value: 'single'},
                                    {label: 'Term', value: 'term'},
                                    {label: 'Taxonomy', value: 'taxonomy'},
                                    {label: 'Archive', value: 'archive'},
                                ]}
                                onChange={(newValue) => updateSettings({'type': newValue})}
                                __nextHasNoMarginBottom
                            />

                            <Grid columns={2} columnGap={15} rowGap={20}>

                                <NumberControl
                                    __nextHasNoMarginBottom
                                    __next40pxDefaultSize
                                    label="Line Clamp"
                                    value={settings?.['line-clamp']}
                                    onChange={(newValue) => updateSettings({'line-clamp': newValue})}

                                />

                            </Grid>

                            <TextControl
                                __nextHasNoMarginBottom
                                __next40pxDefaultSize
                                label="Default"
                                value={settings?.['default']}
                                onChange={(newValue) => updateSettings({'default': newValue})}
                            />

                            <Grid columnGap={15} columns={2} rowGap={20} style={{marginTop: '20px'}}>
                                <ToggleControl
                                    __nextHasNoMarginBottom
                                    __next40pxDefaultSize
                                    label="Link"
                                    checked={!!settings?.link}
                                    onChange={(newValue) => updateSettings({link: newValue})}
                                />
                            </Grid>

                        </Grid>
                    </PanelBody>

                </InspectorControls>
                <ElementTagSettings attributes={attributes} setAttributes={setAttributes}
                                    options={ELEMENT_TAG_TEXT_OPTIONS}/>
                <Style attributes={attributes} setAttributes={setAttributes} uniqueId={uniqueId}
                       deps={['wpbs-page-title']} selector={'wpbs-page-title'}
                       props={cssProps}
                />

                <ElementTagName {...blockProps}>{settings?.default ?? 'Page Title'}</ElementTagName>

            </>
        )
    },
    save: (props) => null
})


