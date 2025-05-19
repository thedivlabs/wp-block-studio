import { addFilter } from '@wordpress/hooks';

const globalBlockSettings = ( settings, name ) => {

    if ( ! name.startsWith( 'wpbs/' ) ) {
        return settings;
    }

    settings.attributes = {
        ...settings.attributes,
        preloadImages: {
            type: 'array',
            default: [],
            items: {
                type: 'number',
            },
        },
    };

    return settings;
};

addFilter(
    'blocks.registerBlockType',
    'wpbs/global-block-settings',
    globalBlockSettings
);
