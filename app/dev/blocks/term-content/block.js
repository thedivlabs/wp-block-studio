import {registerBlockType} from "@wordpress/blocks";
import metadata from "./block.json";

import {
    InspectorControls,
} from "@wordpress/block-editor";

import {
    __experimentalNumberControl as NumberControl,
    __experimentalGrid as Grid,
    SelectControl,
    PanelBody,
    ToggleControl,
} from "@wordpress/components";

import {useMemo, useCallback} from "@wordpress/element";

import {withStyle, withStyleSave, STYLE_ATTRIBUTES} from "Components/Style";

import {RESOLUTION_OPTIONS} from "Includes/config";
import {LinkPost} from "Components/LinkPost";
import {BlockWrapper} from "Components/BlockWrapper";

const selector = "wpbs-term-content";

const CONTENT_OPTIONS = [
    {label: "Select", value: ""},
    {label: "Title", value: "title"},
    {label: "Description", value: "description"},
    {label: "Featured Image", value: "featured-image"},
    {label: "Poster", value: "poster"},
    {label: "Thumbnail", value: "thumbnail"},
    {label: "Content Title", value: "content-title"},
    {label: "Content Text", value: "content-text"},
    {label: "Related Title", value: "related-title"},
    {label: "Related Text", value: "related-text"},
    {label: "CTA Title", value: "cta-title"},
    {label: "CTA Text", value: "cta-text"},
    {label: "CTA Image", value: "cta-image"},
];

const getClassNames = (attributes = {}, styleData) => {

    return [
        selector,
        "w-fit",
        "inline-block",
    ].filter(Boolean).join(" ");
};

registerBlockType(metadata.name, {
    apiVersion: 3,

    attributes: {
        ...metadata.attributes,
        ...STYLE_ATTRIBUTES,
        "wpbs-term-content": {
            type: "object",
            default: {},
        },
    },

    edit: withStyle((props) => {
        const {attributes, setAttributes} = props;

        const settings = attributes["wpbs-term-content"] ?? {};

        const updateSettings = useCallback((patch) => {
            setAttributes({
                "wpbs-term-content": {
                    ...settings,
                    ...patch,
                },
            });
        }, [settings, setAttributes]);

        const label = useMemo(() => {
            return CONTENT_OPTIONS.find(item => item.value === settings?.type)?.label ?? "Term Content";
        }, [settings?.type]);

        const cssProps = useMemo(() => {
            return Object.fromEntries(
                Object.entries({
                    "--line-clamp": settings?.["line-clamp"] ?? null,
                }).filter(([k, v]) => v !== null && v !== undefined)
            );
        }, [settings?.["line-clamp"]]);

        return (
            <>
                <InspectorControls group="styles">
                    <PanelBody initialOpen title="Settings">
                        <Grid columns={1} columnGap={15} rowGap={20}>
                            <SelectControl
                                __nextHasNoMarginBottom
                                __next40pxDefaultSize
                                label="Type"
                                value={settings?.type ?? ""}
                                options={CONTENT_OPTIONS}
                                onChange={(val) => updateSettings({type: val})}
                            />

                            <Grid columns={2} columnGap={15} rowGap={20}>
                                <NumberControl
                                    __nextHasNoMarginBottom
                                    __next40pxDefaultSize
                                    label="Line Clamp"
                                    value={settings?.["line-clamp"]}
                                    onChange={(val) => updateSettings({"line-clamp": val})}
                                />

                                <SelectControl
                                    __nextHasNoMarginBottom
                                    __next40pxDefaultSize
                                    label="Resolution"
                                    value={settings?.resolution ?? ""}
                                    options={RESOLUTION_OPTIONS}
                                    onChange={(val) => updateSettings({resolution: val})}
                                />
                            </Grid>

                            <ToggleControl
                                __nextHasNoMarginBottom
                                label="Eager"
                                checked={!!settings?.eager}
                                onChange={(val) => updateSettings({eager: val})}
                            />
                        </Grid>
                    </PanelBody>
                </InspectorControls>

                <LinkPost
                    defaultValue={settings?.["link-post"]}
                    callback={(val) => updateSettings({"link-post": val})}
                />
                <BlockWrapper
                    props={props}
                    className={getClassNames(attributes)}
                >
                    {label}
                </BlockWrapper>
            </>
        );
    }, {
        hasBackground: false,
        hasChildren: false,
    }),

    save: withStyleSave((props) => {
        const {attributes, BlockWrapper} = props;

        return (
            <BlockWrapper
                props={props}
                className={getClassNames(attributes)}
            />
        );
    }, {
        hasBackground: false,
        hasChildren: false,
    }),
});
