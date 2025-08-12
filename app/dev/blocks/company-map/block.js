import {
    InspectorControls,
    useBlockProps,
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "./block.json"
import {LAYOUT_ATTRIBUTES, LayoutControls} from "Components/Layout"
import {Style, STYLE_ATTRIBUTES} from "Components/Style"
import React, {useCallback} from "react";
import {useUniqueId} from "Includes/helper";
import {
    __experimentalGrid as Grid,
    PanelBody, ToggleControl,
} from "@wordpress/components";
import {useSelect} from "@wordpress/data";
import {Companies} from "Components/Companies";

function sectionClassNames(attributes = {}) {

    const {'wpbs-company-map': settings = {}} = attributes;

    return [
        'wpbs-company-map flex w-full aspect-banner',
        attributes?.uniqueId ?? '',
    ].filter(x => x).join(' ');
}

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...LAYOUT_ATTRIBUTES,
        ...STYLE_ATTRIBUTES,
        'company-map': {
            type: 'object'
        }
    },
    edit: ({attributes, setAttributes, clientId}) => {

        const uniqueId = useUniqueId(attributes, setAttributes, clientId);

        const companies = useSelect((select) => {
            return select('core').getEntityRecords('postType', 'company', {per_page: -1});
        }, []);

        const {'wpbs-company-map': settings = {}} = attributes;

        const updateSettings = useCallback((newValue) => {
            const result = {
                ...attributes['wpbs-company-map'],
                ...newValue
            };

            setAttributes({
                'wpbs-company-map': result,
            });
        }, [setAttributes, attributes['wpbs-company-map']]);

        const blockProps = useBlockProps({
            className: sectionClassNames(attributes),
        });

        return (
            <>

                <InspectorControls group="styles">
                    <PanelBody initialOpen={true} title={'Settings'}>
                        <Grid columns={1} columnGap={15} rowGap={20}>

                            <Companies
                                value={settings?.['company-id'] ?? []}
                                callback={(newValue) => updateSettings({'company-id': newValue})}
                            />

                            <Grid columns={2} columnGap={15} rowGap={20}>

                                <ToggleControl
                                    __nextHasNoMarginBottom
                                    __next40pxDefaultSize
                                    label="Zoom to Fit"
                                    checked={!!settings?.['zoom-to-fit']}
                                    onChange={(newValue) => updateSettings({'zoom-to-fit': newValue})}

                                />
                                <ToggleControl
                                    __nextHasNoMarginBottom
                                    __next40pxDefaultSize
                                    label="Default Marker"
                                    checked={!!settings?.['default-marker']}
                                    onChange={(newValue) => updateSettings({'default-marker': newValue})}

                                />

                            </Grid>
                        </Grid>
                    </PanelBody>
                </InspectorControls>

                <LayoutControls attributes={attributes} setAttributes={setAttributes}/>
                <Style attributes={attributes} setAttributes={setAttributes} selector={'wpbs-company-map'}
                       uniqueId={uniqueId} props={cssProps} deps={['wpbs-company-map']}
                />

                <div {...blockProps}></div>


            </>
        )
    },
    save: (props) => null
})


