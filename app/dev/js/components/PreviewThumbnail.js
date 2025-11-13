import {Button, Icon} from '@wordpress/components';
import {IMAGE_BUTTON_STYLE} from 'Includes/config';
import {useResolvedMedia} from 'Includes/helper';

function getPreviewSrc(media) {
    if (!media) return null;

    // Direct fallback
    const fallback = media.source_url || null;

    const sizes = media.media_details?.sizes;
    if (!sizes) return fallback;

    // Collect candidates except thumbnail
    const candidates = Object.entries(sizes)
        .filter(([key, size]) => key !== 'thumbnail' && size?.width)
        .map(([key, size]) => ({
            key,
            width: Number(size.width) || Infinity,
            url: size.source_url
        }))
        .filter(item => !!item.url);

    if (!candidates.length) return fallback;

    // Sort by ascending width and pick smallest
    candidates.sort((a, b) => a.width - b.width);

    return candidates[0].url || fallback;
}


function PreviewThumbnail({image = {}, callback, style = {}, onClick, type = 'image'}) {
    const media = useResolvedMedia(image?.id);

    const src = getPreviewSrc(media);
    const hasUrl = !!src;


    const isVideo = type === 'video';

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

    if (!hasUrl) {
        return (
            <Button
                onClick={onClick}
                style={emptyStyle}
                variant="secondary"
            >
                Choose {isVideo ? 'Video' : 'Image'}
            </Button>
        );
    }

    const thumb = isVideo ? (
        <video preload="metadata" style={thumbnailStyle}>
            <source src={src} type={media.mime_type}/>
        </video>
    ) : (
        <img src={src} alt="" style={thumbnailStyle}/>
    );


    // Thumbnail that clears on click — your desired behavior
    return (
        <div
            style={{
                width: '100%',
                display: 'flex',
                position: 'relative',
                cursor: 'pointer',
                aspectRatio: '16/9',
                overflow: 'hidden',
                borderRadius: '4px',
                ...style,
            }}
            onClick={() => callback?.(image)} // <-- keep your clear behavior
        >
            {thumb}

            <Button
                icon={<Icon icon="no-alt"/>}
                style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    zIndex: 10,
                    padding: 0,
                    width: '26px',
                    height: '26px',
                    pointerEvents: 'none', // decorative as you intended
                    backgroundColor: 'rgba(0,0,0,.7)',
                    color: 'white',
                    borderRadius: '4px',
                }}
            />
        </div>
    );
}

export default PreviewThumbnail;
