import { Button, Icon } from '@wordpress/components';
import { IMAGE_BUTTON_STYLE } from 'Includes/config';
import { getImageUrlForResolution } from 'Includes/helper';

function PreviewThumbnail({
                              image = null,        // { id, source, sizes }
                              type = "image",      // "image" | "video"
                              resolution = "large",
                              onClick,             // open media modal
                              callback,            // clear field
                              style = {}
                          }) {
    const isVideo = type === "video";

    // Determine if we have a usable selection
    const src = image?.id ? getImageUrlForResolution(image, resolution) : null;
    const hasSelection = !!src;

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
        textAlign: "center"
    };

    /* ---------------- Empty State: click opens modal ---------------- */
    if (!hasSelection) {
        return (
            <Button
                onClick={onClick}
                style={emptyStyle}
                variant="secondary"
            >
                Choose {isVideo ? "Video" : "Image"}
            </Button>
        );
    }

    /* ---------------- Selected State: click clears field ---------------- */
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
                width: "100%",
                position: "relative",
                cursor: "pointer",
                aspectRatio: "16/9",
                overflow: "hidden",
                borderRadius: "4px",
                display: "flex",
                ...style
            }}
            onClick={() => callback(null)} // CLEAR
        >
            {thumb}

            <Button
                icon={<Icon icon="no-alt" />}
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