import {registerBlockType} from "@wordpress/blocks";
import metadata from "./block.json";

import {STYLE_ATTRIBUTES, withStyle, withStyleSave} from 'Components/Style';

const selector = "wpbs-layout-grid-container";

const getClassNames = (attributes = {}, styleData) => {
    const {"wpbs-layout-grid-container": settings} = attributes;

    return [
        selector,
        'loop-container w-full flex flex-wrap relative z-20',
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
        "wpbs-layout-grid-container": {
            type: "object",
            default: {},
        },
    },

    edit: withStyle(
        (props) => {

            const {attributes, styleData, BlockWrapper, setCss, setPreload} = props;
            const classNames = getClassNames(attributes, styleData);

            return (
                <>
                    <BlockWrapper
                        props={props}
                        className={classNames}
                        hasBackground={true}
                        hasChildren={true}
                    />
                </>
            );
        }),

    save: withStyleSave((props) => {
        const {attributes, styleData, BlockWrapper} = props;
        const classNames = getClassNames(attributes, styleData);

        return (
            <BlockWrapper
                props={props}
                className={classNames}
                hasBackground={true}
                hasChildren={true}
            />
        );
    }),
});
