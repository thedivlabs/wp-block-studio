import {Button} from '@wordpress/components'

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
                    top: '5px',
                    right: '5px',
                    zIndex: '10',
                    width: '20px',
                    height: '20px',
                    lineHeight: '20px',
                    borderRadius: '20px',
                    backgroundColor: 'white',
                    color: 'black',
                    fontSize: '14px',
                    overflow: 'hidden',
                    padding: '0',
                    margin: '0',
                    textAlign: 'center',
                    justifyContent: 'center',
                    minWidth: '0',
                    pointerEvents: 'none'
                }}></Button>
        </div>
    )
}

export default PreviewThumbnail