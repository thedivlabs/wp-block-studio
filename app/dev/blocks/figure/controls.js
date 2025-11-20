import {InspectorControls} from "@wordpress/block-editor";
import {PanelBody, __experimentalGrid as Grid} from "@wordpress/components";
import {Field} from "Components/Field";
import {BLEND_OPTIONS, ORIGIN_OPTIONS, RESOLUTION_OPTIONS} from "Includes/config";
import Link from "Components/Link";

// MAP #1: image-related settings
const FIGURE_IMAGE_FIELDS = [
    {slug: "imageMobile", type: "image", label: "Mobile Image"},
    {slug: "imageLarge", type: "image", label: "Large Image"},
    {slug: "breakpoint", type: "breakpoint", label: "Breakpoint", full: true},

    {slug: "resolutionLarge", type: "select", label: "Size Large", options: RESOLUTION_OPTIONS},
    {slug: "resolutionMobile", type: "select", label: "Size Mobile", options: RESOLUTION_OPTIONS},
];

const FIGURE_SETTING_FIELDS = [
    {slug: "blend", type: "select", label: "Blend", options: BLEND_OPTIONS},
    {slug: "origin", type: "select", label: "Origin", options: ORIGIN_OPTIONS},
    {slug: "overlay", type: "gradient", label: "Overlay", full: true},

    {slug: "eager", type: "toggle", label: "Eager"},
    {slug: "contain", type: "toggle", label: "Contain"},
];

export function FigureInspector({attributes, updateSettings}) {
    const settings = attributes["wpbs-figure"] || {};

    const sharedConfig = {
        isToolsPanel: false,
    };

    return (
        <>
            <Link defaultValue={settings?.link} callback={(val) => updateSettings({link: val})}/>

            <InspectorControls group="styles">
                <PanelBody initialOpen={true} className="wpbs-block-controls"
                           style={{paddingTop: 0, paddingBottom: 0, border: 'none'}}>

                    <Grid columns={2} columnGap={15} rowGap={20}>

                        {/** TYPE FIELD – standalone */}
                        <Field
                            field={{
                                slug: "type",
                                type: "select",
                                label: "Type",
                                options: [
                                    {label: "Select", value: ""},
                                    {label: "Image", value: "image"},
                                    {label: "Featured Image", value: "featured-image"},
                                    {label: "Lottie", value: "lottie"},
                                    {label: "Icon", value: "icon"},
                                ],
                                full: true
                            }}
                            settings={settings}
                            callback={(val) => updateSettings({type: val})}
                            {...sharedConfig}
                        />

                        {/** MAP #1 — IMAGE + BREAKPOINT + RESOLUTIONS */}
                        {(settings.type === "image" || settings.type === "featured-image") &&
                            FIGURE_IMAGE_FIELDS.map((field) => (
                                <Field
                                    key={field.slug}
                                    field={field}
                                    settings={settings}
                                    callback={(val) => updateSettings({[field.slug]: val})}
                                    {...sharedConfig}
                                />
                            ))}

                        {/** MAP #2 — STYLE + TOGGLES */}
                        {settings.type && FIGURE_SETTING_FIELDS.map((field) => (
                            <Field
                                key={field.slug}
                                field={field}
                                settings={settings}
                                callback={(val) => updateSettings({[field.slug]: val})}
                                {...sharedConfig}
                            />
                        ))}

                    </Grid>

                </PanelBody>
            </InspectorControls>
        </>
    );
}