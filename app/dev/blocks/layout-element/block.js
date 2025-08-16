import {
    useBlockProps,
    InspectorControls,
    useInnerBlocksProps,
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "./block.json"
import {LayoutControls, LAYOUT_ATTRIBUTES} from "Components/Layout"
import {BACKGROUND_ATTRIBUTES, BackgroundControls, BackgroundElement} from "Components/Background"
import {ElementTagSettings, ElementTag, ELEMENT_TAG_ATTRIBUTES} from "Components/ElementTag";
import {
    __experimentalGrid as Grid, ToggleControl,
} from "@wordpress/components";
import {useInstanceId} from "@wordpress/compose";
import React, {useCallback} from "react";
import {Style, STYLE_ATTRIBUTES} from "Components/Style"
import {useUniqueId} from "Includes/helper";

const selector = 'wpbs-layout-element';

const classNames = (attributes = {}) => {

    const {'wpbs-layout-element': settings} = attributes;

    return [
        selector + ' w-full block relative',
        !!settings?.container || !!attributes?.['wpbs-background']?.type ? 'wpbs-has-container' : (attributes?.['wpbs-layout']?.container ? 'wpbs-container' : null),
        attributes?.uniqueId ?? '',
    ].filter(x => x).join(' ');
}

function RenderContent({attributes, blockProps, innerBlocksProps, editor = false}) {

    const ElementTagName = ElementTag(attributes);

    const {'wpbs-layout-element': settings} = attributes;

    const hasContainer = !!settings?.container || !!attributes?.['wpbs-background']?.type;

    if (hasContainer) {
        return (
            <ElementTagName {...blockProps}>
                <div {...innerBlocksProps} />
                <BackgroundElement attributes={attributes} editor={editor}/>
            </ElementTagName>
        );
    } else {
        const {children, ...rest} = innerBlocksProps;
        return (
            <ElementTagName {...blockProps}>
                {children}
            </ElementTagName>
        );
    }
}

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...LAYOUT_ATTRIBUTES,
        ...BACKGROUND_ATTRIBUTES,
        ...STYLE_ATTRIBUTES,
        ...ELEMENT_TAG_ATTRIBUTES,
        'wpbs-layout-element': {
            type: 'object'
        }
    },
    edit: ({attributes, setAttributes, clientId}) => {

        //const uniqueId = useInstanceId(registerBlockType, 'wpbs-layout-element');

        const uniqueId = useUniqueId(attributes, setAttributes, clientId);

        const blockProps = useBlockProps({
            className: [classNames(attributes), 'empty:min-h-8'].join(' ')
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

        return (
            <>

                <LayoutControls attributes={attributes} setAttributes={setAttributes}/>
                <BackgroundControls attributes={attributes} setAttributes={setAttributes}/>
                <Style attributes={attributes} setAttributes={setAttributes} uniqueId={uniqueId} selector={selector}/>
                <InspectorControls group="advanced">
                    <Grid columns={1} columnGap={15} rowGap={20} style={{paddingTop: '20px'}}>
                        <ElementTagSettings attributes={attributes} setAttributes={setAttributes}/>
                        <ToggleControl
                            __nextHasNoMarginBottom
                            label="Container"
                            checked={!!attributes?.['wpbs-layout-element']?.container}
                            onChange={(newValue) => updateSettings({container: newValue})}
                        />
                    </Grid>
                </InspectorControls>
                <RenderContent
                    attributes={attributes}
                    blockProps={blockProps}
                    innerBlocksProps={innerBlocksProps}
                    editor={true}
                />

            </>
        )
    },
    save: (props) => {

        const {attributes} = props;

        const blockProps = useBlockProps.save({
            className: classNames(attributes),
            ...(props.attributes?.['wpbs-props'] ?? {})
        });

        const innerBlocksProps = !!props.attributes['wpbs-background']
            ? useInnerBlocksProps.save({className: selector + '__container wpbs-layout-wrapper wpbs-container w-full h-full relative z-20'})
            : useInnerBlocksProps.save(blockProps);

        return <RenderContent
            attributes={attributes}
            blockProps={blockProps}
            innerBlocksProps={innerBlocksProps}
            editor={false}
        />
    }
})


