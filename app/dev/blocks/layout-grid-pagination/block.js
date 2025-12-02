import "./scss/block.scss";

import {registerBlockType} from "@wordpress/blocks";
import metadata from "./block.json";
import Link, {getAnchorProps} from "Components/Link";


import {STYLE_ATTRIBUTES, withStyle, withStyleSave} from 'Components/Style';
import {useEffect} from "@wordpress/element";
import {InnerBlocks, InspectorControls} from "@wordpress/block-editor";

const selector = "wpbs-layout-grid-pagination";

const getClassNames = (attributes = {}, styleData) => {
    const {"wpbs-layout-grid-pagination": settings} = attributes;

    return [
        selector
    ]
        .filter(Boolean)
        .join(' ');
};

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...STYLE_ATTRIBUTES,
        "wpbs-layout-grid-pagination": {
            type: "object",
            default: {},
        },
    },

    edit: withStyle(
        (props) => {

            const {attributes, styleData, BlockWrapper, context, setAttributes} = props;
            const {'wpbs-layout-grid-pagination': settings = {}} = attributes;
            const classNames = getClassNames(attributes, styleData);


            return (
                <>
                    <BlockWrapper
                        props={props}
                        className={classNames}
                    >
                        PAGINATION
                    </BlockWrapper>
                </>
            );
        }, {
            hasChildren: false,
            hasBackground: false,
        }),

    save: null,
});
