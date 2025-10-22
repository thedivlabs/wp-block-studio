import {
    useBlockProps,
    InspectorControls,
    useInnerBlocksProps,
} from "@wordpress/block-editor";
import {registerBlockType} from "@wordpress/blocks";
import metadata from "./block.json";
import React, {useCallback} from "react";
import {
    __experimentalGrid as Grid,
    ToggleControl,
} from "@wordpress/components";
import {
    withStyle,
    withStyleSave,
    STYLE_ATTRIBUTES,
    Background,
} from "Components/Style.js";
import {
    ElementTagSettings,
    ElementTag,
    ELEMENT_TAG_ATTRIBUTES,
} from "Components/ElementTag";

const selector = "wpbs-layout-element";

const classNames = (attributes = {}, editor = false, styleClassNames = "") => {
    const {"wpbs-layout-element": settings} = attributes;

    const hasContainer =
        !!settings?.container || !!attributes?.["wpbs-background"]?.type;

    return [
        selector,
        "w-full",
        "block",
        "relative",
        editor ? "empty:min-h-8" : null,
        hasContainer ? "wpbs-has-container" : null,
        styleClassNames,
    ]
        .filter(Boolean)
        .join(" ");
};

// -----------------------------------------------------
// Block Registration
// -----------------------------------------------------

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...STYLE_ATTRIBUTES,
        ...ELEMENT_TAG_ATTRIBUTES,
        "wpbs-layout-element": {
            type: "object",
            default: {},
        },
    },

    edit: withStyle(
        ({attributes, setAttributes, styleClassNames, setStyle, isSelected}) => {
            const {"wpbs-layout-element": settings = {}} = attributes;

            const blockProps = useBlockProps({
                className: classNames(attributes, true, styleClassNames),
            });

            const hasContainer =
                !!settings?.container || !!attributes?.["wpbs-background"]?.type;

            const innerBlocksProps = hasContainer
                ? useInnerBlocksProps(
                    {
                        className:
                            selector +
                            "__container wpbs-layout-wrapper wpbs-container w-full h-full relative z-20",
                    },
                    {}
                )
                : useInnerBlocksProps(blockProps, {});

            const updateSettings = useCallback(
                (newValue) => {
                    const result = {
                        ...(attributes?.["wpbs-layout-element"] ?? {}),
                        ...newValue,
                    };
                    setAttributes({"wpbs-layout-element": result});
                },
                [attributes?.["wpbs-layout-element"], setAttributes]
            );

            const ElementTagName = ElementTag(attributes);

            return (
                <>
                    {/* Tag settings panel (e.g., div, section, header) */}
                    <ElementTagSettings
                        attributes={attributes}
                        setAttributes={setAttributes}
                    />

                    {/* Layout controls */}
                    <InspectorControls group="advanced">
                        <Grid
                            columns={1}
                            columnGap={15}
                            rowGap={20}
                            style={{paddingTop: "20px"}}
                        >
                            <ToggleControl
                                __nextHasNoMarginBottom
                                label="Container"
                                checked={!!settings?.container}
                                onChange={(newValue) =>
                                    updateSettings({container: newValue})
                                }
                            />
                        </Grid>
                    </InspectorControls>

                    {/* Block content */}
                    <ElementTagName {...blockProps}>
                        {hasContainer ? (
                            <div {...innerBlocksProps} />
                        ) : (
                            innerBlocksProps.children
                        )}
                        <Background attributes={attributes}/>
                    </ElementTagName>
                </>
            );
        }
    ),

    save: withStyleSave((props) => {
        const {attributes} = props;
        const {"wpbs-layout-element": settings = {}} = attributes;

        const hasContainer =
            !!settings?.container || !!attributes?.["wpbs-background"]?.type;

        const blockProps = useBlockProps.save({
            className: classNames(attributes, false, ""),
            ...(attributes?.["wpbs-props"] ?? {}),
        });

        const innerBlocksProps = hasContainer
            ? useInnerBlocksProps.save({
                className:
                    selector +
                    "__container wpbs-layout-wrapper wpbs-container w-full h-full relative z-20",
            })
            : useInnerBlocksProps.save(blockProps);

        const ElementTagName = ElementTag(attributes);

        return (
            <ElementTagName {...blockProps}>
                {hasContainer ? (
                    <div {...innerBlocksProps} />
                ) : (
                    innerBlocksProps.children
                )}
                <Background attributes={attributes}/>
            </ElementTagName>
        );
    }),
});
