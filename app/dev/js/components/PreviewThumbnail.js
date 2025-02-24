import {Button, Icon} from '@wordpress/components'

function PreviewThumbnail({image = {}, callback, style = {}}) {

    const thumbnailStyle = {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        borderRadius: '4px',
        pointerEvents: 'none',
    }

    let thumbnail;

    if ('video' === image.type) {
        thumbnail = <video preload={'metadata'} style={thumbnailStyle}>
            <source src={image.url || '#'}
                    type={'video/mp4'}
            />
        </video>
    } else {
        thumbnail = <img src={image.url || '#'}
                         alt={''}
                         style={thumbnailStyle}/>
    }

    return (
        <div style={{
            width: '100%',
            display: 'flex',
            position: 'relative',
            cursor: 'pointer',
            aspectRatio: '16/9',
            overflow: 'hidden',
            ...style,
        }}
             onClick={() => {
                 if (callback) {
                     callback(image);
                 }
             }}
        >
            {thumbnail}
            <Button
                icon={'no-alt'}
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
                    borderRadius: '4px'
                }}>
            </Button>
        </div>
    )
}

export default PreviewThumbnail