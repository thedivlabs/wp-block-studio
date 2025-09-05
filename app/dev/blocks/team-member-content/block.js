import './scss/block.scss';

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
import {DIMENSION_UNITS_TEXT, ELEMENT_TAG_TEXT_OPTIONS, RESOLUTION_OPTIONS} from "Includes/config";
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
import {ELEMENT_TAG_ATTRIBUTES, ElementTagSettings, ElementTag} from "Components/ElementTag";
import {IconControl, iconProps} from "Components/IconControl";

function sectionClassNames(attributes = {}) {

    const {'wpbs-team-member-content': settings = {}} = attributes;

    return [
        'wpbs-team-member-content',
        settings?.icon ? 'inline-flex --icon' : 'inline-block',
        'w-fit',
        attributes?.uniqueId ?? '',
    ].filter(x => x).join(' ');
}

const CONTENT_OPTIONS = [
    {label: 'Select', value: ''},
    {label: 'First Name', value: 'first-name'},
    {label: 'Last Name', value: 'last-name'},
    {label: 'Full Name', value: 'full-name'},
    {label: 'Job Title', value: 'job-title'},
    {label: 'Location', value: 'location'},
    {label: 'Profile', value: 'profile'},
    {label: 'Summary', value: 'summary'},
    {label: 'Email Address', value: 'email'},
    {label: 'Phone Number', value: 'phone'},
    {label: 'Extension', value: 'extension'},
    {label: 'Headshot', value: 'headshot'},
    {label: 'Featured Image', value: 'featured-image'},
    {label: 'Signature', value: 'signature'},
    {label: 'CV', value: 'cv'},
];

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...ELEMENT_TAG_ATTRIBUTES,
        ...LAYOUT_ATTRIBUTES,
        ...STYLE_ATTRIBUTES
    },
    edit: ({attributes, setAttributes, clientId}) => {

        const uniqueId = useUniqueId(attributes, setAttributes, clientId);

        const {'wpbs-team-member-content': settings = {}} = attributes;

        const cssProps = useMemo(() => {
            return Object.fromEntries(Object.entries({
                ...iconProps(settings?.icon),
                '--icon-color': settings?.['icon-color'] ?? null,
                '--line-clamp': settings?.['line-clamp'] ?? null,
            }).filter(x => x));
        }, [settings]);

        const updateSettings = useCallback((newValue) => {
            const result = {
                ...attributes['wpbs-team-member-content'],
                ...newValue
            };

            setAttributes({
                'wpbs-team-member-content': result,
            });
        }, [setAttributes, attributes['wpbs-team-member-content']]);

        const blockProps = useBlockProps({
            className: sectionClassNames(attributes),
        });

        const label = useMemo(() => {

            const {type = ''} = settings;

            return CONTENT_OPTIONS.find(item => item.value === type)?.label ?? 'Team Content';

        }, [settings?.type]);

        const ElementTagName = ElementTag(attributes);

        return (
            <>

                <InspectorControls group="styles">
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

                            <TextControl
                                __nextHasNoMarginBottom
                                __next40pxDefaultSize
                                label="Label"
                                value={settings?.label}
                                onChange={(newValue) => updateSettings({label: newValue})}
                            />

                            <IconControl label={'Icon'} value={settings?.icon}
                                         onChange={(newValue) => updateSettings({'icon': newValue})}/>

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
                                <ToggleControl
                                    __nextHasNoMarginBottom
                                    label="Toggle Profile"
                                    checked={!!settings?.toggle}
                                    onChange={(newValue) => updateSettings({toggle: newValue})}
                                />
                            </Grid>
                        </Grid>
                    </PanelBody>
                </InspectorControls>

                <LinkPost defaultValue={settings?.['link-post']}
                          callback={(newValue) => updateSettings({'link-post': newValue})}/>

                <LayoutControls attributes={attributes} setAttributes={setAttributes}/>
                <Style attributes={attributes} setAttributes={setAttributes} selector={'wpbs-team-member-content'}
                       uniqueId={uniqueId} deps={['wpbs-team-member-content']} props={cssProps}
                />
                <ElementTagSettings attributes={attributes} setAttributes={setAttributes}
                                    options={ELEMENT_TAG_TEXT_OPTIONS}/>

                <ElementTagName {...blockProps}>
                    <span>{label}</span>
                </ElementTagName>


            </>
        )
    },
    save: (props) => null
})


