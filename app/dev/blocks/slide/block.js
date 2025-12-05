import "./scss/block.scss";

import {registerBlockType} from "@wordpress/blocks";
import metadata from "./block.json";


import {STYLE_ATTRIBUTES, withStyle, withStyleSave} from 'Components/Style';
import {useEffect} from "@wordpress/element";
import {InnerBlocks, InspectorControls} from "@wordpress/block-editor";

const selector = "wpbs-slide";

const getClassNames = (attributes = {}, styleData) => {
    const {"wpbs-slide": settings} = attributes;

    return [
        selector,
        'grid-card',
        "w-full",
        "flex",
        "swiper-slide",
    ]
        .filter(Boolean)
        .join(' ');
};

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...STYLE_ATTRIBUTES,
        "wpbs-slide": {
            type: "object",
            default: {},
        },
    },

    edit: withStyle(
        (props) => {

            const {attributes, styleData, BlockWrapper, context, setAttributes} = props;
            const {'wpbs-slide': settings = {}} = attributes;
            const classNames = getClassNames(attributes, styleData);

            const {'wpbs/isLoop': isLoop} = context;

            useEffect(() => {

                if (!isLoop && attributes.isLoop === undefined) {
                    return;
                }

                if (attributes.isLoop !== isLoop) {
                    setAttributes({isLoop: isLoop});
                }
            }, [isLoop]);

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
            hasBackground: true,
        }),

    save: withStyleSave((props) => {
        const {attributes, styleData, BlockWrapper} = props;
        const classNames = getClassNames(attributes, styleData);

        const {isLoop = false, 'wpbs-slide': settings} = attributes;

        return (
            <BlockWrapper
                props={props}
                className={classNames}
            >
                <InnerBlocks.Content/>
            </BlockWrapper>
        );
    }, {
        hasChildren: true,
        hasBackground: true,
    }),
});
