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

import {withStyle, withStyleSave, STYLE_ATTRIBUTES} from 'Components/Style';


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

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...STYLE_ATTRIBUTES,
        "wpbs-layout-element": {
            type: "object",
            default: {},
        },
    },

    edit: withStyle(
        (props) => {

            const {attributes, setAttributes, BlockWrapper, styleData, isSelected} = props;

            const {"wpbs-layout-element": settings = {}} = attributes;

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

                    <BlockWrapper
                        props={props}
                        hasContainer={!!settings?.container}
                        className={classNames(attributes, styleData)}
                        id={attributes.uniqueId}
                    />

                </>
            );
        }),

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
    }),
});
