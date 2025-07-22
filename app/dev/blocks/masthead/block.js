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
    __experimentalGrid as Grid, PanelBody, ToggleControl
} from "@wordpress/components";

function blockClassnames(attributes = {}) {

    const {'wpbs-site-header': settings = {}} = attributes;

    return [
        'wpbs-site-header',
        'flex w-full relative overflow-hidden wpbs-has-container',
        !!settings?.float ? '--float is-style-reverse' : null,
        !!settings?.sticky ? '--sticky' : null,
        !!settings?.hidden ? '--hidden' : null,
        attributes?.uniqueId ?? '',
    ].filter(x => x).join(' ');
}

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...LAYOUT_ATTRIBUTES,
        ...STYLE_ATTRIBUTES,
        ...ELEMENT_TAG_ATTRIBUTES,
    },
    edit: ({attributes, setAttributes, clientId}) => {

        const uniqueId = useInstanceId(registerBlockType, 'wpbs-site-header');

        const {'wpbs-site-header': settings = {}} = attributes;

        const cssProps = useMemo(() => {
            return {};
        }, [settings]);

        const blockProps = useBlockProps({className: blockClassnames(attributes)});

        const innerBlocksProps = useInnerBlocksProps({
            className: 'wpbs-site-header__container wpbs-container wpbs-layout-wrapper w-full'
        });

        const updateSettings = useCallback((newValue) => {

            const result = {
                ...settings,
                ...newValue
            }

            setAttributes({'wpbs-site-header': result});

        }, [setAttributes, settings])

        const ElementTagName = ElementTag(attributes);

        return (
            <>
                <InspectorControls group="styles">

                    <PanelBody title={"Options"}>
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
                        </Grid>
                    </PanelBody>

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


                <ElementTagName {...blockProps} >
                    <div {...innerBlocksProps}/>
                </ElementTagName>

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

        const ElementTagName = ElementTag(props.attributes);

        const innerBlocksProps = useInnerBlocksProps.save({
            className: 'wpbs-site-header__container wpbs-container wpbs-layout-wrapper w-full'
        });

        return <ElementTagName {...blockProps} >
            <div {...innerBlocksProps}/>
        </ElementTagName>;
    }
})


