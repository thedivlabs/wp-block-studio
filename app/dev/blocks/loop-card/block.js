import "./scss/block.scss";

import {registerBlockType} from "@wordpress/blocks";
import metadata from "./block.json";
import Link, {getAnchorProps} from "Components/Link";


import {STYLE_ATTRIBUTES, withStyle, withStyleSave} from 'Components/Style';
import {useEffect} from "@wordpress/element";
import {InnerBlocks, InspectorControls} from "@wordpress/block-editor";

const selector = "wpbs-grid-card";

const getClassNames = (attributes = {}, styleData) => {
    const {"wpbs-grid-card": settings} = attributes;

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
        "wpbs-grid-card": {
            type: "object",
            default: {},
        },
    },

    edit: withStyle(
        (props) => {

            const {attributes, styleData, BlockWrapper, context, setAttributes} = props;
            const {'wpbs-grid-card': settings = {}} = attributes;
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
                    <InspectorControls group="styles">
                        <Link
                            defaultValue={settings?.link}
                            callback={(val) =>
                                setAttributes({
                                    'wpbs-grid-card': {
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

        const {isLoop = false, 'wpbs-grid-card': settings} = attributes;

        return (
            <BlockWrapper
                props={props}
                className={classNames}
            >
                <InnerBlocks.Content/>
                {settings?.link && (<a {...getAnchorProps(settings.link)} className={'wpbs-grid-card__link'}><span
                    className={'screen-reader-text'}>{settings?.link?.title ?? 'Learn more'}</span> </a>)}
            </BlockWrapper>
        );
    }, {
        hasChildren: true,
        hasBackground: true,
    }),
});
