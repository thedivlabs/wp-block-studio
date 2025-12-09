import {useCallback, useEffect, useMemo, useState} from "@wordpress/element";
import {
    __experimentalGrid as Grid,
    __experimentalNumberControl as NumberControl,
    SelectControl,
    TextControl,
    ToggleControl,
} from "@wordpress/components";
import {useSelect} from "@wordpress/data";
import {RESOLUTION_OPTIONS} from "Includes/config";
import {normalizeMedia, normalizeVideo} from "Includes/helper";
import {isEqual} from "lodash";


export function MediaGalleryControls({settings = {}, setAttributes, callback}) {
    const [localSettings, setLocalSettings] = useState({...settings});

    // Load all galleries
    const galleries = useSelect(
        (select) =>
            select("core").getEntityRecords("postType", "media-gallery", {
                per_page: -1,
            }),
        []
    );

    const updateSettings = useCallback(
        (newValue) => {
            const merged = {...settings, ...newValue};

            if (isEqual(merged, settings)) return;

            setLocalSettings(merged);

            callback(merged);

            setAttributes({
                "wpbs-query": merged
            });
        },
        [settings, setAttributes, setLocalSettings]
    );


    return (
        <Grid columns={1} columnGap={15} rowGap={20}>
            <SelectControl
                label="Select Gallery"
                value={localSettings?.gallery_id ?? ""}
                options={[
                    {label: "Select a gallery", value: ""},
                    {label: "Current", value: "current"},
                    ...(galleries || []).map((post) => ({
                        label: post.title.rendered,
                        value: String(post.id),
                    })),
                ]}
                onChange={(value) => updateSettings({gallery_id: value})}
                __next40pxDefaultSize
                __nextHasNoMarginBottom
            />

            <Grid columns={2} columnGap={15} rowGap={20}>
                <NumberControl
                    label="Page Size"
                    min={1}
                    isShiftStepEnabled={false}
                    value={localSettings?.page_size}
                    onChange={(value) => updateSettings({page_size: value})}
                    __next40pxDefaultSize
                    __nextHasNoMarginBottom
                />
                <TextControl
                    label="Button Label"
                    value={localSettings?.button_label}
                    onChange={(value) => updateSettings({button_label: value})}
                    __next40pxDefaultSize
                    __nextHasNoMarginBottom
                />
                <SelectControl
                    label="Resolution"
                    value={localSettings?.resolution}
                    options={RESOLUTION_OPTIONS}
                    onChange={(value) => updateSettings({resolution: value})}
                    __next40pxDefaultSize
                    __nextHasNoMarginBottom
                />
            </Grid>

            <Grid columns={2} columnGap={15} rowGap={20} style={{marginTop: "10px"}}>
                <ToggleControl
                    label="Lightbox"
                    checked={!!localSettings?.lightbox}
                    onChange={(value) => updateSettings({lightbox: value})}
                />
                <ToggleControl
                    label="Video First"
                    checked={!!localSettings?.video_first}
                    onChange={(value) => updateSettings({video_first: value})}
                />
                <ToggleControl
                    label="Eager"
                    checked={!!localSettings?.eager}
                    onChange={(value) => updateSettings({eager: value})}
                />
            </Grid>
        </Grid>
    );
}
