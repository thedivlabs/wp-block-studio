import React, {useCallback, useEffect, useState} from "react";


import {
    __experimentalGrid as Grid,
    __experimentalNumberControl as NumberControl,
    SelectControl,
} from "@wordpress/components";

import {useSelect} from "@wordpress/data";

export const MEDIA_GALLERY_ATTRIBUTES = {
    'wpbs-media-gallery': {
        type: 'object',
        default: {}
    }
};


export function MediaGalleryControls({attributes = {}, setAttributes}) {
    const [settings, setSettings] = useState(() => attributes['wpbs-media-gallery'] || {});

    useEffect(() => {
        setAttributes({'wpbs-media-gallery': settings});
    }, [settings]);

    const galleries = useSelect((select) => {
        return select('core').getEntityRecords('postType', 'media-gallery', {per_page: -1});
    }, []);

    const updateSettings = useCallback((newValue) => {
        setSettings((prev) => ({
            ...prev,
            ...newValue,
        }));
    }, []);

    return (
        <Grid columns={1} columnGap={15} rowGap={20}>
            <SelectControl
                label="Select Gallery"
                value={settings?.['gallery-id'] ?? ''}
                options={[
                    {label: 'Select a gallery', value: ''},
                    ...(galleries || []).map(post => ({
                        label: post.title.rendered,
                        value: String(post.id)
                    }))
                ]}
                onChange={(newValue) => updateSettings({'gallery-id': newValue})}
            />
            <Grid columns={2} columnGap={15} rowGap={20}>
                <NumberControl
                    label={'Page Size'}
                    __next40pxDefaultSize
                    min={1}
                    isShiftStepEnabled={false}
                    onChange={(newValue) => updateSettings({'page-size': newValue})}
                    value={settings?.['page-size']}
                />
            </Grid>
        </Grid>
    );
}