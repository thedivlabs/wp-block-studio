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

import {useSelect} from "@wordpress/data";

import {STYLE_ATTRIBUTES, withStyle, withStyleSave} from "Components/Style";
import {useCallback} from "@wordpress/element";
import {isEqual} from "lodash";

const selector = "wpbs-faq-content";

const getClassNames = (attributes = {}, styleData) => {
    const {"wpbs-faq-content": settings} = attributes;

    return [
        selector,
        "w-full",
        "block",
        "relative",
    ]
        .filter(Boolean)
        .join(" ");
};

registerBlockType(metadata.name, {
    apiVersion: 3,

    attributes: {
        ...metadata.attributes,
        ...STYLE_ATTRIBUTES,

        "wpbs-faq-content": {
            type: "object",
            default: {},
        },
    },

    edit: withStyle(
        (props) => {
            const {attributes, setAttributes, BlockWrapper, styleData} = props;

            const {"wpbs-faq-content": settings = {}} = attributes;

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
