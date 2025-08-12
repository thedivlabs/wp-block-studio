import {
    InspectorControls,
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
    __experimentalNumberControl as NumberControl, SelectControl,
} from "@wordpress/components";
import {useSelect} from "@wordpress/data";
import {Companies} from 'Components/Companies';

function sectionClassNames(attributes = {}) {

    return [
        'wpbs-company-content',
        'w-fit inline-block',
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

        const {'wpbs-company-content': settings = {}} = attributes;

        const fields = useSelect((select) => {

            if (!settings?.['company-id']) {
                return {};
            }

            const post = select('core').getEntityRecord('postType', 'company', settings?.['company-id']);

            return post?.acf?.wpbs || null;

        }, [settings?.['company-id']]);

        console.log(fields);

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

                            <Companies value={settings?.['company-id']}
                                       callback={(newValue) => updateSettings({'company-id': newValue})}/>

                            <Grid columns={2} columnGap={15} rowGap={20}>
                                <SelectControl
                                    __nextHasNoMarginBottom
                                    label="Type"
                                    value={settings?.type ?? ''}
                                    options={CONTENT_OPTIONS}
                                    onChange={(newValue) => updateSettings({type: newValue})}
                                />
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

                            </Grid>
                        </Grid>
                    </PanelBody>
                </InspectorControls>

                <LayoutControls attributes={attributes} setAttributes={setAttributes}/>
                <Style attributes={attributes} setAttributes={setAttributes} selector={'wpbs-company-content'}
                       uniqueId={uniqueId}/>

                <div {...blockProps}>
                    {label}
                </div>


            </>
        )
    },
    save: (props) => null
})


