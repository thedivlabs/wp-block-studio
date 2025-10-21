import {
    useBlockProps,
    InspectorControls,
    useInnerBlocksProps,
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "./block.json"
import {ElementTagSettings, ElementTag, ELEMENT_TAG_ATTRIBUTES} from "Components/ElementTag";
import {
    __experimentalGrid as Grid, ToggleControl,
} from "@wordpress/components";
import React, {useCallback, useEffect} from "react";
import {withStyle, STYLE_ATTRIBUTES, Background} from "Components/Style.js";

const selector = 'wpbs-layout-element';

const classNames = (attributes = {}, editor = false) => {

    const {'wpbs-layout-element': settings} = attributes;

    return [
        selector + ' w-full block relative',
        !!editor ? 'empty:min-h-8' : null,
        !!settings?.container || !!attributes?.['wpbs-background']?.type ? 'wpbs-has-container' : (attributes?.['wpbs-layout']?.container ? 'wpbs-container' : null),
    ].filter(x => x).join(' ');
}

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...STYLE_ATTRIBUTES,
        ...ELEMENT_TAG_ATTRIBUTES,
        'wpbs-layout-element': {
            type: 'object'
        }
    },
    edit: withStyle(({attributes, setAttributes, clientId, setStyle}) => {

        const {'wpbs-layout-element': settings = {}} = attributes;

        const blockProps = useBlockProps({
            className: classNames(attributes, true)
        });

        const innerBlocksProps = !!attributes['wpbs-background']?.type || !!attributes['wpbs-layout-element']?.container
            ? useInnerBlocksProps({className: selector + '__container wpbs-layout-wrapper wpbs-container w-full h-full relative z-20'}, {})
            : useInnerBlocksProps(blockProps, {});

        const updateSettings = useCallback((newValue) => {

            const result = {
                ...(attributes?.['wpbs-layout-element'] ?? {}),
                ...newValue,
            }

            setAttributes({'wpbs-layout-element': result});

        }, [attributes, setAttributes])

        const hasContainer = !!settings?.container || !!attributes?.['wpbs-background']?.type;

        const ElementTagName = ElementTag(attributes);

        useEffect(() => {
            setStyle({
                background: true,
            });
        }, [setStyle]);

        return <>


            <ElementTagSettings attributes={attributes} setAttributes={setAttributes}/>
            <InspectorControls group="advanced">
                <Grid columns={1} columnGap={15} rowGap={20} style={{paddingTop: '20px'}}>
                    <ToggleControl
                        __nextHasNoMarginBottom
                        label="Container"
                        checked={!!attributes?.['wpbs-layout-element']?.container}
                        onChange={(newValue) => updateSettings({container: newValue})}
                    />
                </Grid>
            </InspectorControls>
            <ElementTagName {...blockProps}>
                {hasContainer ? <div {...innerBlocksProps} /> : <>{innerBlocksProps.children}</>}
                <Background attributes={attributes}/>
            </ElementTagName>

        </>
    }),
    save: (props) => {

        const {attributes} = props;

        const {'wpbs-layout-element': settings = {}} = attributes;

        const blockProps = useBlockProps.save({
            className: classNames(attributes),
            ...(props.attributes?.['wpbs-props'] ?? {})
        });

        const innerBlocksProps = !!props.attributes['wpbs-background']
            ? useInnerBlocksProps.save({className: selector + '__container wpbs-layout-wrapper wpbs-container w-full h-full relative z-20'})
            : useInnerBlocksProps.save(blockProps);

        const hasContainer = !!settings?.container || !!attributes?.['wpbs-background']?.type;

        const ElementTagName = ElementTag(attributes);

        return <ElementTagName {...blockProps}>
            {hasContainer ? <div {...innerBlocksProps} /> : <>{innerBlocksProps.children}</>}
            <Background attributes={attributes}/>
        </ElementTagName>
    }
})


