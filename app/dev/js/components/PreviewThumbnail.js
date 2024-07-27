function PreviewThumbnail({image = {}, callback}) {

    return (
        <img src={image.url || '#'}
             onClick={() => {
                 if (callback) {
                     callback(image);
                 }
             }}
             alt={''}
             style={{
                 cursor: 'pointer',
                 width: '60px',
                 objectFit: 'cover',
                 height: '60px'
             }}/>
    )
}

export default PreviewThumbnail