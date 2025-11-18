import {useEffect} from "@wordpress/element";
import {registerBlockType} from "@wordpress/blocks";
import metadata from "./block.json";

import {withStyle, STYLE_ATTRIBUTES, withStyleSave} from 'Components/Style';

const selector = "wpbs-layout-element";

const getClassNames = (attributes = {}, styleData) => {
    const {"wpbs-layout-element": settings} = attributes;

    const result = [
        selector,
        "w-full",
        "block",
        "relative",
    ]
        .filter(Boolean)
        .join(' ')

    return result;
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

            const {attributes, BlockWrapper, styleData, setCss, setPreload} = props;

            const classNames = getClassNames(attributes, styleData);


            /*useEffect(() => {
                const preloads = [{id: 100, testing: true}];
                setPreload(preloads);
            }, [])*/

            useEffect(() => {
                const css = {props: {'--testing': 100}};
                //setCss(css);
            }, []);


            return (
                <>
                    <BlockWrapper
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
                className={classNames}
                hasBackground={true}
            />
        );
    }),
});
