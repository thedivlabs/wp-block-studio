import {registerBlockType} from "@wordpress/blocks";
import metadata from "./block.json";

import {STYLE_ATTRIBUTES, withStyle, withStyleSave} from 'Components/Style';
import {useEffect} from "@wordpress/element";

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
            const {'wpbs-style': settings = {}} = attributes;
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

        const {isLoop = false} = attributes;

        if (!!isLoop) {
            return null;
        }

        return (
            <BlockWrapper
                props={props}
                className={classNames}
                tagName={(isLoop ? 'template' : 'article')}
                {...{'data-block': (isLoop ? JSON.stringify(props) : {})}}
            />
        );
    }, {
        hasChildren: true,
        hasBackground: true,
    }),
});
