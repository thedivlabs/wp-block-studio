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
    __experimentalGrid as Grid,
} from "@wordpress/components";
import {useInstanceId} from "@wordpress/compose";
import React from "react";
import {Style, STYLE_ATTRIBUTES} from "Components/Style"

const selector = 'wpbs-layout-element';

const classNames = (attributes = {}) => {

    return [
        selector + ' w-full block relative',
        !!attributes['wpbs-background'] ? 'wpbs-has-container' : null,
        attributes?.uniqueId ?? '',
    ].filter(x => x).join(' ');
}

function RenderContent({attributes, blockProps, innerBlocksProps, editor = false}) {

    const ElementTagName = ElementTag(attributes);

    if (!!attributes['wpbs-background']?.type) {
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
    },
    edit: (props) => {

        const uniqueId = useInstanceId(registerBlockType, 'wpbs-layout-element');

        const {attributes, setAttributes, clientId} = props;

        const blockProps = useBlockProps({
            className: [classNames(attributes), 'empty:min-h-8'].join(' '),
        });

        const innerBlocksProps = !!attributes['wpbs-background']
            ? useInnerBlocksProps({className: selector + '__container wpbs-layout-wrapper wpbs-container w-full h-full relative z-20'}, {})
            : useInnerBlocksProps(blockProps, {});


        return (
            <>

                <LayoutControls attributes={attributes} setAttributes={setAttributes}/>
                <BackgroundControls attributes={attributes} setAttributes={setAttributes}/>
                <Style attributes={attributes} setAttributes={setAttributes} uniqueId={uniqueId}/>
                <InspectorControls group="advanced">
                    <Grid columns={1} columnGap={15} rowGap={20} style={{paddingTop: '20px'}}>
                        <ElementTagSettings attributes={attributes} callback={setAttributes}></ElementTagSettings>
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


