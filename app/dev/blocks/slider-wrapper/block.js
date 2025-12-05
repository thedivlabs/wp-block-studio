import {registerBlockType} from "@wordpress/blocks";
import metadata from "./block.json";

import {STYLE_ATTRIBUTES, withStyle, withStyleSave} from 'Components/Style';

const selector = "wpbs-slider-wrapper";

const getClassNames = (attributes = {}, styleData) => {
    const {"wpbs-slider-wrapper": settings} = attributes;

    return [
        selector,
        "swiper-wrapper grid-container",
    ]
        .filter(Boolean)
        .join(' ');
};

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...STYLE_ATTRIBUTES,
        "wpbs-slider-wrapper": {
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
                    />
                </>
            );
        }, {
            hasChildren: true,
            hasBackground: false,
            hasAdvanced: false,
            hasStyleEditor: false,
        }),

    save: withStyleSave((props) => {
        const {attributes, styleData, BlockWrapper} = props;
        const classNames = getClassNames(attributes, styleData);

        return (
            <BlockWrapper
                props={props}
                className={classNames}
            />
        );
    }, {
        hasChildren: true,
        hasBackground: false,
        hasAdvanced: false,
        hasStyleEditor: false,
    }),
});
