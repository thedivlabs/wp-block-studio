import {Button} from '@wordpress/components'

function PreviewThumbnail({image = {}, callback}) {

    return (
        <div style={{
            width: '100%',
            display: 'flex',
            backgroundColor: '#efefef',
            borderRadius: '4px',
            padding: '5px',
            position: 'relative',
            cursor: 'pointer'
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
                     objectFit: 'cover',
                     borderRadius: '4px',
                     aspectRatio: '16/9',
                     pointerEvents: 'none'
                 }}/>
            <Button
                icon={'no-alt'}
                style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
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