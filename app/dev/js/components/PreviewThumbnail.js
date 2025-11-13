import {Button, Icon} from '@wordpress/components';
import {IMAGE_BUTTON_STYLE} from 'Includes/config';
import {getImageUrlForResolution} from 'Includes/helper';

function PreviewThumbnail({
                              image = {},         // { id, source, sizes }
                              callback,           // <-- callback(null) clears
                              style = {},
                              onClick,            // <-- open media modal
                              type = 'image',
                              resolution = 'large'
                          }) {
    const isVideo = type === 'video';
    const src = getImageUrlForResolution(image, resolution);
    const hasSelection = !!image?.id && !!src;

    const thumbnailStyle = {
        ...IMAGE_BUTTON_STYLE,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        pointerEvents: 'none',
    };

    const emptyStyle = {
        border: '1px dashed lightgray',
        width: '100%',
        height: 'auto',
        aspectRatio: '16/9',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
    };

    /* ---------------- Empty (no image) ---------------- */
    if (!hasSelection) {
        return (
            <Button
                onClick={onClick}   // open modal
                style={emptyStyle}
                variant="secondary"
            >
                Choose {isVideo ? 'Video' : 'Image'}
            </Button>
        );
    }

    /* ---------------- Thumbnail (click to CLEAR) ---------------- */
    const thumb = isVideo ? (
        <video preload="metadata" style={thumbnailStyle}>
            <source src={src} type="video/mp4" />
        </video>
    ) : (
        <img src={src} alt="" style={thumbnailStyle} />
    );

    return (
        <div
            style={{
                width: '100%',
                position: 'relative',
                cursor: 'pointer',
                aspectRatio: '16/9',
                overflow: 'hidden',
                borderRadius: '4px',
                display: 'flex',
                ...style,
            }}
            onClick={() => callback(null)} // <-- CLEAR FIELD
        >
            {thumb}

            {/* Decorative X icon in corner */}
            <Button
                icon={<Icon icon="no-alt" />}
                style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    zIndex: 10,
                    padding: 0,
                    width: '26px',
                    height: '26px',
                    pointerEvents: 'none', // don’t block clear click
                    backgroundColor: 'rgba(0,0,0,.7)',
                    color: 'white',
                    borderRadius: '4px',
                }}
            />
        </div>
    );
}

export default PreviewThumbnail;