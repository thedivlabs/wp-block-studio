import {
    InspectorControls,
    useBlockProps,
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "./block.json"
import React, {useCallback, useMemo} from "react";
import {
    __experimentalNumberControl as NumberControl,
    __experimentalGrid as Grid,
    SelectControl, PanelBody, ToggleControl
} from "@wordpress/components";
import {LinkPost} from "Components/LinkPost";
import {LayoutControls} from "Components/Layout";
import {Style} from "Components/Style";
import {useUniqueId} from "Includes/helper";
import {RESOLUTION_OPTIONS} from "Includes/config";


function blockClassNames(attributes = {}) {

    return [
        'wpbs-term-content w-max inline-block',
        attributes?.uniqueId ?? '',
    ].filter(x => x).join(' ');
}

const CONTENT_OPTIONS = [
    {label: 'Select', value: ''},
    {label: 'Title', value: 'title'},
    {label: 'Description', value: 'description'},
    {label: 'Featured Image', value: 'featured-image'},
    {label: 'Poster', value: 'poster'},
    {label: 'Thumbnail', value: 'thumbnail'},
    {label: 'Content Title', value: 'content-title'},
    {label: 'Content Text', value: 'content-text'},
    {label: 'Related Title', value: 'related-title'},
    {label: 'Related Text', value: 'related-text'},

];

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes
    },
    edit: ({attributes, setAttributes, clientId}) => {

        const uniqueId = useUniqueId(attributes, setAttributes, clientId);

        const blockProps = useBlockProps({
            className: blockClassNames(attributes),
        });

        const {'wpbs-term-content': settings = {}} = attributes;

        const updateSettings = useCallback((newValue) => {
            const result = {
                ...attributes['wpbs-term-content'],
                ...newValue
            };

            setAttributes({
                'wpbs-term-content': result,
            });
        }, [setAttributes, attributes['wpbs-term-content']]);

        const label = useMemo(() => {

            const {type = ''} = settings;

            return CONTENT_OPTIONS.find(item => item.value === type)?.label ?? 'Service Content';

        }, [settings?.type]);

        const cssProps = useMemo(() => {
            return Object.fromEntries(Object.entries({
                '--line-clamp': settings?.['line-clamp'] ?? null,
            }).filter(x => x));
        }, [settings]);


        return <>
            <InspectorControls group={'styles'}>
                <Grid columns={1} columnGap={15} rowGap={20}>
                    <PanelBody initialOpen={true} title={'Settings'}>
                        <Grid columns={1} columnGap={15} rowGap={20}>
                            <SelectControl
                                __nextHasNoMarginBottom={true}
                                __next40pxDefaultSize={true}
                                label="Type"
                                value={settings?.type ?? ''}
                                options={CONTENT_OPTIONS}
                                onChange={(newValue) => updateSettings({type: newValue})}
                            />
                        </Grid>
                        <Grid columns={2} columnGap={15} rowGap={20}>

                            <NumberControl
                                __nextHasNoMarginBottom
                                __next40pxDefaultSize
                                label="Line Clamp"
                                value={settings?.['line-clamp']}
                                onChange={(newValue) => updateSettings({'line-clamp': newValue})}

                            />

                            <SelectControl
                                __nextHasNoMarginBottom={true}
                                __next40pxDefaultSize={true}
                                label="Resolution"
                                value={settings?.resolution ?? ''}
                                options={RESOLUTION_OPTIONS}
                                onChange={(newValue) => updateSettings({resolution: newValue})}
                            />
                        </Grid>

                        <Grid columns={2} columnGap={15} rowGap={20}>
                            <ToggleControl
                                __nextHasNoMarginBottom
                                label="Eager"
                                checked={!!settings?.eager}
                                onChange={(newValue) => updateSettings({eager: newValue})}
                            />
                        </Grid>
                    </PanelBody>
                </Grid>
            </InspectorControls>
            <LinkPost defaultValue={settings?.['link-post']}
                      callback={(newValue) => updateSettings({'link-post': newValue})}/>

            <LayoutControls attributes={attributes} setAttributes={setAttributes}/>
            <Style attributes={attributes} setAttributes={setAttributes} selector={'wpbs-term-content'}
                   uniqueId={uniqueId} props={cssProps} deps={['wpbs-term-content']}
            />
            <div {...blockProps}>{label}</div>
        </>

    },
    save: (props) => null
})


