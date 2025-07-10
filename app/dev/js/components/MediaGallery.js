import React, {useCallback, useEffect, useMemo, useState} from "react";


import {
    __experimentalGrid as Grid,
    __experimentalNumberControl as NumberControl,
    SelectControl, TextControl, ToggleControl,
} from "@wordpress/components";

import {useSelect} from "@wordpress/data";

export const MEDIA_GALLERY_ATTRIBUTES = {
    'wpbs-media-gallery': {
        type: 'object',
        default: {
            gallery_id: undefined,
            lightbox: undefined,
            page_size: undefined,
            video_first: undefined,
        }
    }
};

function cleanResult(obj) {
    if (Array.isArray(obj)) {
        return obj
            .map(cleanResult)
            .filter(v => v != null && v !== '' && !(typeof v === 'object' && !Array.isArray(v) && !Object.keys(v).length));
    }

    if (typeof obj === 'object' && obj !== null) {
        return Object.fromEntries(
            Object.entries(obj)
                .map(([k, v]) => [k, cleanResult(v)])
                .filter(([_, v]) =>
                    v != null &&
                    v !== '' &&
                    !(Array.isArray(v) && v.length === 0) &&
                    !(typeof v === 'object' && Object.keys(v).length === 0)
                )
        );
    }

    return obj;
}


export function MediaGalleryControls({attributes = {}, setAttributes}) {

    const {'wpbs-media-gallery': settings} = attributes;

    const galleries = useSelect((select) => {
        return select('core').getEntityRecords('postType', 'media-gallery', {per_page: -1});
    }, []);

    const gallerySettings = useMemo(() => {
        const isSlider = (attributes?.className ?? '')?.includes('is-style-slider');

        return cleanResult({
            grid: attributes?.['wpbs-grid'],
            slider: attributes?.['wpbs-slider'],
            query: attributes?.['wpbs-query'],
            settings: {
                ...attributes?.['wpbs-media-gallery'],
                is_slider: isSlider,
            },
        })
    }, [attributes?.['wpbs-media-gallery'], attributes?.['wpbs-grid'], attributes?.['wpbs-slider'], attributes?.['wpbs-query'], attributes?.className]);

    const updateSettings = useCallback((newValue) => {
        setAttributes((prevAttrs) => {
            return {
                ...prevAttrs,
                'wpbs-media-gallery': {
                    ...prevAttrs['wpbs-media-gallery'],
                    ...newValue,
                },
                'wpbs-media-gallery-settings': gallerySettings,
            };
        });
    }, [setAttributes, gallerySettings]);


    return (
        <Grid columns={1} columnGap={15} rowGap={20}>
            <SelectControl
                label="Select Gallery"
                value={settings?.['gallery_id'] ?? ''}
                options={[
                    {label: 'Select a gallery', value: ''},
                    ...(galleries || []).map(post => ({
                        label: post.title.rendered,
                        value: String(post.id)
                    }))
                ]}
                onChange={(newValue) => updateSettings({'gallery_id': newValue})}
            />
            <Grid columns={2} columnGap={15} rowGap={20}>
                <NumberControl
                    label={'Page Size'}
                    __next40pxDefaultSize
                    min={1}
                    isShiftStepEnabled={false}
                    onChange={(newValue) => updateSettings({'page_size': newValue})}
                    value={settings?.['page_size']}
                />
                <TextControl
                    label={'Button Label'}
                    __next40pxDefaultSize
                    onChange={(newValue) => updateSettings({'button_label': newValue})}
                    value={settings?.['button_label']}
                />
            </Grid>
            <Grid columns={2} columnGap={15} rowGap={20} style={{marginTop: '10px'}}>
                <ToggleControl
                    label={'Lightbox'}
                    checked={!!settings?.['lightbox']}
                    onChange={(newValue) => updateSettings({'lightbox': newValue})}
                    className={'flex items-center'}
                    __nextHasNoMarginBottom
                />
                <ToggleControl
                    label={'Video First'}
                    checked={!!settings?.['video_first']}
                    onChange={(newValue) => updateSettings({'video_first': newValue})}
                    className={'flex items-center'}
                    __nextHasNoMarginBottom
                />
            </Grid>
        </Grid>
    );
}