import './scss/block.scss'

import {
    InspectorControls, PanelColorSettings,
    useBlockProps,
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "./block.json"
import {Style, STYLE_ATTRIBUTES} from "Components/Style"
import React, {useCallback, useMemo} from "react";
import {
    __experimentalGrid as Grid,
    __experimentalUnitControl as UnitControl, BorderBoxControl,
    PanelBody,
    SelectControl, TabPanel,
    TextControl,
    ToggleControl,
} from "@wordpress/components";
import {useUniqueId} from "Includes/helper";
import {BORDER_UNITS} from "Includes/config";

function blockClassnames(attributes = {}, editor = false) {

    const {'wpbs-archive-filters': settings = {}} = attributes;

    const result = [
        'wpbs-archive-filters',
        !!settings?.grow ? 'grow' : null,
        !!settings?.prefix ? '--prefix' : null,
        attributes?.uniqueId ?? null,
    ];

    if (!!settings?.['label-position'] && settings?.['label-position'] !== 'hidden') {
        result.push('--label-' + settings['label-position']);
    }

    return result.filter(x => x).join(' ');
}

const FilterFields = ({settings, uniqueId, is_editor = false}) => {

    if (!settings?.type) return null;

    // Sort options mapping to both order & orderby
    const sortOptions = [
        {label: 'Latest', value: 'latest'},       // maps to order=date&orderby=desc
        {label: 'Oldest', value: 'oldest'},       // maps to order=date&orderby=asc
        {label: 'Title A → Z', value: 'title-asc'}, // order=asc&orderby=title
        {label: 'Title Z → A', value: 'title-desc'}, // order=desc&orderby=title
    ];

    const showLabel = settings?.['label-position'] !== 'hidden' && !!settings?.label;
    const labelClass = showLabel ? 'wpbs-archive-filters__label' : 'screen-reader-text';
    const defaultValue = is_editor ? '' : '#--' + settings.type.toUpperCase() + '--#';
    const fieldId = [uniqueId, settings.type].filter(x => x).join('-');

    switch (settings.type) {
        case 'sort':
            return <>

                <span className={labelClass} dangerouslySetInnerHTML={{__html: settings?.label ?? 'Sort By'}}/>
                <div className={'wpbs-archive-filters__input --select'}>
                    <select
                        id={fieldId}
                        defaultValue={defaultValue}>
                        <option value="">{settings?.placeholder ?? 'Select'}</option>
                        {sortOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    <button
                        type="button"
                        className="wpbs-archive-filters__button"
                    >
                        <span> {settings?.button}</span>
                    </button>
                </div>

            </>;

        case 'search':
            return <>

                <span className={labelClass} dangerouslySetInnerHTML={{__html: settings?.label ?? 'Search'}}/>
                <div className={'wpbs-archive-filters__input --search'}>
                    <input
                        id={fieldId}
                        type="text"
                        defaultValue={defaultValue}
                        placeholder={settings?.placeholder ?? 'Search...'}
                    />
                    <button
                        type="button"
                        className="wpbs-archive-filters__submit"
                    >
                        <span> {settings?.button ?? 'Search'}</span>
                    </button>
                </div>
            </>;

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
                    '--color-background': settings?.['color-background'] ?? null,
                    '--color-text': settings?.['color-text'] ?? null,
                    '--color-label': settings?.['color-label'] ?? null,
                    '--color-button': settings?.['color-button'] ?? null,
                    '--color-button-text': settings?.['color-button-text'] ?? null,
                    '--prefix-icon': !!settings?.['prefix'] ? '\"\\' + settings?.['prefix'] + '\"' : null,
                    '--button-icon': !!settings?.['button-icon'] ? '\"\\' + settings?.['button-icon'] + '\"' : null,
                    '--radius': settings?.['radius'] ?? null,
                    '--active-color-label': settings?.['active-color-label'] ?? null,
                    '--active-color-text': settings?.['active-color-text'] ?? null,
                    '--active-color-background': settings?.['active-color-background'] ?? null,
                    '--active-color-border': settings?.['active-color-border'] ?? null,
                    '--active-color-button': settings?.['active-color-button'] ?? null,
                    '--active-color-button-text': settings?.['active-color-button-text'] ?? null,
                    '--hover-color-border': settings?.['hover-color-border'] ?? null,
                    '--hover-color-button': settings?.['hover-color-button'] ?? null,
                    '--hover-color-button-text': settings?.['hover-color-button-text'] ?? null,
                    '--hover-color-background': settings?.['hover-color-background'] ?? null,
                    '--hover-color-text': settings?.['hover-color-text'] ?? null,
                    '--hover-color-label': settings?.['hover-color-label'] ?? null,
                    '--border-width': settings?.['border']?.width ?? null,
                    '--border-color': settings?.['border']?.color ?? null,
                    '--border-style': settings?.['border']?.style ?? null,
                }).filter(([key, value]) => value != null) // keep only entries with a value
            );
        }, [settings]);

        const blockProps = useBlockProps({className: blockClassnames(attributes, true)});

        const updateSettings = useCallback((newValue) => {

            const result = {
                ...settings,
                ...newValue
            }

            setAttributes({'wpbs-archive-filters': result});

        }, [setAttributes, settings]);

        const editorColors = useMemo(() => {
            return wp.data.select('core/editor').getEditorSettings().colors || [];
        }, []);

        const tabOptions = <Grid columnGap={15} columns={1} rowGap={20}>

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

            <TextControl
                __nextHasNoMarginBottom
                __next40pxDefaultSize
                label="Button"
                value={settings?.button}
                onChange={(newValue) => updateSettings({'button': newValue})}
            />


            <PanelColorSettings
                enableAlpha
                className={'!p-0 !border-0 [&_.components-tools-panel-item]:!m-0'}
                colorSettings={[
                    {
                        slug: 'color-background',
                        label: 'Background',
                        value: settings?.['color-background'],
                        onChange: (newValue) => updateSettings({'color-background': newValue}),
                        isShownByDefault: true
                    },
                    {
                        slug: 'color-text',
                        label: 'Text',
                        value: settings?.['color-text'],
                        onChange: (newValue) => updateSettings({'color-text': newValue}),
                        isShownByDefault: true
                    },
                    {
                        slug: 'color-label',
                        label: 'Label',
                        value: settings?.['color-label'],
                        onChange: (newValue) => updateSettings({'color-label': newValue}),
                        isShownByDefault: true
                    },
                    {
                        slug: 'color-button',
                        label: 'Button',
                        value: settings?.['color-button'],
                        onChange: (newValue) => updateSettings({'color-button': newValue}),
                        isShownByDefault: true
                    },
                    {
                        slug: 'color-button-text',
                        label: 'Button Text',
                        value: settings?.['color-button-text'],
                        onChange: (newValue) => updateSettings({'color-button-text': newValue}),
                        isShownByDefault: true
                    },
                ]}
            />

            <BorderBoxControl
                label={'Border'}
                value={settings?.['border']}
                enableAlpha={true}
                enableStyle={true}
                disableCustomColors={false}
                colors={editorColors}
                withSlider={true}
                isStyleSettable={true}
                onChange={(newValue) => updateSettings({'border': newValue})}
                __experimentalIsRenderedInSidebar={true}
                __next40pxDefaultSize
                //sides={['top', 'right', 'bottom', 'left']}
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
                <TextControl
                    __nextHasNoMarginBottom
                    __next40pxDefaultSize
                    label="Prefix Icon"
                    value={settings?.prefix}
                    onChange={(newValue) => updateSettings({prefix: newValue})}
                />

                <UnitControl
                    label="Radius"
                    value={settings?.radius}
                    onChange={(newValue) => updateSettings({radius: newValue})}
                    units={BORDER_UNITS}
                    isResetValueOnUnitChange={true}
                    __next40pxDefaultSize
                    __nextHasNoMarginBottom
                />


                <TextControl
                    __nextHasNoMarginBottom
                    __next40pxDefaultSize
                    label="Button Icon"
                    value={settings?.['button-icon']}
                    onChange={(newValue) => updateSettings({'button-icon': newValue})}
                />
            </Grid>

            <Grid columnGap={15} columns={2} rowGap={20} style={{marginTop: '20px'}}>
                <ToggleControl
                    __nextHasNoMarginBottom
                    __next40pxDefaultSize
                    label="Grow"
                    checked={!!settings?.grow}
                    onChange={(newValue) => updateSettings({grow: newValue})}
                />
            </Grid>

        </Grid>;

        const tabActive = <Grid columnGap={15} columns={1} rowGap={20}>

            <PanelColorSettings
                enableAlpha
                className={'!p-0 !border-0 [&_.components-tools-panel-item]:!m-0'}
                colorSettings={[
                    {
                        slug: 'active-color-border',
                        label: 'Border',
                        value: settings?.['active-color-border'],
                        onChange: (newValue) => updateSettings({'active-color-border': newValue}),
                        isShownByDefault: true
                    },
                    {
                        slug: 'active-color-button',
                        label: 'Button',
                        value: settings?.['active-color-button'],
                        onChange: (newValue) => updateSettings({'active-color-button': newValue}),
                        isShownByDefault: true
                    },
                    {
                        slug: 'active-color-button-text',
                        label: 'Button Text',
                        value: settings?.['active-color-button-text'],
                        onChange: (newValue) => updateSettings({'active-color-button-text': newValue}),
                        isShownByDefault: true
                    },
                    {
                        slug: 'active-color-background',
                        label: 'Background',
                        value: settings?.['active-color-background'],
                        onChange: (newValue) => updateSettings({'active-color-background': newValue}),
                        isShownByDefault: true
                    },
                    {
                        slug: 'active-color-text',
                        label: 'Text',
                        value: settings?.['active-color-text'],
                        onChange: (newValue) => updateSettings({'active-color-text': newValue}),
                        isShownByDefault: true
                    },
                    {
                        slug: 'active-color-label',
                        label: 'Label',
                        value: settings?.['active-color-label'],
                        onChange: (newValue) => updateSettings({'active-color-label': newValue}),
                        isShownByDefault: true
                    }
                ]}
            />


        </Grid>;

        const tabHover = <Grid columnGap={15} columns={1} rowGap={20}>
            <PanelColorSettings
                enableAlpha
                className={'!p-0 !border-0 [&_.components-tools-panel-item]:!m-0'}
                colorSettings={[
                    {
                        slug: 'hover-color-border',
                        label: 'Border',
                        value: settings?.['hover-color-border'],
                        onChange: (newValue) => updateSettings({'hover-color-border': newValue}),
                        isShownByDefault: true
                    },
                    {
                        slug: 'hover-color-button',
                        label: 'Button',
                        value: settings?.['hover-color-button'],
                        onChange: (newValue) => updateSettings({'hover-color-button': newValue}),
                        isShownByDefault: true
                    },
                    {
                        slug: 'hover-color-button-text',
                        label: 'Button Text',
                        value: settings?.['hover-color-button-text'],
                        onChange: (newValue) => updateSettings({'hover-color-button-text': newValue}),
                        isShownByDefault: true
                    },
                    {
                        slug: 'hover-color-background',
                        label: 'Background',
                        value: settings?.['hover-color-background'],
                        onChange: (newValue) => updateSettings({'hover-color-background': newValue}),
                        isShownByDefault: true
                    },
                    {
                        slug: 'hover-color-text',
                        label: 'Text',
                        value: settings?.['hover-color-text'],
                        onChange: (newValue) => updateSettings({'hover-color-text': newValue}),
                        isShownByDefault: true
                    },
                    {
                        slug: 'hover-color-label',
                        label: 'Label',
                        value: settings?.['hover-color-label'],
                        onChange: (newValue) => updateSettings({'hover-color-label': newValue}),
                        isShownByDefault: true
                    }
                ]}
            />
        </Grid>;


        const tabs = {
            options: tabOptions,
            active: tabActive,
            hover: tabHover,
        }

        return (
            <>

                <InspectorControls group="styles">

                    <PanelBody initialOpen={true}>
                        <TabPanel
                            className="wpbs-editor-tabs"
                            activeClass="active"
                            orientation="horizontal"
                            initialTabName="options"
                            tabs={[
                                {
                                    name: 'options',
                                    title: 'Options',
                                    className: 'tab-options',
                                },
                                {
                                    name: 'active',
                                    title: 'Active',
                                    className: 'tab-active',
                                },
                                {
                                    name: 'hover',
                                    title: 'Hover',
                                    className: 'tab-hover',
                                }
                            ]}>
                            {
                                (tab) => (<>{tabs[tab.name]}</>)
                            }
                        </TabPanel>
                    </PanelBody>

                </InspectorControls>

                <Style attributes={attributes} setAttributes={setAttributes} uniqueId={uniqueId}
                       deps={['wpbs-archive-filters']} selector={'wpbs-archive-filters'}
                       props={cssProps}
                />


                <label {...blockProps}>
                    <FilterFields settings={settings} is_editor={true} uniqueId={uniqueId}/>
                </label>

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

        return <label {...blockProps}>
            <FilterFields settings={props.attributes?.['wpbs-archive-filters']} uniqueId={props.attributes?.uniqueId}/>
        </label>;
    }
})


