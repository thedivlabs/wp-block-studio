import {registerBlockType} from "@wordpress/blocks";
import metadata from "./block.json";

import {STYLE_ATTRIBUTES, withStyle, withStyleSave} from 'Components/Style';
import {InnerBlocks} from "@wordpress/block-editor";
import {useEffect} from "@wordpress/element";

const selector = "wpbs-slider-wrapper";

const getClassNames = (attributes = {}, styleData) => {
    const {"wpbs-slider-wrapper": settings} = attributes;

    return [
        selector,
        "swiper-wrapper",
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

            const {attributes, styleData, BlockWrapper, setCss, setPreload, setAttributes, context} = props;
            const classNames = getClassNames(attributes, styleData);

            const {'wpbs/isGallery': isGallery, 'wpbs/isLoop': isLoop} = context;

            useEffect(() => {
                const next = {
                    isLoop,
                    isGallery
                };

                if (
                    next.isLoop !== attributes.isLoop ||
                    next.isGallery !== attributes.isGallery
                ) {
                    setAttributes(next);
                }
            }, [isLoop, isGallery]);

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

        const {isGallery, isLoop} = attributes;

        return (
            <BlockWrapper
                props={props}
                className={classNames}
            >
                {!isGallery && !isLoop && <InnerBlocks.Content/>}
                {isGallery || isLoop && '%%__BLOCK_CONTENT__%%'}
            </BlockWrapper>
        );
    }, {
        hasChildren: true,
        hasBackground: false,
        hasAdvanced: false,
        hasStyleEditor: false,
    }),
});
