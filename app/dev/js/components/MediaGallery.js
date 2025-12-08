import { useCallback, useEffect, useMemo } from "@wordpress/element";
import {
    __experimentalGrid as Grid,
    __experimentalNumberControl as NumberControl,
    SelectControl,
    TextControl,
    ToggleControl,
} from "@wordpress/components";
import { useSelect } from "@wordpress/data";
import { RESOLUTION_OPTIONS } from "Includes/config";
import { normalizeMedia, getImageUrlForResolution } from "Includes/helper";

export const MEDIA_GALLERY_ATTRIBUTES = {
    "wpbs-media-gallery": {
        type: "object",
        default: {
            gallery_id: undefined,
            lightbox: false,
            page_size: undefined,
            video_first: false,
            resolution: "large",
            button_label: "Load More",
            eager: false,
        },
    },
};

export function MediaGalleryControls({ attributes = {}, setAttributes }) {
    const { "wpbs-media-gallery": settings } = attributes;

    const galleries = useSelect(
        (select) =>
            select("core").getEntityRecords("postType", "media-gallery", {
                per_page: -1,
            }),
        []
    );

    const selectedGallery = useSelect(
        (select) => {
            if (!settings.gallery_id || settings.gallery_id === "current") return null;
            return select("core").getEntityRecord(
                "postType",
                "media-gallery",
                parseInt(settings.gallery_id, 10)
            );
        },
        [settings.gallery_id]
    );

    // Normalize gallery media
    const buildMediaArray = useCallback(() => {
        if (!selectedGallery) return [];

        const wpbsData = selectedGallery?.acf?.wpbs || {};
        const images = (wpbsData.images || []).map((img) => ({
            type: "image",
            image: normalizeMedia(img),
            video: null,
            resolution: settings.resolution || "large",
            isEager: !!settings.eager,
            lightbox: !!settings.lightbox,
        }));

        const videos = (wpbsData.video || []).map((item) => {
            const videoClone = item.video_clone || {};
            return {
                type: "video",
                image: null,
                video: {
                    id: null,
                    source: videoClone.link || null,
                    mime: "video/mp4", // assume mp4 by default; could extend for platform
                    poster: videoClone.poster ? normalizeMedia(videoClone.poster) : null,
                    title: videoClone.title || null,
                    description: videoClone.description || null,
                    platform: videoClone.platform || "youtube",
                },
                resolution: settings.resolution || "large",
                isEager: !!settings.eager,
                lightbox: !!settings.lightbox,
            };
        });

        return settings.video_first ? [...videos, ...images] : [...images, ...videos];
    }, [selectedGallery, settings]);

    const updateSettings = useCallback(
        (newValue) => {
            const merged = {
                ...attributes["wpbs-media-gallery"],
                ...newValue,
            };

            const mediaArray = buildMediaArray();

            setAttributes({
                "wpbs-media-gallery": merged,
                "wpbs-query": mediaArray,
            });
        },
        [setAttributes, attributes, buildMediaArray]
    );

    // Rebuild media array whenever gallery or settings change
    useEffect(() => {
        updateSettings({});
    }, [settings.gallery_id, settings.video_first, settings.resolution, settings.eager, settings.lightbox]);

    return (
        <Grid columns={1} columnGap={15} rowGap={20}>
            <SelectControl
                label="Select Gallery"
                value={settings?.gallery_id ?? ""}
                options={[
                    { label: "Select a gallery", value: "" },
                    { label: "Current", value: "current" },
                    ...(galleries || []).map((post) => ({
                        label: post.title.rendered,
                        value: String(post.id),
                    })),
                ]}
                onChange={(value) => updateSettings({ gallery_id: value })}
            />

            <Grid columns={2} columnGap={15} rowGap={20}>
                <NumberControl
                    label="Page Size"
                    min={1}
                    isShiftStepEnabled={false}
                    onChange={(value) => updateSettings({ page_size: value })}
                    value={settings?.page_size}
                />
                <TextControl
                    label="Button Label"
                    onChange={(value) => updateSettings({ button_label: value })}
                    value={settings?.button_label}
                />
                <SelectControl
                    label="Resolution"
                    options={RESOLUTION_OPTIONS}
                    onChange={(value) => updateSettings({ resolution: value })}
                    value={settings?.resolution}
                />
            </Grid>

            <Grid columns={2} columnGap={15} rowGap={20} style={{ marginTop: "10px" }}>
                <ToggleControl
                    label="Lightbox"
                    checked={!!settings?.lightbox}
                    onChange={(value) => updateSettings({ lightbox: value })}
                />
                <ToggleControl
                    label="Video First"
                    checked={!!settings?.video_first}
                    onChange={(value) => updateSettings({ video_first: value })}
                />
                <ToggleControl
                    label="Eager"
                    checked={!!settings?.eager}
                    onChange={(value) => updateSettings({ eager: value })}
                />
            </Grid>
        </Grid>
    );
}