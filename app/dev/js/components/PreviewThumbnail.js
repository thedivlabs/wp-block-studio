import {Button, Icon} from '@wordpress/components';
import {IMAGE_BUTTON_STYLE} from 'Includes/config';
import {useResolvedMedia} from "Includes/helper";

function PreviewThumbnail({image = {}, callback, style = {}, onClick}) {
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

    const imageObj = useResolvedMedia(image?.id);

    const isVideo = imageObj?.type === 'video';
    const hasUrl = !!imageObj?.url;

    const thumbnail = isVideo ? (
        <video preload="metadata" style={thumbnailStyle}>
            <source src={imageObj.url || '#'} type="video/mp4"/>
        </video>
    ) : (
        <img src={imageObj.url || '#'} alt="" style={thumbnailStyle}/>
    );

    // Empty state
    if (!hasUrl) {
        return (
            <Button
                onClick={onClick ?? (() => {
                })}
                style={emptyStyle}
                variant="secondary"
            >
                Choose {isVideo ? 'Video' : 'Image'}
            </Button>
        );
    }

    // Thumbnail state
    return (
        <div
            style={{
                width: '100%',
                display: 'flex',
                position: 'relative',
                cursor: 'pointer',
                aspectRatio: '16/9',
                overflow: 'hidden',
                objectFit: 'cover',
                borderRadius: '4px',
                ...style,
            }}
            onClick={() => callback?.(image)}
        >
            {thumbnail}
            <Button
                icon={<Icon icon="no-alt"/>}
                style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: '10',
                    padding: '0',
                    pointerEvents: 'none',
                    width: '26px',
                    height: '26px',
                    overflow: 'hidden',
                    lineHeight: '26px',
                    textAlign: 'center',
                    backgroundColor: 'rgba(0,0,0,.7)',
                    color: 'white',
                    minWidth: '0',
                    minHeight: '0',
                    borderRadius: '4px',
                }}
            />
        </div>
    );
}

export default PreviewThumbnail;