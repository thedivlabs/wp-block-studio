import React, {useCallback, useEffect, useMemo, useState} from "react";


import {
    __experimentalGrid as Grid,
    __experimentalNumberControl as NumberControl,
    SelectControl, TextControl, ToggleControl,
} from "@wordpress/components";

import {useSelect} from "@wordpress/data";
import {RESOLUTION_OPTIONS} from "Includes/config";

export const MEDIA_GALLERY_ATTRIBUTES = {
    'wpbs-media-gallery': {
        type: 'object',
        default: {
            gallery_id: undefined,
            lightbox: false,
            page_size: undefined,
            video_first: false,
        }
    }
};


export function MediaGalleryControls({attributes = {}, setAttributes}) {

    const {'wpbs-media-gallery': settings} = attributes;

    const galleries = useSelect((select) => {
        return select('core').getEntityRecords('postType', 'media-gallery', {per_page: -1});
    }, []);


    const updateSettings = useCallback((newValue) => {

        const result = {
            ...attributes['wpbs-media-gallery'],
            ...newValue,
        }

        setAttributes({
            'wpbs-media-gallery': result,
        });
        
    }, [setAttributes, attributes['wpbs-media-gallery']]);

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
                <SelectControl
                    label={'Resolution'}
                    options={RESOLUTION_OPTIONS}
                    onChange={(newValue) => updateSettings({'resolution': newValue})}
                    value={settings?.['resolution']}
                    __next40pxDefaultSize
                    __nextHasNoMarginBottom
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
                <ToggleControl
                    label={'Eager'}
                    checked={!!settings?.['eager']}
                    onChange={(newValue) => updateSettings({'eager': newValue})}
                    className={'flex items-center'}
                    __nextHasNoMarginBottom
                />
            </Grid>
        </Grid>
    );
}