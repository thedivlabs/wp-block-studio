import "./scss/block.scss";

import {registerBlockType} from "@wordpress/blocks";
import metadata from "./block.json";

import {
    withStyle,
    withStyleSave,
    STYLE_ATTRIBUTES
} from "Components/Style";

import PreviewThumbnail from "Components/PreviewThumbnail";
import {IconControl} from "Components/IconControl";

import {
    useCallback,
    useEffect,
} from "@wordpress/element";

import {
    InspectorControls,
    MediaUpload,
    MediaUploadCheck,
    PanelColorSettings,
} from "@wordpress/block-editor";

import {
    PanelBody,
    SelectControl,
    TextControl,
    ToggleControl,
    BaseControl,
    __experimentalGrid as Grid,
    GradientPicker,
} from "@wordpress/components";

import {RESOLUTION_OPTIONS} from "Includes/config";
import {cleanObject} from "Includes/helper";


// -------------------------------------------
// Helpers
// -------------------------------------------

const selector = "wpbs-video";

/** Extract a YouTube ID from a share URL or watch URL. */
function getVideoId(link = "") {
    if (!link) return null;

    try {
        const url = new URL(link);
        if (url.hostname.includes("youtu")) {
            if (url.pathname.startsWith("/watch")) {
                return url.searchParams.get("v");
            }
            return url.pathname.replace(/^\/+/, "");
        }
    } catch (e) {
        return null;
    }

    return null;
}

function getClassNames(attributes = {}, styleData) {
    const uniqueId = attributes.uniqueId || "";
    return [
        selector,
        "flex items-center justify-center relative w-full h-auto overflow-hidden cursor-pointer aspect-video",
        uniqueId
    ]
        .filter(Boolean)
        .join(" ");
}


/** CSS vars for HOC */
function getCssProps(settings = {}) {
    return cleanObject({
        props: {
            "--overlay": settings.overlay ?? "none",
            "--icon-color": settings["icon-color"] ?? null,
            "--title-color": settings["title-color"] ?? null,
        },
        breakpoints: {} // no breakpoints for this block
    });
}

/** Preload logic */
function getPreload(settings = {}) {
    if (!settings.eager) return [];

    const poster = settings.poster;
    if (poster?.id) {
        return [
            {
                id: poster.id,
                type: "image"
            }
        ];
    }

    return [];
}


/** Compute poster URL */
function getPosterSrc(settings) {
    const {poster, resolution = "medium"} = settings;
    const vid = getVideoId(settings.link);

    // 1) Custom poster
    if (poster?.sizes?.[resolution]?.url) {
        return poster.sizes[resolution].url;
    }

    // 2) Fallback YouTube poster
    if (vid) {
        return `https://i3.ytimg.com/vi/${vid}/hqdefault.jpg`;
    }

    return "";
}


/** Render the inner video markup */
function renderVideoContent(settings, attributes, isEditor) {
    const videoId = getVideoId(settings.link);
    const posterSrc = getPosterSrc(settings);

    const mediaProps = Object.fromEntries(Object.entries({
        className: 'wpbs-video__media w-full h-full overflow-hidden relative',
        'data-wp-on--click': !isEditor && 'actions.play',
        'data-video-id': videoId,
    }).filter(Boolean));


    return (
        <div {...mediaProps}>
            {settings.title && (
                <div className="wpbs-video__title absolute z-20 top-0 left-0 w-full">
                    <span>{settings.title}</span>
                </div>
            )}

            <div
                className="wpbs-video__button wp-element-button pointer-events-none flex justify-center items-center absolute top-1/2 left-1/2 aspect-square z-20 transition-colors duration-300 leading-none">
                <span className="screen-reader-text">Play video</span>
            </div>

            {posterSrc && (
                <img
                    src={posterSrc}
                    alt=""
                    className="w-full !h-full absolute top-0 left-0 z-0 object-cover object-center"
                />
            )}
        </div>
    );
}


// -------------------------------------------
// REGISTER BLOCK
// -------------------------------------------

