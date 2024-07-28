import {Button, Icon} from '@wordpress/components'

function PreviewThumbnail({image = {}, callback}) {

    return (
        <div style={{
            width: '100%',
            display: 'flex',
            position: 'relative',
            cursor: 'pointer',
            aspectRatio: '16/9',
            overflow: 'hidden',
        }}
             onClick={() => {
                 if (callback) {
                     callback(image);
                 }
             }}
        >
            <img src={image.url || '#'}
                 alt={''}
                 style={{
                     cursor: 'pointer',
                     width: '100%',
                     height: '100%',
                     objectFit: 'cover',
                     borderRadius: '4px',
                     pointerEvents: 'none'
                 }}/>
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