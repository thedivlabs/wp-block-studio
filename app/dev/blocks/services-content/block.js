import './scss/block.scss';

import {ElementTag, ELEMENT_TAG_ATTRIBUTES, ElementTagSettings} from 'Components/ElementTag'

import {
    InspectorControls, PanelColorSettings,
    useBlockProps,
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "./block.json"
import {LAYOUT_ATTRIBUTES, LayoutControls} from "Components/Layout"
import {Style, STYLE_ATTRIBUTES} from "Components/Style"
import React, {useCallback, useMemo} from "react";
import {useUniqueId} from "Includes/helper";
import {DIMENSION_UNITS_TEXT, RESOLUTION_OPTIONS, ELEMENT_TAG_TEXT_OPTIONS} from "Includes/config";
import {
    __experimentalGrid as Grid,
    PanelBody,
    TextControl,
    __experimentalUnitControl as UnitControl,
    __experimentalNumberControl as NumberControl,
    SelectControl, BaseControl, ToggleControl,
} from "@wordpress/components";
import {useSelect} from "@wordpress/data";
import {LinkPost} from "Components/LinkPost";

function sectionClassNames(attributes = {}) {

    const {'wpbs-services-content': settings = {}} = attributes;

    return [
        'wpbs-services-content',
        'w-fit inline-block',
        !!settings?.['line-clamp'] ? '--line-clamp' : null,
        settings?.icon ? '--icon' : null,
        attributes?.uniqueId ?? '',
    ].filter(x => x).join(' ');
}

const CONTENT_OPTIONS = [
    {label: 'Select', value: ''},
    {label: 'Overview Title', value: 'overview-title'},
    {label: 'Overview Text', value: 'overview-text'},
    {label: 'Description Title', value: 'description-title'},
    {label: 'Description Text', value: 'description-text'},
    {label: 'General Title', value: 'general-title'},
    {label: 'General Text', value: 'general-text'},
    {label: 'Poster', value: 'poster'},
    {label: 'Thumbnail', value: 'thumbnail'},
    {label: 'Icon', value: 'icon'},
    {label: 'Related Title', value: 'related-title'},
    {label: 'Related Text', value: 'related-text'},
    {label: 'CTA Title', value: 'cta-title'},
    {label: 'CTA Text', value: 'cta-text'},
    {label: 'CTA Image', value: 'cta-image'},
    {label: 'FAQ Title', value: 'faq-title'},
    {label: 'FAQ Text', value: 'faq-text'},

];

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...ELEMENT_TAG_ATTRIBUTES,
        ...metadata.attributes,
        ...LAYOUT_ATTRIBUTES,
        ...STYLE_ATTRIBUTES
    },
    edit: ({attributes, setAttributes, clientId}) => {

        const uniqueId = useUniqueId(attributes, setAttributes, clientId);

        const services = useSelect((select) => {
            return select('core').getEntityRecords('postType', 'service', {per_page: -1});
        }, []);

        const {'wpbs-services-content': settings = {}} = attributes;

        const fields = useSelect((select) => {

            if (!settings?.['service-id']) {
                return {};
            }

            const post = select('core').getEntityRecord('postType', 'service', settings?.['service-id']);

            return post?.acf?.wpbs || null;

        }, [settings?.['service-id']]);

        const cssProps = useMemo(() => {
            return Object.fromEntries(Object.entries({
                '--icon': !!settings?.icon ? '"\\' + settings?.icon + '"' : null,
                '--icon-color': settings?.['icon-color'] ?? null,
                '--icon-size': settings?.['icon-size'] ?? null,
                '--line-clamp': settings?.['line-clamp'] ?? null,
            }).filter(x => x));
        }, [settings]);

        const updateSettings = useCallback((newValue) => {
            const result = {
                ...attributes['wpbs-services-content'],
                ...newValue
            };

            setAttributes({
                'wpbs-services-content': result,
            });
        }, [setAttributes, attributes['wpbs-services-content']]);

        const blockProps = useBlockProps({
            className: sectionClassNames(attributes),
        });

        const label = useMemo(() => {

            const {type = ''} = settings;

            return CONTENT_OPTIONS.find(item => item.value === type)?.label ?? 'Service Content';

        }, [settings?.type]);

        const ElementTagName = ElementTag(attributes);

        return (
            <>

                <InspectorControls group="styles">
                    <PanelBody initialOpen={true} title={'Settings'}>
                        <Grid columns={1} columnGap={15} rowGap={20}>

                            <SelectControl
                                label="Select Service"
                                value={settings?.['service-id'] ?? ''}
                                options={[
                                    {label: 'Select a service', value: ''},
                                    {label: 'Current', value: 'current'},
                                    ...(services || []).map(post => ({
                                        label: post.title.rendered,
                                        value: String(post.id)
                                    }))
                                ]}
                                onChange={(newValue) => updateSettings({'service-id': newValue})}
                                __nextHasNoMarginBottom={true}
                                __next40pxDefaultSize={true}
                            />

                            <SelectControl
                                __nextHasNoMarginBottom={true}
                                __next40pxDefaultSize={true}
                                label="Type"
                                value={settings?.type ?? ''}
                                options={CONTENT_OPTIONS}
                                onChange={(newValue) => updateSettings({type: newValue})}
                            />

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

                                <TextControl
                                    __nextHasNoMarginBottom
                                    __next40pxDefaultSize
                                    label="Icon"
                                    value={settings?.icon}
                                    onChange={(newValue) => updateSettings({icon: newValue})}
                                />

                                <UnitControl
                                    __nextHasNoMarginBottom
                                    __next40pxDefaultSize
                                    units={DIMENSION_UNITS_TEXT}
                                    label="Icon Size"
                                    value={settings?.['icon-size']}
                                    onChange={(newValue) => updateSettings({'icon-size': newValue})}
                                />

                            </Grid>

                            <TextControl
                                __nextHasNoMarginBottom
                                __next40pxDefaultSize
                                label="Label"
                                value={settings?.label}
                                onChange={(newValue) => updateSettings({label: newValue})}
                            />

                            <BaseControl label={'Colors'}>
                                <PanelColorSettings
                                    enableAlpha
                                    className={'!p-0 !border-0 [&_.components-tools-panel-item]:!m-0'}
                                    colorSettings={[
                                        {
                                            slug: 'icon-color',
                                            label: 'Icon Color',
                                            value: settings?.['icon-color'],
                                            onChange: (newValue) => updateSettings({'icon-color': newValue}),
                                            isShownByDefault: true
                                        }
                                    ]}
                                />
                            </BaseControl>

                            <Grid columns={2} columnGap={15} rowGap={20}>
                                <ToggleControl
                                    __nextHasNoMarginBottom
                                    label="Eager"
                                    checked={!!settings?.eager}
                                    onChange={(newValue) => updateSettings({eager: newValue})}
                                />
                            </Grid>
                        </Grid>
                    </PanelBody>
                </InspectorControls>

                <LinkPost defaultValue={settings?.['link-post']}
                          callback={(newValue) => updateSettings({'link-post': newValue})}/>

                <LayoutControls attributes={attributes} setAttributes={setAttributes}/>
                <Style attributes={attributes} setAttributes={setAttributes} selector={'wpbs-services-content'}
                       uniqueId={uniqueId} props={cssProps} deps={['wpbs-services-content']}
                />
                <ElementTagSettings attributes={attributes} setAttributes={setAttributes}
                                    options={ELEMENT_TAG_TEXT_OPTIONS}/>

                <ElementTagName {...blockProps}>
                    {label}
                </ElementTagName>


            </>
        )
    },
    save: (props) => null
})