registerBlockType(metadata.name, {
    apiVersion: 3,

    attributes: {
        ...metadata.attributes,
        ...STYLE_ATTRIBUTES,

        "wpbs-video": {
            type: "object",
            default: {
                poster: undefined,
                eager: false,
                lightbox: false,
                overlay: undefined,
                link: "",
                platform: "youtube",
                title: "",
                resolution: "medium",
                "button-icon": undefined,
                "icon-color": undefined,
                "title-color": undefined,
            }
        }
    },

    // -----------------------------------------------------
    // EDIT (HOC)
    // -----------------------------------------------------
    edit: withStyle((props) => {
        const {attributes, setAttributes, styleData, BlockWrapper, setCss, setPreload} = props;
        const settings = attributes["wpbs-video"] || {};

        const updateSettings = useCallback((newValue) => {
            setAttributes({
                "wpbs-video": {
                    ...settings,
                    ...newValue
                }
            });
        }, [settings, setAttributes]);

        // Push CSS + preload into HOC
        useEffect(() => {
            setCss(getCssProps(settings));
            setPreload(getPreload(settings));
        }, [settings]);

        // Classnames
        const classNames = getClassNames(attributes, styleData);

        return (
            <>
                <InspectorControls group="styles">
                    <PanelBody initialOpen={false} title={'Video'}>
                        <Grid columns={1} columnGap={15} rowGap={20}>

                            <TextControl
                                label="Share Link"
                                value={settings?.link}
                                onChange={(v) => updateSettings({link: v})}
                                __next40pxDefaultSize
                            />

                            <TextControl
                                label="Title"
                                value={settings?.title}
                                onChange={(v) => updateSettings({title: v})}
                                __next40pxDefaultSize
                            />

                            <IconControl
                                label="Button Icon"
                                value={settings["button-icon"]}
                                onChange={(v) => updateSettings({"button-icon": v})}
                                props={props}
                            />

                            <PanelColorSettings
                                enableAlpha
                                colorSettings={[
                                    {
                                        slug: "icon-color",
                                        label: "Icon Color",
                                        value: settings["icon-color"],
                                        onChange: (v) => updateSettings({"icon-color": v}),
                                    },
                                    {
                                        slug: "title-color",
                                        label: "Title Color",
                                        value: settings["title-color"],
                                        onChange: (v) => updateSettings({"title-color": v}),
                                    }
                                ]}
                            />

                            <BaseControl label="Poster Image">
                                <MediaUploadCheck>
                                    <MediaUpload
                                        title={"Poster Image"}
                                        onSelect={(value) => updateSettings({
                                            poster: {
                                                type: value.type,
                                                id: value.id,
                                                url: value.url,
                                                alt: value.alt,
                                                sizes: value.sizes,
                                            }
                                        })}
                                        allowedTypes={["image"]}
                                        value={settings?.poster}
                                        render={({open}) => (
                                            <PreviewThumbnail
                                                image={settings?.poster || {}}
                                                callback={() => updateSettings({poster: undefined})}
                                                onClick={open}
                                            />
                                        )}
                                    />
                                </MediaUploadCheck>
                            </BaseControl>

                            <SelectControl
                                label="Resolution"
                                options={RESOLUTION_OPTIONS}
                                value={settings.resolution}
                                onChange={(v) => updateSettings({resolution: v})}
                            />

                            <Grid columns={2} columnGap={15} rowGap={20}>

                                <ToggleControl
                                    label="Eager"
                                    checked={!!settings.eager}
                                    onChange={(v) => updateSettings({eager: v})}
                                />

                                <ToggleControl
                                    label="Lightbox"
                                    checked={!!settings.lightbox}
                                    onChange={(v) => updateSettings({lightbox: v})}
                                />

                            </Grid>

                            <BaseControl label="Overlay">
                                <GradientPicker
                                    gradients={[
                                        {
                                            name: "Transparent",
                                            gradient: "linear-gradient(rgba(0,0,0,0),rgba(0,0,0,0))",
                                            slug: "transparent"
                                        },
                                        {
                                            name: "Light",
                                            gradient: "linear-gradient(rgba(0,0,0,.3),rgba(0,0,0,.3))",
                                            slug: "light"
                                        },
                                        {
                                            name: "Strong",
                                            gradient: "linear-gradient(rgba(0,0,0,.7),rgba(0,0,0,.7))",
                                            slug: "strong"
                                        }
                                    ]}
                                    clearable={true}
                                    value={settings.overlay ?? undefined}
                                    onChange={(v) => updateSettings({overlay: v})}
                                />
                            </BaseControl>

                        </Grid>
                    </PanelBody>
                </InspectorControls>


                <BlockWrapper
                    props={props}
                    className={classNames}
                    tagName="div"
                    hasBackground={false}
                    data-platform="youtube"
                    data-video-id={getVideoId(settings.link)}
                    data-lightbox={settings.lightbox ? "1" : "0"}
                >
                    {renderVideoContent(settings, attributes, true)}
                </BlockWrapper>
            </>
        );
    }),


    // -----------------------------------------------------
    // SAVE (HOC)
    // -----------------------------------------------------
    save: withStyleSave((props) => {
        const {attributes, styleData, BlockWrapper} = props;
        const settings = attributes["wpbs-video"] || {};
        const classNames = getClassNames(attributes, styleData);

        return (
            <BlockWrapper
                props={props}
                className={classNames}
                tagName="div"
                hasBackground={false}
                data-platform="youtube"
                data-video-id={getVideoId(settings.link)}
                data-lightbox={settings.lightbox ? "1" : "0"}
                data-wp-interactive="wpbsVideo"
                data-wp-context={JSON.stringify({
                    videoId: getVideoId(settings.link),
                    lightbox: !!settings.lightbox,
                    platform: "youtube"
                })}

            >
                {renderVideoContent(settings, attributes, false)}
            </BlockWrapper>
        );
    }),
});
