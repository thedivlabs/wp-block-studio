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
    __experimentalGrid as Grid, PanelBody, CheckboxControl, SelectControl, TextControl, ToggleControl,
} from "@wordpress/components";
import {useUniqueId} from "Includes/helper";

function blockClassnames(attributes = {}, editor = false) {

    const {'wpbs-archive-filters': settings = {}} = attributes;

    return [
        'wpbs-archive-filters',
        attributes?.uniqueId ?? null,
    ].filter(x => x).join(' ');
}

const FilterFields = ({settings}) => {

    if (!settings?.type) return null;

    // Sort options mapping to both order & orderby
    const sortOptions = [
        {label: 'Latest', value: 'latest'},       // maps to order=date&orderby=desc
        {label: 'Oldest', value: 'oldest'},       // maps to order=date&orderby=asc
        {label: 'Title A → Z', value: 'title-asc'}, // order=asc&orderby=title
        {label: 'Title Z → A', value: 'title-desc'}, // order=desc&orderby=title
    ];

    const showLabel = settings?.['label-position'] !== 'hidden';
    const labelClass = showLabel ? 'wpbs-archive-filters__label' : 'screen-reader-text';
    const defaultValue = '#--' + settings.type.toUpperCase() + '--#';

    switch (settings.type) {
        case 'sort':
            return (
                <>
                    <label htmlFor="wpbs-archive-filters-sort" className={labelClass}>
                        {settings?.label ?? 'Sort By'}
                    </label>
                    <select id="wpbs-archive-filters-sort" defaultValue={defaultValue}>
                        <option value="">{settings?.placeholder ?? 'Select'}</option>
                        {sortOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </>
            );

        case 'search':
            return (
                <>
                    <label htmlFor="wpbs-archive-filters-search" className={labelClass}>
                        {settings?.label ?? 'Search'}
                    </label>
                    <input
                        type="text"
                        id="wpbs-archive-filters-search"
                        defaultValue={defaultValue}
                        placeholder={settings?.placeholder ?? 'Search...'}
                    />
                    <button
                        type="button"
                        className="wpbs-search-submit"
                        dangerouslySetInnerHTML={{__html: settings?.button ?? 'Search'}}
                    />
                </>
            );

        default:
            return null;
    }

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
                                    {label: 'Sort', value: 'sort'},
                                    {label: 'Search', value: 'search'}
                                ]}
                                onChange={(newValue) => updateSettings({'type': newValue})}
                                __nextHasNoMarginBottom
                            />

                            <TextControl
                                __nextHasNoMarginBottom
                                __next40pxDefaultSize
                                label="Label"
                                value={settings?.label}
                                onChange={(newValue) => updateSettings({'label': newValue})}
                            />
                            <TextControl
                                __nextHasNoMarginBottom
                                __next40pxDefaultSize
                                label="Placeholder"
                                value={settings?.placeholder}
                                onChange={(newValue) => updateSettings({'placeholder': newValue})}
                            />

                            {settings?.type === 'search' ? <TextControl
                                __nextHasNoMarginBottom
                                __next40pxDefaultSize
                                label="Button"
                                value={settings?.button}
                                onChange={(newValue) => updateSettings({'button': newValue})}
                            /> : null}


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

                            <Grid columnGap={15} columns={2} rowGap={20}>
                                <SelectControl
                                    __next40pxDefaultSize
                                    label="Label Position"
                                    value={settings?.['label-position']}
                                    options={[
                                        {label: 'Select', value: ''},
                                        {label: 'Top', value: 'top'},
                                        {label: 'Bottom', value: 'bottom'},
                                        {label: 'Hidden', value: 'hidden'},
                                    ]}
                                    onChange={(newValue) => updateSettings({'label-position': newValue})}
                                    __nextHasNoMarginBottom
                                />
                            </Grid>


                        </Grid>

                    </PanelBody>

                </InspectorControls>

                <Style attributes={attributes} setAttributes={setAttributes} uniqueId={uniqueId}
                       deps={['wpbs-archive-filters']} selector={'wpbs-archive-filters'}
                       props={cssProps}
                />


                <nav {...blockProps}>
                    <FilterFields settings={settings}/>
                </nav>

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

        return <nav {...blockProps}>
            <FilterFields settings={props.attributes?.['wpbs-archive-filters']}/>
        </nav>;
    }
})


