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
import ResponsivePicture from "Components/ResponsivePicture";


//
// -------------------------------------------------------------
// FIELD MAP (UNCHANGED EXCEPT ICON FIELD NOW WORKS WITH NEW FORMAT)
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

    //
    // *** SURGICAL PATCH: ICON FIELD NOW RETURNS MATERIALICON OBJECT ***
    //
    {
        type: "icon",
        slug: "button-icon",
        label: "Icon",
        full: true,
    },
];


//
// -------------------------------------------------------------
// Helpers (unchanged except CSS vars patch)
// -------------------------------------------------------------
//

const selector = "wpbs-video-element";

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

//
// *** SURGICAL PATCH: CSS VARS NOW USE NEW ICON FORMAT ***
//
function getCssProps(settings = {}) {
    return cleanObject({
        props: {
            "--overlay": settings.overlay ?? "none",

            // OLD:
            // "--icon-color": settings["icon-color"] ?? null,

            // NEW (surgical):
            "--icon-color": settings["button-icon"]?.color || null,
            "--icon-gradient": settings["button-icon"]?.gradient || null,

            "--title-text": settings["title-text"] ?? null,
            "--title-bar": settings["title-bar"] ?? null,
        },
        breakpoints: {},
    });
}

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

function getPosterSrc(settings) {
    const {poster, resolution = "medium"} = settings;
    const vid = getVideoId(settings.link);

    if (poster?.source) {
        return getImageUrlForResolution(poster, resolution);
    }

    if (vid) {
        return `https://i3.ytimg.com/vi/${vid}/hqdefault.jpg`;
    }

    return "";
}

//
// -------------------------------------------------------------
// SURGICAL PATCH: MaterialIcon used properly with new object shape
// -------------------------------------------------------------
//

function renderVideoContent(settings, attributes, isEditor) {
    const titlePosition =
        settings["title-position"] === "bottom" ? "bottom-0" : "top-0";

    return (
        <>
            {settings.title && (
                <div className={`wpbs-video__title absolute z-20 left-0 w-full ${titlePosition}`}>
                    <span>{settings.title}</span>
                </div>
            )}

            <div
                className="wpbs-video__button pointer-events-none flex justify-center items-center absolute top-1/2 left-1/2 aspect-square z-20 transition-colors duration-300 leading-none"
            >
                <span className="screen-reader-text">Play video</span>
                <MaterialIcon {...(settings?.["button-icon"] ?? {})} />
            </div>

            {/* Replace old <img> with ResponsivePicture */}
            {settings.poster && (
                <ResponsivePicture
                    settings={{
                        props: {
                            image: settings.poster,
                            resolution: settings.resolution || "medium",
                            alt: settings.title || "",
                            eager: settings.eager,
                            className: "w-full !h-full absolute top-0 left-0 z-0 object-cover object-center",
                        },
                        breakpoints: {},
                    }}
                    editor={isEditor}
                />
            )}
        </>
    );
}

//
// -------------------------------------------------------------
// REGISTER BLOCK (surgically patched only in 3 places)
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

                //
                // OLD: string or partial object
                // NEW (surgical only):
                //
                "button-icon": undefined,

                "icon-color": undefined,
                "title-color": undefined,
                "title-position": "top",
            },
        },
    },

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

                        //
                        // SURGICAL PATCH:
                        // Now icon fields pass full MaterialIcon object
                        //
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
                        <Grid className={"wpbs-block-controls"} columns={2} columnGap={15} rowGap={20}>
                            {InspectorFields}
                        </Grid>
                    </PanelBody>
                </InspectorControls>

                <BlockWrapper
                    props={props}
                    className={classNames}
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
        tagName: "div",
    }),

    save: withStyleSave((props) => {
        const {attributes, styleData, BlockWrapper} = props;

        const settings = attributes["wpbs-video"] || {};
        const classNames = getClassNames(attributes, settings);

        return (
            <BlockWrapper
                props={props}
                className={classNames}
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
        tagName: "div",
    }),
});