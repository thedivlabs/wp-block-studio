import {registerBlockType} from "@wordpress/blocks";
import metadata from "./block.json";

import {withStyle, STYLE_ATTRIBUTES} from 'Components/BlockStyle';

const selector = "wpbs-layout-element";

const getClassNames = (attributes = {}, styleData) => {
    const {"wpbs-layout-element": settings} = attributes;

    return [
        selector,
        "w-full",
        "block",
        "relative",
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

            const {attributes, BlockWrapper, styleData} = props;

            const classNames = getClassNames(attributes, styleData);

            return (
                <>

                    <BlockWrapper
                        props={props}
                        className={classNames}
                    />

                </>
            );
        }),

    save: withStyle((props) => {
        const {attributes, BlockWrapper, styleData} = props;
        const classNames = getClassNames(attributes, styleData);

        return (
            <BlockWrapper
                props={props}
                className={classNames}
            />
        );
    }, true),
});
