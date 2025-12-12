import {registerBlockType} from "@wordpress/blocks";
import metadata from "./block.json";

import {
    InspectorControls,
} from "@wordpress/block-editor";

import {
    PanelBody,
    SelectControl,
    Spinner,
} from "@wordpress/components";

import {InnerBlocks} from "@wordpress/block-editor";

import {STYLE_ATTRIBUTES, withStyle, withStyleSave} from "Components/Style";
import {useCallback, useEffect} from "@wordpress/element";
import {isEqual} from "lodash";
import {MaterialIcon} from "Components/IconControl";

const selector = "wpbs-faq-header";

const getClassNames = (attributes = {}, styleData) => {
    const {"wpbs-faq-header": settings} = attributes;

    return [
        selector,
        "w-full",
        "block",
        "relative pointer-cursor select-none",
    ]
        .filter(Boolean)
        .join(" ");
};

registerBlockType(metadata.name, {
    apiVersion: 3,

    attributes: {
        ...metadata.attributes,
        ...STYLE_ATTRIBUTES,

        "wpbs-faq-header": {
            type: "object",
            default: {},
        },
    },

    edit: withStyle(
        (props) => {
            const {attributes, setAttributes, BlockWrapper, styleData, context} = props;

            const {"wpbs-faq-header": settings = {}} = attributes;
            const classNames = getClassNames(attributes, styleData);

            return (
                <>
                    <BlockWrapper
                        props={props}
                        className={classNames}
                    />
                </>
            );
        },
        {hasChildren: true}
    ),
    save: withStyleSave(
        (props) => {
            const {attributes, styleData, BlockWrapper} = props;
            const classNames = getClassNames(attributes, styleData);

            const {"wpbs-faq-header": settings = {}} = attributes;


            return (
                <BlockWrapper
                    props={props}
                    className={classNames}
                />
            );
        },
        {hasChildren: true}
    ),

});
