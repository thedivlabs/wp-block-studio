import {Button, Icon} from '@wordpress/components';
import {IMAGE_BUTTON_STYLE} from 'Includes/config';
import {useResolvedMedia} from 'Includes/helper';

function PreviewThumbnail({image = {}, callback, style = {}, onClick, type = 'image'}) {
    const media = useResolvedMedia(image?.id);

    const hasUrl = !!media?.url;

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
            <source src={media.url} type="video/mp4"/>
        </video>
    ) : (
        <img src={media.url} alt="" style={thumbnailStyle}/>
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
