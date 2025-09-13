import {
    InspectorControls,
    useBlockProps,
    useInnerBlocksProps, useSetting,
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "./block.json"
import {LAYOUT_ATTRIBUTES, LayoutControls} from "Components/Layout"
import {Style, STYLE_ATTRIBUTES} from "Components/Style"
import {ElementTagSettings, ElementTag, ELEMENT_TAG_ATTRIBUTES} from "Components/ElementTag";
import React, {useCallback, useMemo} from "react";
import {
    __experimentalGrid as Grid, PanelBody, ToggleControl
} from "@wordpress/components";
import {useUniqueId} from "Includes/helper";

function blockClassnames(attributes = {}) {

    const {'wpbs-site-header': settings = {}} = attributes;

    return [
        'wpbs-site-header',
        'flex w-full relative wpbs-has-container',
        !!settings?.float ? '--float' : null,
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

        const uniqueId = useUniqueId(attributes, setAttributes, clientId);

        const {'wpbs-site-header': settings = {}} = attributes;

        const {breakpoints, header} = useSetting('custom');

        const adminCss = useMemo(() => {
            let result = ':root {';
            result += '--wpbs-header-height: ' + header?.height?.['xs'];
            result += '}';

            Object.entries((header?.height ?? {})).forEach(([key, value]) => {
                if (key === 'xs') return;
                result += '@media (min-width:' + (breakpoints?.[key]) + '){:root:{--wpbs-header-height: ' + value + '}}';
            });

            return result;
        }, [breakpoints, header]);


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
                            </Grid>
                        </Grid>
                    </PanelBody>

                </InspectorControls>
                <LayoutControls attributes={attributes} setAttributes={setAttributes}/>
                <Style attributes={attributes} setAttributes={setAttributes} uniqueId={uniqueId}
                       selector={'wpbs-site-header'}
                       props={cssProps}
                />
                <ElementTagSettings attributes={attributes} setAttributes={setAttributes}/>


                <ElementTagName {...blockProps} >
                    <div {...innerBlocksProps}/>
                    <style>{adminCss}</style>
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


