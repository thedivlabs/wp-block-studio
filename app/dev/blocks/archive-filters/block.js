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
    __experimentalBorderControl as BorderControl,
    __experimentalBoxControl as BoxControl,
    __experimentalGrid as Grid,
    __experimentalUnitControl as UnitControl, BorderBoxControl,
    PanelBody,
    SelectControl, TabPanel,
    TextControl,
    ToggleControl,
} from "@wordpress/components";
import {useUniqueId} from "Includes/helper";
import {BORDER_UNITS, DIMENSION_UNITS_TEXT} from "Includes/config";

function blockClassnames(attributes = {}, editor = false) {

    const {'wpbs-archive-filters': settings = {}} = attributes;

    const result = [
        'wpbs-archive-filters',
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
                <div className={'wpbs-archive-filters__input .--select'}>
                    {!!settings?.prefix ? <div className={'wpbs-archive-filters__prefix'}/> : null}
                    <select
                        defaultValue={defaultValue}>
                        <option value="">{settings?.placeholder ?? 'Select'}</option>
                        {sortOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>

            </>;

        case 'search':
            return <>

                <span className={labelClass} dangerouslySetInnerHTML={{__html: settings?.label ?? 'Search'}}/>
                <div className={'wpbs-archive-filters__input .--search'}>
                    {!!settings?.prefix ? <div className={'wpbs-archive-filters__prefix'}/> : null}
                    <input
                        type="text"
                        defaultValue={defaultValue}
                        placeholder={settings?.placeholder ?? 'Search...'}
                    />
                    <button
                        type="button"
                        className="wpbs-archive-filters__submit"
                        dangerouslySetInnerHTML={{__html: settings?.button ?? 'Search'}}
                    />
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
                    '--overlay-color': settings?.['overlay-color'],
                    '--prefix': settings?.['prefix'],
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
                        slug: 'background',
                        label: 'Background',
                        value: settings?.['active-background-color'],
                        onChange: (newValue) => updateSettings({'active-background-color': newValue}),
                        isShownByDefault: true
                    },
                    {
                        slug: 'text',
                        label: 'Text',
                        value: settings?.['active-text-color'],
                        onChange: (newValue) => updateSettings({'active-text-color': newValue}),
                        isShownByDefault: true
                    },
                    {
                        slug: 'label',
                        label: 'Label',
                        value: settings?.['active-label-color'],
                        onChange: (newValue) => updateSettings({'active-label-color': newValue}),
                        isShownByDefault: true
                    },
                    {
                        slug: 'button',
                        label: 'Button',
                        value: settings?.['active-button-color'],
                        onChange: (newValue) => updateSettings({'active-button-color': newValue}),
                        isShownByDefault: true
                    },
                    {
                        slug: 'button-text',
                        label: 'Button Text',
                        value: settings?.['active-button-text-color'],
                        onChange: (newValue) => updateSettings({'active-button-text-color': newValue}),
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
                sides={['top', 'right', 'bottom', 'left']}
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
                        slug: 'border',
                        label: 'Border',
                        value: settings?.['active-border-color'],
                        onChange: (newValue) => updateSettings({'active-border-color': newValue}),
                        isShownByDefault: true
                    },
                    {
                        slug: 'button',
                        label: 'Button',
                        value: settings?.['active-button-color'],
                        onChange: (newValue) => updateSettings({'active-button-color': newValue}),
                        isShownByDefault: true
                    },
                    {
                        slug: 'button-text',
                        label: 'Button Text',
                        value: settings?.['active-button-text-color'],
                        onChange: (newValue) => updateSettings({'active-button-text-color': newValue}),
                        isShownByDefault: true
                    },
                    {
                        slug: 'background',
                        label: 'Background',
                        value: settings?.['active-background-color'],
                        onChange: (newValue) => updateSettings({'active-background-color': newValue}),
                        isShownByDefault: true
                    },
                    {
                        slug: 'text',
                        label: 'Text',
                        value: settings?.['active-text-color'],
                        onChange: (newValue) => updateSettings({'active-text-color': newValue}),
                        isShownByDefault: true
                    },
                    {
                        slug: 'label',
                        label: 'Label',
                        value: settings?.['active-label-color'],
                        onChange: (newValue) => updateSettings({'active-label-color': newValue}),
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
                        slug: 'border',
                        label: 'Border',
                        value: settings?.['hover-border-color'],
                        onChange: (newValue) => updateSettings({'hover-border-color': newValue}),
                        isShownByDefault: true
                    },
                    {
                        slug: 'button',
                        label: 'Button',
                        value: settings?.['hover-button-color'],
                        onChange: (newValue) => updateSettings({'hover-button-color': newValue}),
                        isShownByDefault: true
                    },
                    {
                        slug: 'button-text',
                        label: 'Button Text',
                        value: settings?.['hover-button-text-color'],
                        onChange: (newValue) => updateSettings({'hover-button-text-color': newValue}),
                        isShownByDefault: true
                    },
                    {
                        slug: 'background',
                        label: 'Background',
                        value: settings?.['hover-background-color'],
                        onChange: (newValue) => updateSettings({'hover-background-color': newValue}),
                        isShownByDefault: true
                    },
                    {
                        slug: 'text',
                        label: 'Text',
                        value: settings?.['hover-text-color'],
                        onChange: (newValue) => updateSettings({'hover-text-color': newValue}),
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
                                }, {
                                    name: 'active',
                                    title: 'Active',
                                    className: 'tab-active',
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


