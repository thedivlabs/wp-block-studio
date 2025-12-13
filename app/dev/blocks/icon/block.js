import "./scss/block.scss";

import {registerBlockType} from "@wordpress/blocks";
import metadata from "./block.json";

import {InspectorControls} from "@wordpress/block-editor";
import {__experimentalGrid as Grid, PanelBody} from "@wordpress/components";
import {useCallback, useEffect, useMemo} from "@wordpress/element";
import {isEqual} from "lodash";

import {STYLE_ATTRIBUTES, withStyle, withStyleSave} from "Components/Style";
import {Field} from "Components/Field";
import {IconControl, MaterialIcon} from "Components/IconControl";
import Link, {getAnchorProps} from "Components/Link";
import {cleanObject} from "Includes/helper";

const selector = "wpbs-icon-block";

/* --------------------------------------------------------------
 * CLASSNAMES
 * -------------------------------------------------------------- */
const getClassNames = (attributes = {}) => {
    const {"wpbs-icon-block": settings = {}} = attributes;
    const isInline = settings?.inline ?? false;

    return [
        selector,
        isInline && "--inline",
    ]
        .filter(Boolean)
        .join(" ");
};

function getCssProps(attributes) {

    const {'wpbs-icon-block': settings = {}} = attributes;

    return Object.fromEntries(Object.entries({
        props: {
            '--icon-size': '24px'
        }
    }).filter(([k, v]) => v !== null));
}


registerBlockType(metadata.name, {
    apiVersion: 3,

    attributes: {
        ...metadata.attributes,
        ...STYLE_ATTRIBUTES,

        "wpbs-icon-block": {
            type: "object",
            default: {},
        },
    },

    edit: withStyle(
        (props) => {
            const {attributes, BlockWrapper, setAttributes, setCss} = props;
            const {"wpbs-icon-block": settings = {}} = attributes;

            const classNames = getClassNames(attributes);

            const isImage = Boolean(
                attributes?.className?.split(" ").includes("is-style-image")
            );

            const isLink = Boolean(settings?.link?.url);
            const anchorProps = isLink ? getAnchorProps(settings.link) : {};

            console.log(getCssProps(attributes));

            useEffect(() => {
                setCss(getCssProps(attributes));
            }, [settings, setCss]);

            const updateSettings = useCallback(
                (nextValue) => {
                    const next = {
                        ...settings,
                        ...nextValue,
                    };

                    if (!isEqual(settings, next)) {
                        setAttributes({
                            "wpbs-icon-block": next,
                        });
                    }
                },
                [settings, setAttributes]
            );

            const BlockContent = useMemo(() => (
                <>
                    {isImage && settings?.image?.url && (
                        <img
                            src={settings.image.url}
                            alt={settings?.image?.alt || ""}
                            aria-hidden={true}
                        />
                    )}
                    {!isImage && <MaterialIcon {...settings?.icon} />}
                </>
            ), [isImage, settings?.image, settings?.icon]);

            return (
                <>
                    <InspectorControls group="styles">
                        <Link
                            defaultValue={settings?.link}
                            callback={(val) => updateSettings({link: val})}
                        />

                        <PanelBody
                            initialOpen
                            className="wpbs-block-controls"
                        >
                            <Grid columns={1} columnGap={15} rowGap={20}>
                                {!isImage && (
                                    <IconControl
                                        fieldKey="icon"
                                        label="Icon"
                                        props={props}
                                        value={settings?.icon}
                                        onChange={(val) =>
                                            updateSettings({icon: val})
                                        }
                                    />
                                )}

                                {isImage && (
                                    <Field
                                        field={{
                                            type: "image",
                                            slug: "image",
                                            label: "Image",
                                            full: true,
                                        }}
                                        fieldKey="image"
                                        props={props}
                                        value={settings?.image}
                                        callback={(val) =>
                                            updateSettings({image: val})
                                        }
                                        isToolsPanel={false}
                                    />
                                )}

                                <Grid columns={2} columnGap={15} rowGap={20}>
                                    <Field
                                        field={{
                                            type: "toggle",
                                            slug: "inline",
                                            label: "Inline",
                                        }}
                                        fieldKey="inline"
                                        props={props}
                                        value={!!settings?.inline}
                                        callback={(val) =>
                                            updateSettings({inline: !!val})
                                        }
                                        isToolsPanel={false}
                                    />
                                </Grid>
                            </Grid>
                        </PanelBody>
                    </InspectorControls>

                    <BlockWrapper props={props} className={classNames}>
                        {isLink ? (
                            <a
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                }}
                            >
                                {BlockContent}
                            </a>

                        ) : (
                            BlockContent
                        )}
                    </BlockWrapper>
                </>
            );
        },
        {hasChildren: false, hasBackground: false}
    ),

    save: withStyleSave(
        (props) => {
            const {attributes, BlockWrapper} = props;
            const {"wpbs-icon-block": settings = {}} = attributes;

            const classNames = getClassNames(attributes);

            const isImage = Boolean(
                attributes?.className?.split(" ").includes("is-style-image")
            );

            const isLink = Boolean(settings?.link?.url);
            const anchorProps = isLink ? getAnchorProps(settings.link) : {};

            const BlockContent = (
                <>
                    {isImage && settings?.image?.url && (
                        <img
                            src={settings.image.url}
                            alt={settings?.image?.alt || ""}
                            aria-hidden={true}
                        />
                    )}
                    {!isImage && <MaterialIcon {...settings?.icon} />}
                </>
            );

            return (
                <BlockWrapper props={props} className={classNames}>
                    {isLink ? (
                        <a {...anchorProps}>{BlockContent}</a>
                    ) : (
                        BlockContent
                    )}
                </BlockWrapper>
            );
        },
        {hasChildren: false, hasBackground: false}
    ),
});
