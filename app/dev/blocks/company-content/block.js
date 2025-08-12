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
import {
    __experimentalGrid as Grid,
    PanelBody,
    TextControl,
    __experimentalNumberControl as NumberControl, SelectControl, BaseControl,
} from "@wordpress/components";
import {useSelect} from "@wordpress/data";
import {sliderProps} from "Components/Slider";

function sectionClassNames(attributes = {}) {

    const {'wpbs-company-content': settings = {}} = attributes;

    return [
        'wpbs-company-content',
        'w-fit inline-block',
        settings?.icon ? '--icon' : null,
        attributes?.uniqueId ?? '',
    ].filter(x => x).join(' ');
}

const CONTENT_OPTIONS = [
    {label: 'Select', value: ''},
    {label: 'Title', value: 'title'},
    {label: 'Phone', value: 'phone'},
    {label: 'Phone Additional', value: 'phone-additional'},
    {label: 'Email', value: 'email'},
    {label: 'Email Additional', value: 'email-additional'},
    {label: 'Address', value: 'address'},
    {label: 'Social', value: 'social'},
    {label: 'Description', value: 'description'},
    {label: 'Map Link', value: 'map-link'},
    {label: 'Reviews Link', value: 'reviews-link'},
    {label: 'New Review Link', value: 'new-review-link'},
];

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...LAYOUT_ATTRIBUTES,
        ...STYLE_ATTRIBUTES
    },
    edit: ({attributes, setAttributes, clientId}) => {

        const uniqueId = useUniqueId(attributes, setAttributes, clientId);

        const companies = useSelect((select) => {
            return select('core').getEntityRecords('postType', 'company', {per_page: -1});
        }, []);

        const {'wpbs-company-content': settings = {}} = attributes;

        const fields = useSelect((select) => {

            if (!settings?.['company-id']) {
                return {};
            }

            const post = select('core').getEntityRecord('postType', 'company', settings?.['company-id']);

            return post?.acf?.wpbs || null;

        }, [settings?.['company-id']]);

        console.log(fields);

        const cssProps = useMemo(() => {
            return Object.fromEntries(Object.entries({
                '--icon': !!settings?.icon ? '"\\' + settings?.icon + '"' : null,
                '--icon-color': settings?.['icon-color'] ?? null
            }).filter(x => x));
        }, [settings]);

        const updateSettings = useCallback((newValue) => {
            const result = {
                ...attributes['wpbs-company-content'],
                ...newValue
            };

            setAttributes({
                'wpbs-company-content': result,
            });
        }, [setAttributes, attributes['wpbs-company-content']]);

        const blockProps = useBlockProps({
            className: sectionClassNames(attributes),
        });

        const label = useMemo(() => {

            const {type = ''} = settings;

            const label = CONTENT_OPTIONS.find(item => item.value === type)?.label ?? 'Company Content';

            switch (type) {
                case 'featured-image':
                    return <i
                        className="fa-solid fa-user-tie !flex w-full h-full text-center items-center justify-center text-[24px] leading-tight"/>;
                default:
                    return label;
            }

        }, [settings?.type]);

        return (
            <>

                <InspectorControls group="styles">
                    <PanelBody initialOpen={true} title={'Settings'}>
                        <Grid columns={1} columnGap={15} rowGap={20}>

                            <SelectControl
                                label="Select Company"
                                value={settings?.['company-id'] ?? ''}
                                options={[
                                    {label: 'Select a company', value: ''},
                                    ...(companies || []).map(post => ({
                                        label: post.title.rendered,
                                        value: String(post.id)
                                    }))
                                ]}
                                onChange={(newValue) => updateSettings({'company-id': newValue})}
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
                                <TextControl
                                    __nextHasNoMarginBottom
                                    __next40pxDefaultSize
                                    label="Icon"
                                    value={settings?.icon}
                                    onChange={(newValue) => updateSettings({icon: newValue})}
                                />
                                <TextControl
                                    __nextHasNoMarginBottom
                                    __next40pxDefaultSize
                                    label="Label"
                                    value={settings?.label}
                                    onChange={(newValue) => updateSettings({label: newValue})}
                                />

                                <SelectControl
                                    label="Label Position"
                                    value={settings?.['label-position'] ?? ''}
                                    options={[
                                        {label: 'Select', value: ''},
                                        {label: 'Top', value: 'top'},
                                        {label: 'Left', value: 'left'},
                                        {label: 'Bottom', value: 'bottom'},
                                    ]}
                                    onChange={(newValue) => updateSettings({'label-position': newValue})}
                                    __nextHasNoMarginBottom={true}
                                    __next40pxDefaultSize={true}
                                />

                            </Grid>

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
                        </Grid>
                    </PanelBody>
                </InspectorControls>

                <LayoutControls attributes={attributes} setAttributes={setAttributes}/>
                <Style attributes={attributes} setAttributes={setAttributes} selector={'wpbs-company-content'}
                       uniqueId={uniqueId} props={cssProps}
                />

                <div {...blockProps}>
                    {label}
                </div>


            </>
        )
    },
    save: (props) => null
})


