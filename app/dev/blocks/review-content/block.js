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
    __experimentalNumberControl as NumberControl, ToggleControl, SelectControl,
} from "@wordpress/components";

function sectionClassNames(attributes = {}) {

    return [
        'wpbs-review-content',
        'w-fit inline-block',
        attributes?.uniqueId ?? '',
    ].filter(x => x).join(' ');
}

const CONTENT_OPTIONS = [
    {label: 'Select', value: ''},
    {label: 'Name', value: 'name'},
    {label: 'Job Title', value: 'job-title'},
    {label: 'Rating', value: 'rating'},
    {label: 'Date', value: 'date'},
    {label: 'Content', value: 'content'},
    {label: 'Avatar', value: 'avatar'},
];

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...LAYOUT_ATTRIBUTES,
        ...STYLE_ATTRIBUTES
    },
    edit: ({attributes, setAttributes, context, clientId}) => {

        const uniqueId = useUniqueId(attributes, setAttributes, clientId);

        const {'wpbs-review-content': settings} = attributes;

        const updateSettings = useCallback((newValue) => {
            const result = {
                ...attributes['wpbs-review-content'],
                ...newValue
            };

            setAttributes({
                'wpbs-review-content': result,
            });
        }, [setAttributes, attributes['wpbs-review-content']]);

        const blockProps = useBlockProps({
            className: sectionClassNames(attributes),
        });

        const label = useMemo(() => {

            const result = CONTENT_OPTIONS.find(item => item.value === settings?.type)?.label ?? 'Review Content';

            return settings?.type === 'avatar' ?
                <i className="fa-solid fa-user-tie !flex w-full h-full text-center items-center justify-center text-[24px] leading-tight"/> : result;
        }, [settings?.type]);

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

                                <TextControl
                                    __nextHasNoMarginBottom
                                    __next40pxDefaultSize
                                    label="Icon"
                                    value={settings?.icon}
                                    onChange={(newValue) => updateSettings({icon: newValue})}
                                />


                            </Grid>

                            <Grid columns={2} columnGap={15} rowGap={20}>
                                <ToggleControl
                                    __nextHasNoMarginBottom
                                    label="Popup"
                                    checked={!!settings?.toggle}
                                    onChange={(newValue) => updateSettings({toggle: newValue})}
                                />
                            </Grid>


                        </Grid>
                    </PanelBody>
                </InspectorControls>

                <LayoutControls attributes={attributes} setAttributes={setAttributes}/>
                <Style attributes={attributes} setAttributes={setAttributes} selector={'wpbs-review-content'}
                       uniqueId={uniqueId}/>

                <div {...blockProps}>
                    {label}
                </div>


            </>
        )
    },
    save: (props) => null
})


