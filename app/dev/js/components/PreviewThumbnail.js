import {Button, Icon} from '@wordpress/components';
import {IMAGE_BUTTON_STYLE} from 'Includes/config';
import {getImageUrlForResolution} from 'Includes/helper';

function PreviewThumbnail({
                              image = null,        // { id, source, sizes }
                              video = null,        // { id, source, sizes }
                              type = "image",      // "image" | "video"
                              resolution = "large",
                              onClick,             // open media modal
                              callback,            // clear or override field
                              style = {}
                          }) {
    const isVideo = type === "video";

    const src = image?.id ? getImageUrlForResolution(image, resolution) : null;
    const hasSelection = !!src;

    const isImageDisabled = image?.off === true;
    const isVideoDisabled = video?.off === true;
    const isDisabled =isVideoDisabled || isImageDisabled;

    const thumbnailStyle = {
        ...IMAGE_BUTTON_STYLE,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        pointerEvents: "none"
    };

    const emptyStyle = {
        border: "1px dashed lightgray",
        width: "100%",
        height: "auto",
        aspectRatio: "16/9",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "8px",
        textAlign: "center",
        flexDirection: "column"
    };

    /* ------------------------------------------------------------- */
    /* EMPTY STATE — now has TWO BUTTONS and NO thumbnail click      */
    /* ------------------------------------------------------------- */
    if (!hasSelection) {
        return (
            <div style={emptyStyle}>
                <Button
                    onClick={onClick}
                    variant="secondary"
                >
                    Choose {isVideo ? "Video" : "Image"}
                </Button>

                <Button
                    onClick={() => callback({off: true})}
                    variant="tertiary"
                    className={isDisabled ? 'active' : ''}
                >
                    Disable
                </Button>
            </div>
        );
    }

    /* ------------------------------------------------------------- */
    /* SELECTED STATE — clicking thumbnail now commits ""            */
    /* ------------------------------------------------------------- */
    const thumb = isVideo ? (
        <video preload="metadata" style={thumbnailStyle}>
            <source src={src} type="video/mp4"/>
        </video>
    ) : (
        <img src={src} alt="" style={thumbnailStyle}/>
    );

    return (
        <div
            style={{
                width: "100%",
                position: "relative",
                cursor: "pointer",
                aspectRatio: "16/9",
                overflow: "hidden",
                borderRadius: "4px",
                display: "flex",
                ...style
            }}
            onClick={() => callback("")}    // ← changed from null to ""
        >
            {thumb}

            <Button
                icon={<Icon icon="no-alt"/>}
                style={{
                    position: "absolute",
                    top: "4px",
                    right: "4px",
                    zIndex: 10,
                    padding: 0,
                    width: "26px",
                    height: "26px",
                    pointerEvents: "none",
                    backgroundColor: "rgba(0,0,0,.7)",
                    color: "white",
                    borderRadius: "4px"
                }}
            />
        </div>
    );
}

export default PreviewThumbnail;
