import {registerBlockType} from "@wordpress/blocks";
import {useEffect} from "@wordpress/element";
import metadata from "./block.json";

import {STYLE_ATTRIBUTES, withStyle, withStyleSave} from 'Components/Style';

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

            const {attributes, styleData, BlockWrapper, setCss, setPreload} = props;
            const {'wpbs-style': settings = {}} = attributes;
            const classNames = getClassNames(attributes, styleData);


            useEffect(() => {
                if (!settings?.background) {
                    return
                }
                console.log(attributes);
            }, []);

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
