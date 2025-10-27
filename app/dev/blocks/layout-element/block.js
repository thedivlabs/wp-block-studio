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

const getClassNames = (attributes = {}, styleData) => {
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

            const {attributes, setAttributes, BlockWrapper, styleData} = props;

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

            const classNames = getClassNames(attributes, styleData);

            return (
                <>

                    <BlockWrapper
                        props={props}
                        className={classNames}
                        id={attributes.uniqueId}
                    />

                </>
            );
        }),

    save: withStyleSave((props) => {
        const {attributes, BlockWrapper, styleData} = props;
        const {"wpbs-layout-element": settings = {}} = attributes;
        const classNames = getClassNames(attributes, styleData);

        return (
            <BlockWrapper
                props={props}
                className={classNames}
                id={attributes.uniqueId}
            />
        );
    }),
});
