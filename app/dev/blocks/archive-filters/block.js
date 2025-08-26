import './scss/block.scss'

import {
    InspectorControls, PanelColorSettings,
    useBlockProps,
    useInnerBlocksProps,
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "./block.json"
import {Style, STYLE_ATTRIBUTES} from "Components/Style"
import React, {useCallback, useMemo} from "react";
import {
    __experimentalGrid as Grid, PanelBody, CheckboxControl,
} from "@wordpress/components";
import {useUniqueId} from "Includes/helper";

function blockClassnames(attributes = {}, editor = false) {

    const {'wpbs-archive-filters': settings = {}} = attributes;

    return [
        'wpbs-archive-filters',
        attributes?.uniqueId ?? null,
    ].filter(x => x).join(' ');
}

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...STYLE_ATTRIBUTES,
        'wpbs-archive-filters': {
            type: 'object'
        }
    },
    edit: ({attributes, setAttributes, clientId}) => {

        const uniqueId = useUniqueId(attributes, setAttributes, clientId);

        const {'wpbs-archive-filters': settings = {}} = attributes;

        const cssProps = useMemo(() => {
            return Object.fromEntries(
                Object.entries({
                    '--overlay-color': settings?.['overlay-color'],
                }).filter(([key, value]) => value != null) // keep only entries with a value
            );
        }, [settings?.['overlay-color']]);


        const blockProps = useBlockProps({className: blockClassnames(attributes, true)});

        const updateSettings = useCallback((newValue) => {

            const result = {
                ...settings,
                ...newValue
            }

            setAttributes({'wpbs-archive-filters': result});

        }, [setAttributes, settings])

        const options = [
            {label: 'Order', value: 'order'},
            {label: 'Orderby', value: 'orderby'},
        ];


        return (
            <>

                <InspectorControls group="styles">

                    <PanelBody initialOpen={true}>

                        <Grid columnGap={20} columns={1} rowGap={20}>

                            {options.map((opt) => (
                                <CheckboxControl
                                    key={opt.value}
                                    label={opt.label}
                                    checked={(settings?.['filters'] || []).includes(opt.value)}
                                    onChange={(isChecked) => {
                                        let newFilters;
                                        if (isChecked) {
                                            newFilters = [...(settings?.filters || []), opt.value];
                                        } else {
                                            newFilters = (settings?.filters || []).filter((v) => v !== opt.value);
                                        }
                                        // call your callback
                                        updateSettings({filters: newFilters});
                                    }}
                                />
                            ))}


                            <PanelColorSettings
                                enableAlpha
                                className={'!p-0 !border-0 [&_.components-tools-panel-item]:!m-0'}
                                colorSettings={[
                                    {
                                        slug: 'overlay',
                                        label: 'Overlay',
                                        value: settings?.['overlay-color'],
                                        onChange: (newValue) => updateSettings({'overlay-color': newValue}),
                                        isShownByDefault: true
                                    }
                                ]}
                            />
                        </Grid>

                    </PanelBody>

                </InspectorControls>

                <Style attributes={attributes} setAttributes={setAttributes} uniqueId={uniqueId}
                       deps={['wpbs-archive-filters']} selector={'wpbs-archive-filters'}
                       props={cssProps}
                />


                <nav {...blockProps}>FILTERS</nav>

            </>
        )
    },
    save: (props) => {

        const blockProps = useBlockProps.save({
            className: blockClassnames(props.attributes),
            'data-wp-interactive': 'wpbs/archive-filters',
            'aria-label': 'Archive Filters',
            ...(props.attributes?.['wpbs-props'] ?? {})
        });

        return <nav {...blockProps}>FILTERS</nav>;
    }
})


