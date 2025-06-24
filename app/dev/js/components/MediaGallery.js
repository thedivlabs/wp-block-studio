import React, {useCallback, useEffect, useState} from "react";


import {
    __experimentalGrid as Grid,
    __experimentalNumberControl as NumberControl,
    SelectControl, ToggleControl,
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


export function MediaGalleryControls({attributes = {}, setAttributes}) {

    const {'wpbs-media-gallery': settings} = attributes;

    const galleries = useSelect((select) => {
        return select('core').getEntityRecords('postType', 'media-gallery', {per_page: -1});
    }, []);

    const updateSettings = useCallback((newValue) => {

        const result = {
            ...attributes['wpbs-media-gallery'],
            ...newValue
        }

        setAttributes({'wpbs-media-gallery': result});

    }, [setAttributes, attributes]);

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