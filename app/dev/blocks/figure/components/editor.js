import {InspectorControls} from "@wordpress/block-editor";
import {PanelBody, __experimentalGrid as Grid} from "@wordpress/components";
import {Field} from "Components/Field";
import {BLEND_OPTIONS, ORIGIN_OPTIONS, RESOLUTION_OPTIONS} from "Includes/config";

const FIGURE_FIELDS = [
    {
        slug: "type", type: "select", label: "Type", options: [
            {label: "Select", value: ""},
            {label: "Image", value: "image"},
            {label: "Featured Image", value: "featured-image"},
            {label: "Lottie", value: "lottie"},
            {label: "Icon", value: "icon"},
            {label: "Video", value: "video"},
        ]
    },

    // images
    {slug: "imageMobile", type: "image", label: "Mobile Image"},
    {slug: "imageLarge", type: "image", label: "Large Image"},
    {slug: "breakpoint", type: "select", label: "Breakpoint", full: true},

    // resolutions
    {slug: "resolutionLarge", type: "select", label: "Size Large", options: RESOLUTION_OPTIONS},
    {slug: "resolutionMobile", type: "select", label: "Size Mobile", options: RESOLUTION_OPTIONS},

    // visual fields
    {slug: "blend", type: "select", label: "Blend", options: BLEND_OPTIONS},
    {slug: "origin", type: "select", label: "Origin", options: ORIGIN_OPTIONS},
    {slug: "overlay", type: "gradient", label: "Overlay", full: true},

    // video
    {slug: "video", type: "video", label: "Video", full: true},

    // toggles
    {slug: "eager", type: "toggle", label: "Eager"},
    {slug: "force", type: "toggle", label: "Force"},
    {slug: "contain", type: "toggle", label: "Contain"},
];

export function FigureInspector({attributes, updateSettings}) {
    const settings = attributes["wpbs-figure"] || {};

    const breakpoints = window.WPBS?.settings?.breakpoints ?? {};
    console.log(breakpoints);


    const sharedConfig = {
        isToolsPanel: false
    }

    const ControlFields = <>
        <Grid columns={2} columnGap={15} rowGap={20}>
            {/* IMAGE + FEATURED IMAGE */}
            {(settings.type === "image" || settings.type === "featured-image") && (
                <>
                    <Field
                        field={FIGURE_FIELDS.find(f => f.slug === "imageMobile")}
                        settings={settings}
                        callback={(val) => updateSettings({imageMobile: val})}
                        {...sharedConfig}
                    />
                    <Field
                        field={FIGURE_FIELDS.find(f => f.slug === "imageLarge")}
                        settings={settings}
                        callback={(val) => updateSettings({imageLarge: val})}
                        {...sharedConfig}
                    />

                    <Field
                        field={FIGURE_FIELDS.find(f => f.slug === "blend")}
                        settings={settings}
                        callback={(val) => updateSettings({blend: val})}
                        {...sharedConfig}
                    />
                    <Field
                        field={FIGURE_FIELDS.find(f => f.slug === "origin")}
                        settings={settings}
                        callback={(val) => updateSettings({origin: val})}
                        {...sharedConfig}
                    />

                    <Field
                        field={FIGURE_FIELDS.find(f => f.slug === "resolutionLarge")}
                        settings={settings}
                        callback={(val) => updateSettings({resolutionLarge: val})}
                        {...sharedConfig}
                    />
                    <Field
                        field={FIGURE_FIELDS.find(f => f.slug === "resolutionMobile")}
                        settings={settings}
                        callback={(val) => updateSettings({resolutionMobile: val})}
                        {...sharedConfig}
                    />

                    <Field
                        field={FIGURE_FIELDS.find(f => f.slug === "breakpoint")}
                        settings={settings}
                        callback={(val) => updateSettings({blend: val})}
                        {...sharedConfig}
                    />
                </>
            )}

            {/* VIDEO */}
            {settings.type === "video" && (
                <Field
                    field={FIGURE_FIELDS.find(f => f.slug === "video")}
                    settings={settings}
                    callback={(val) => updateSettings({video: val})}
                    {...sharedConfig}
                />
            )}

            <Field
                field={FIGURE_FIELDS.find(f => f.slug === "overlay")}
                settings={settings}
                callback={(val) => updateSettings({overlay: val})}
                {...sharedConfig}
            />
        </Grid>
        <Grid columns={2} columnGap={15} rowGap={20}>
            <Field
                field={FIGURE_FIELDS.find(f => f.slug === "eager")}
                settings={settings}
                callback={(val) => updateSettings({eager: val})}
                {...sharedConfig}
            />
            <Field
                field={FIGURE_FIELDS.find(f => f.slug === "force")}
                settings={settings}
                callback={(val) => updateSettings({force: val})}
                {...sharedConfig}
            />
            <Field
                field={FIGURE_FIELDS.find(f => f.slug === "contain")}
                settings={settings}
                callback={(val) => updateSettings({contain: val})}
                {...sharedConfig}
            />
        </Grid>
    </>;

    return (
        <InspectorControls group="styles">
            <PanelBody initialOpen={true}>
                {/* Type selector alone */}
                <Grid columns={1} columnGap={15} rowGap={20}>
                    <Field
                        field={FIGURE_FIELDS.find(f => f.slug === "type")}
                        settings={settings}
                        callback={(val) => updateSettings({type: val})}
                        {...sharedConfig}
                    />
                    {settings.type && ControlFields}

                </Grid>
            </PanelBody>
        </InspectorControls>
    );
}
