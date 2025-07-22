import {
    InspectorControls, PanelColorSettings,
    useBlockProps,
    useInnerBlocksProps,
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "./block.json"
import {LAYOUT_ATTRIBUTES, LayoutControls} from "Components/Layout"
import {Style, STYLE_ATTRIBUTES} from "Components/Style"
import {ElementTagSettings, ElementTag, ELEMENT_TAG_ATTRIBUTES} from "Components/ElementTag";
import {useInstanceId} from "@wordpress/compose";
import React, {useCallback, useMemo} from "react";
import {
    __experimentalGrid as Grid, ToggleControl
} from "@wordpress/components";

function blockClassnames(attributes = {}) {

    return [
        'wpbs-site-header h-max',
        'flex flex-col w-full relative overflow-hidden',
        attributes?.uniqueId ?? '',
    ].filter(x => x).join(' ');
}

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...LAYOUT_ATTRIBUTES,
        ...STYLE_ATTRIBUTES,
    },
    edit: ({attributes, setAttributes, clientId}) => {

        const uniqueId = useInstanceId(registerBlockType, 'wpbs-site-header');

        const {'wpbs-site-header': settings = {}} = attributes;

        const cssProps = useMemo(() => {
            return {};
        }, [settings]);

        const blockProps = useBlockProps({className: blockClassnames(attributes)});

        const innerBlocksProps = useInnerBlocksProps(blockProps);

        const updateSettings = useCallback((newValue) => {

            const result = {
                ...settings,
                ...newValue
            }

            setAttributes({'wpbs-site-header': result});

        }, [setAttributes, settings])

        return (
            <>
                <InspectorControls group="styles">
                    <Grid columns={1} columnGap={30} rowGap={30}>
                        <Grid columns={2} columnGap={20} rowGap={20}>
                            <ToggleControl
                                __nextHasNoMarginBottom
                                label="Float"
                                checked={!!settings?.float}
                                onChange={(newValue) => updateSettings({float: newValue})}
                            />
                            <ToggleControl
                                __nextHasNoMarginBottom
                                label="Sticky"
                                checked={!!settings?.sticky}
                                onChange={(newValue) => updateSettings({sticky: newValue})}
                            />
                            <ToggleControl
                                __nextHasNoMarginBottom
                                label="Hidden"
                                checked={!!settings?.hidden}
                                onChange={(newValue) => updateSettings({hidden: newValue})}
                            />
                        </Grid>
                        <Grid columns={1} columnGap={20} rowGap={20}>
                            <PanelColorSettings
                                enableAlpha
                                className={'!p-0 !border-0 [&_.components-tools-panel-item]:!m-0'}
                                colorSettings={[
                                    {
                                        slug: 'reverse',
                                        label: 'Reverse',
                                        value: settings?.reverseColor ?? '',
                                        onChange: (newValue) => updateSettings({'icon-color': newValue}),
                                        isShownByDefault: true
                                    }
                                ]}
                            />
                        </Grid>
                    </Grid>

                </InspectorControls>
                <LayoutControls attributes={attributes} setAttributes={setAttributes}/>
                <Style attributes={attributes} setAttributes={setAttributes} uniqueId={uniqueId}
                       deps={['wpbs-site-header']}
                       props={cssProps}
                />
                <InspectorControls group="advanced">
                    <Grid columns={1} columnGap={15} rowGap={20} style={{paddingTop: '20px'}}>
                        <ElementTagSettings attributes={attributes} callback={setAttributes}></ElementTagSettings>
                    </Grid>
                </InspectorControls>

                <header {...innerBlocksProps} />

            </>
        )
    },
    save: (props) => {

        const blockProps = useBlockProps.save({
            className: blockClassnames(props.attributes),
            'data-wp-interactive': 'wpbs/site-header',
            'data-wp-init': 'actions.init',
            'data-wp-context': props.settings,
        });

        const innerBlocksProps = useInnerBlocksProps.save(blockProps);

        return <header {...innerBlocksProps} />;
    }
})


