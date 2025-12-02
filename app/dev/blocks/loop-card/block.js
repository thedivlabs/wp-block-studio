import {registerBlockType} from "@wordpress/blocks";
import metadata from "./block.json";
import Link, {getAnchorProps} from "Components/Link";


import {STYLE_ATTRIBUTES, withStyle, withStyleSave} from 'Components/Style';
import {useEffect} from "@wordpress/element";
import {InnerBlocks, InspectorControls} from "@wordpress/block-editor";

const selector = "wpbs-loop-card";

const getClassNames = (attributes = {}, styleData) => {
    const {"wpbs-loop-card": settings} = attributes;

    return [
        selector,
        'loop-card',
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
                                    'wpbs-loop-card': {
                                        ...settings,
                                        link: val,
                                    }
                                })
                            }
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

        const {isLoop = false, 'wpbs-loop-card': settings} = attributes;

        if (isLoop && settings?.link) {
            settings.link.url = '%%__POST_LINK_URL__%%'
        }

        return (
            <BlockWrapper
                props={props}
                className={classNames}
            >
                <InnerBlocks.Content/>
                {settings?.link && (<a {...getAnchorProps(settings.link)} className={'wpbs-loop-card__link'}><span
                    className={'screen-reader-text'}>{settings?.link?.title ?? 'Learn more'}</span> </a>)}
            </BlockWrapper>
        );
    }, {
        hasChildren: true,
        hasBackground: true,
    }),
});
