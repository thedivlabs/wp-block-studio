import {registerBlockType} from "@wordpress/blocks";
import metadata from "./block.json";

import {withStyle, STYLE_ATTRIBUTES, withStyleSave} from 'Components/Style';

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

            const {attributes, BlockWrapper, styleData, setPreload, setCss} = props;

            const classNames = getClassNames(attributes, styleData);

            setPreload([
                {id: 100, type: 'image'},
                {id: 200, type: 'image'},
            ]);

            setCss({props: {display: 'flex'}});

            return (
                <>
                    <BlockWrapper
                        props={props}
                        className={classNames}
                        hasBackground={true}
                    />
                </>
            );
        }),

    save: withStyleSave((props) => {
        const {attributes, BlockWrapper, styleData} = props;
        const classNames = getClassNames(attributes, styleData);

        return (
            <BlockWrapper
                props={props}
                className={classNames}
                hasBackground={true}
            />
        );
    }),
});
