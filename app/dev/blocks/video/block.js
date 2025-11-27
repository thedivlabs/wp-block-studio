import "./scss/block.scss";

import {registerBlockType} from "@wordpress/blocks";
import metadata from "./block.json";

import {
    withStyle,
    withStyleSave,
    STYLE_ATTRIBUTES,
} from "Components/Style";

import {Field} from "Components/Field";
import {OVERLAY_GRADIENTS, RESOLUTION_OPTIONS} from "Includes/config";

import {
    useCallback,
    useEffect,
    useMemo,
} from "@wordpress/element";

import {
    InspectorControls,
} from "@wordpress/block-editor";

import {
    PanelBody,
    __experimentalGrid as Grid,
} from "@wordpress/components";

import {cleanObject, getImageUrlForResolution} from "Includes/helper";
import {isEqual} from "lodash";
import {MaterialIcon} from "Components/IconControl";

//
// -------------------------------------------------------------
// FIELD MAP
// -------------------------------------------------------------
//

const fieldsMap = [
    {
        type: "text",
        slug: "link",
        label: "Share Link",
        full: true,
    },
    {
        type: "text",
        slug: "title",
        label: "Title",
        full: true,
    },
    {
        type: "image",
        slug: "poster",
        label: "Poster",
        full: true,
    },
    {
        type: "select",
        slug: "resolution",
        label: "Resolution",
        options: RESOLUTION_OPTIONS,
    },
    {
        type: "select",
        slug: "title-position",
        label: "Title Position",
        options: [
            {label: "Select", value: ""},
            {label: "Top", value: "top"},
            {label: "Bottom", value: "bottom"},
        ],
    },
    {
        type: "composite",
        slug: "options",
        label: "Options",
        full: true,
        fields: [
            {
                type: "toggle",
                slug: "eager",
                label: "Eager",
            },
            {
                type: "toggle",
                slug: "lightbox",
                label: "Lightbox",
            },
        ],
    },
    {
        type: "color",
        slug: "colors",
        label: "Colors",
        full: true,
        colors: [
            {slug: "icon-color", label: "Icon"},
            {slug: "title-text", label: "Title Text"},
            {slug: "title-bar", label: "Title Bar"},
        ],
    },
    {
        type: "gradient",
        slug: "overlay",
        label: "Overlay",
        full: true,
        gradients: OVERLAY_GRADIENTS,
    },
    {
        type: "icon",
        slug: "button-icon",
        label: "Icon",
        full: true,
    },
];


//
// -------------------------------------------------------------
// Helpers
// -------------------------------------------------------------
//

const selector = "wpbs-video-element";

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

/** Block wrapper classes */
function getClassNames(attributes = {}, settings = {}) {
    return [
        selector,
        attributes.uniqueId,
        "wpbs-video flex items-center justify-center relative w-full h-auto overflow-hidden cursor-pointer aspect-video",
        settings.lightbox ? "--lightbox" : null,
        settings.overlay ? "--overlay" : null,
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
            "--title-text": settings["title-text"] ?? null,
            "--title-bar": settings["title-bar"] ?? null,
        },
        breakpoints: {},
    });
}

/** Preload logic */
function getPreload(settings = {}) {
    if (!settings.eager) return [];

    const poster = settings.poster;
    if (poster?.id) {
        return [
            poster,
        ];
    }

    return [];
}

/** Compute poster URL */
function getPosterSrc(settings) {
    const {poster, resolution = "medium"} = settings;
    const vid = getVideoId(settings.link);

    if (poster?.sizes?.[resolution]?.url) {
        return getImageUrlForResolution(poster, resolution);
    }

    if (vid) {
        return `https://i3.ytimg.com/vi/${vid}/hqdefault.jpg`;
    }

    return "";
}

/** Render the inner video markup */
function renderVideoContent(settings, attributes, isEditor) {
    const posterSrc = getPosterSrc(settings);
    const titlePosition = settings["title-position"] === "bottom" ? "bottom-0" : "top-0";

    return (
        <>
            {settings.title && (
                <div className={`wpbs-video__title absolute z-20 left-0 w-full ${titlePosition}`}>
                    <span>{settings.title}</span>
                </div>
            )}

            <div
                className="wpbs-video__button pointer-events-none flex justify-center items-center absolute top-1/2 left-1/2 aspect-square z-20 transition-colors duration-300 leading-none">
                <span className="screen-reader-text">Play video</span>
                <MaterialIcon {...(settings?.['button-icon'] ?? {})} />
            </div>

            {posterSrc && (
                <img
                    src={posterSrc}
                    alt=""
                    className="w-full !h-full absolute top-0 left-0 z-0 object-cover object-center"
                />
            )}
        </>
    );
}

//
// -------------------------------------------------------------
// REGISTER BLOCK
// -------------------------------------------------------------
//

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
                "title-position": "top",
            },
        },
    },

    //
    // -----------------------------------------------------
    // EDIT (HOC)
    // -----------------------------------------------------
    //
    edit: withStyle((props) => {
        const {
            attributes,
            setAttributes,
            styleData,
            BlockWrapper,
            setCss,
            setPreload,
        } = props;

        const settings = attributes["wpbs-video"] || {};


        const updateSettings = useCallback(
            (patchObj) => {
                const next = {...settings, ...patchObj};
                if (!isEqual(settings, next)) {
                    setAttributes({"wpbs-video": next});
                }
            },
            [settings, setAttributes]
        );


        //
        // Sync CSS + preload
        //
        useEffect(() => {
            setCss(getCssProps(settings));
            setPreload(getPreload(settings));
        }, [settings]);

        const classNames = getClassNames(attributes, settings);

        const InspectorFields = useMemo(
            () =>
                fieldsMap.map((field) => (
                    <Field
                        key={field.slug}
                        field={field}
                        settings={settings}
                        callback={(obj) => updateSettings(obj)}
                        props={props}
                        isToolsPanel={false}
                    />
                )),
            [settings]
        );

        return (
            <>
                <InspectorControls group="styles">
                    <PanelBody initialOpen={true} title={"Video"}>
                        <Grid className={'wpbs-block-controls'} columns={2} columnGap={15} rowGap={20}>
                            {InspectorFields}
                        </Grid>
                    </PanelBody>
                </InspectorControls>

                <BlockWrapper
                    props={props}
                    className={classNames}
                    tagName="div"
                    data-platform="youtube"
                    data-vid={getVideoId(settings.link)}
                    data-title={settings.title || ""}
                >
                    {renderVideoContent(settings, attributes, true)}
                </BlockWrapper>
            </>
        );
    }, {
        hasBackground: false,
        hasAdvanced: false,
        hasChildren: false,
    }),

    //
    // -----------------------------------------------------
    // SAVE (HOC)
    // -----------------------------------------------------
    //
    save: withStyleSave((props) => {
        const {attributes, styleData, BlockWrapper} = props;

        const settings = attributes["wpbs-video"] || {};
        const classNames = getClassNames(attributes, settings);

        return (
            <BlockWrapper
                props={props}
                className={classNames}
                tagName="div"
                data-platform="youtube"
                data-vid={getVideoId(settings.link)}
                data-title={settings.title || ""}
            >
                {renderVideoContent(settings, attributes, false)}
            </BlockWrapper>
        );
    }, {
        hasBackground: false,
        hasAdvanced: false,
        hasChildren: false,
    }),
});
