import {useCallback, useState, useEffect} from "@wordpress/element";
import {
    __experimentalGrid as Grid,
    __experimentalNumberControl as NumberControl,
    SelectControl,
    TextControl,
    ToggleControl,
} from "@wordpress/components";
import {useSelect} from "@wordpress/data";
import {RESOLUTION_OPTIONS} from "Includes/config";
import {isEqual} from "lodash";

export const GALLERY_ATTRIBUTES = {
    "wpbs-gallery": {type: "object", default: {}},
    "wpbs-query": {type: "object", default: {}},
};

export function MediaGalleryControls({attributes, setAttributes, enabled}) {
    const gallerySettings = attributes?.["wpbs-gallery"] || {};
    const [localSettings, setLocalSettings] = useState({...gallerySettings});

    const isEnabled = !!enabled;

    // Load gallery CPT items
    const galleries = useSelect(
        (select) =>
            select("core").getEntityRecords("postType", "media-gallery", {
                per_page: -1,
            }),
        []
    );

    const updateSettings = useCallback(
        (patch) => {
            const next = {...localSettings, ...patch};

            if (isEqual(next, localSettings)) return;

            setLocalSettings(next);

            // Save to both wpbs-gallery and wpbs-query
            setAttributes({
                "wpbs-gallery": next,
                "wpbs-query": next,
            });
        },
        [localSettings, setAttributes]
    );

    useEffect(() => {
        if (!isEnabled) return;

        if (!isEqual(attributes["wpbs-query"], localSettings)) {
            setAttributes({"wpbs-query": localSettings});
        }

    }, [isEnabled, localSettings, attributes["wpbs-query"]]);


    return (
        <Grid columns={1} columnGap={15} rowGap={20}>
            <SelectControl
                label="Select Gallery"
                value={localSettings.gallery_id ?? ""}
                options={[
                    {label: "Select a gallery", value: ""},
                    {label: "Current", value: "current"},
                    ...(galleries || []).map((post) => ({
                        label: post.title.rendered,
                        value: String(post.id),
                    })),
                ]}
                onChange={(v) => updateSettings({gallery_id: v})}
                __next40pxDefaultSize
                __nextHasNoMarginBottom
            />

            <Grid columns={2} columnGap={15} rowGap={20}>
                <NumberControl
                    label="Page Size"
                    min={1}
                    isShiftStepEnabled={false}
                    value={localSettings.page_size}
                    onChange={(v) => updateSettings({page_size: v})}
                    __next40pxDefaultSize
                    __nextHasNoMarginBottom
                />

                <TextControl
                    label="Button Label"
                    value={localSettings.button_label}
                    onChange={(v) => updateSettings({button_label: v})}
                    __next40pxDefaultSize
                    __nextHasNoMarginBottom
                />

                <SelectControl
                    label="Resolution"
                    value={localSettings.resolution}
                    options={RESOLUTION_OPTIONS}
                    onChange={(v) => updateSettings({resolution: v})}
                    __next40pxDefaultSize
                    __nextHasNoMarginBottom
                />
            </Grid>

            <Grid
                columns={2}
                columnGap={15}
                rowGap={20}
                style={{marginTop: "10px"}}
            >
                <ToggleControl
                    label="Lightbox"
                    checked={!!localSettings.lightbox}
                    onChange={(v) => updateSettings({lightbox: v})}
                />

                <ToggleControl
                    label="Video First"
                    checked={!!localSettings.video_first}
                    onChange={(v) => updateSettings({video_first: v})}
                />

                <ToggleControl
                    label="Eager"
                    checked={!!localSettings.eager}
                    onChange={(v) => updateSettings({eager: v})}
                />
            </Grid>
        </Grid>
    );
}
