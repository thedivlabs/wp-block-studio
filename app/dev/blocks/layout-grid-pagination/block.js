import "./scss/block.scss";

import {registerBlockType} from "@wordpress/blocks";
import metadata from "./block.json";

import {STYLE_ATTRIBUTES, withStyle} from 'Components/Style';

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

            const {attributes, styleData, BlockWrapper, setAttributes} = props;
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

    save: () => null,
});
