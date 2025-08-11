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
    PanelBody,
    TextControl,
    __experimentalNumberControl as NumberControl,
} from "@wordpress/components";

function sectionClassNames(attributes = {}) {

    return [
        'wpbs-review-content',
        'w-fit inline-block',
        attributes?.uniqueId ?? '',
    ].filter(x => x).join(' ');
}

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

        return (
            <>


                <InspectorControls group="styles">
                    <PanelBody initialOpen={true} title={'Settings'}>
                        <Grid columns={1} columnGap={15} rowGap={20}>
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


                        </Grid>
                    </PanelBody>
                </InspectorControls>

                <LayoutControls attributes={attributes} setAttributes={setAttributes}/>
                <Style attributes={attributes} setAttributes={setAttributes} selector={'wpbs-review-content'}
                       uniqueId={uniqueId}/>

                <div {...blockProps}/>


            </>
        )
    },
    save: (props) => null
})


