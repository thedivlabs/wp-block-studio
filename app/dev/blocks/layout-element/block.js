import {useState, useEffect, useMemo, useRef, Fragment, useCallback} from '@wordpress/element';
import {
    InspectorControls,
    useInnerBlocksProps,
} from "@wordpress/block-editor";
import {registerBlockType} from "@wordpress/blocks";
import metadata from "./block.json";
import {
    __experimentalGrid as Grid,
    ToggleControl,
} from "@wordpress/components";

console.log('WPBS.Style available:', !!WPBS?.Style);
const {withStyle, withStyleSave} = WPBS?.Style ?? {};


const selector = "wpbs-layout-element";

const classNames = (attributes = {}, styleData) => {
    const {"wpbs-layout-element": settings} = attributes;

    const {hasContainer = false} = styleData;

    return [
        selector,
        "w-full",
        "block",
        "relative",
        hasContainer ? "wpbs-has-container" : null,
    ]
        .filter(Boolean)
        .join(' ');
};

// -----------------------------------------------------
// Block Registration
// -----------------------------------------------------

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        "wpbs-layout-element": {
            type: "object",
            default: {},
        },
    },

    edit: withStyle(
        ({attributes, setAttributes, styleBlockProps, styleData, ElementTagName, Background, isSelected}) => {
            const {"wpbs-layout-element": settings = {}} = attributes;

            const {hasContainer = false} = styleData;

            const blockProps = styleBlockProps({
                className: classNames(attributes, styleData),
            });

            const containerProps = {
                className: [
                    selector + "__container",
                    'wpbs-layout-wrapper wpbs-container w-full h-full relative z-20',
                ].filter(Boolean).join(' '),
            }

            const innerBlocksProps = hasContainer
                ? useInnerBlocksProps(
                    containerProps,
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
            console.log('qqqqqq');
            return (
                <>

                    {isSelected && <InspectorControls group="advanced">
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
                    </InspectorControls>}

                    <ElementTagName {...blockProps}>
                        {hasContainer ? (
                            <div {...innerBlocksProps} />
                        ) : (
                            innerBlocksProps.children
                        )}
                        <Background/>
                    </ElementTagName>
                </>
            );
        }, {background: true, tagName: true}),

    save: withStyleSave(({attributes, styleBlockProps, styleData, ElementTagName, Background}) => {

        const {hasContainer} = styleData;

        const blockProps = styleBlockProps({
            className: classNames(attributes, styleData),
        });

        const innerBlocksProps = hasContainer
            ? useInnerBlocksProps.save({
                className:
                    selector +
                    "__container wpbs-layout-wrapper wpbs-container w-full h-full relative z-20",
            })
            : useInnerBlocksProps.save(blockProps);

        return (
            <ElementTagName {...blockProps}>
                {hasContainer ? (
                    <div {...innerBlocksProps} />
                ) : (
                    innerBlocksProps.children
                )}
                <Background/>
            </ElementTagName>
        );
    }, {background: true}),
});
