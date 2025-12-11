import "./scss/block.scss";

import {registerBlockType} from "@wordpress/blocks";
import metadata from "./block.json";
import Link, {getAnchorProps} from "Components/Link";


import {STYLE_ATTRIBUTES, withStyle, withStyleSave} from 'Components/Style';
import {useEffect} from "@wordpress/element";
import {InnerBlocks, InspectorControls} from "@wordpress/block-editor";
import {isEqual} from "lodash";

const selector = "wpbs-loop-card";

const getClassNames = (attributes = {}, styleData) => {
    const {"wpbs-loop-card": settings} = attributes;

    return [
        selector,
        'grid-card',
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
        "wpbs-loop-card": {
            type: "object",
            default: {},
        },
    },

    edit: withStyle(
        (props) => {

            const {attributes, styleData, BlockWrapper, context, setAttributes} = props;
            const {'wpbs-loop-card': settings = {}} = attributes;
            const classNames = getClassNames(attributes, styleData);

            const {'wpbs/isLoop': isLoop} = context;

            useEffect(() => {
                // Context booleans
                const isGallery = !!context?.["wpbs/isGallery"];
                const isLoop = !!context?.["wpbs/isLoop"];

                // Only update if different from current attributes
                const next = {
                    isGallery,
                    isLoop,
                };

                const current = {
                    isGallery: !!attributes?.isGallery,
                    isLoop: !!attributes?.isLoop,
                };

                if (!isEqual(current, next)) {
                    setAttributes(next);
                }
            }, [
                context?.["wpbs/isGallery"],
                context?.["wpbs/isLoop"],
            ]);

            return (
                <>
                    <InspectorControls group="styles">
                        <Link
                            defaultValue={settings?.link}
                            callback={(val) =>
                                setAttributes({
                                    'wpbs-loop-card': {
                                        ...settings,
                                        link: val,
                                    }
                                })
                            }
                            isLoop={isLoop}
                        />
                    </InspectorControls>
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

        const {isLoop = false, isGallery, 'wpbs-loop-card': settings} = attributes;


        return (
            <BlockWrapper
                props={props}
                className={classNames}
            >
                {!isGallery && <InnerBlocks.Content/>}

                {settings?.link && !isGallery && (
                    <a {...getAnchorProps(settings.link)} className={'wpbs-loop-card__link'}><span
                        className={'screen-reader-text'}>{settings?.link?.title ?? 'Learn more'}</span> </a>)}
            </BlockWrapper>
        );
    }, {
        hasChildren: true,
        hasBackground: true,
    }),
});
