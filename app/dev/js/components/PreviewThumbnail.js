import {Button, Icon} from '@wordpress/components';
import {IMAGE_BUTTON_STYLE} from 'Includes/config';
import {getImageUrlForResolution} from 'Includes/helper';

function PreviewThumbnail({
                              image = null,
                              type = "image",
                              resolution = "large",
                              onSelectClick,
                              callback,
                              style = {}
                          }) {
    const isVideo = type === "video";

    const src = image?.id ? getImageUrlForResolution(image, resolution) : null;
    const hasSelection = !!src;

    const isDisabled = image?.isPlaceholder === true;

    const thumbnailStyle = {
        ...IMAGE_BUTTON_STYLE,
        //pointerEvents: "none",
    };

    const emptyStyle = {
        ...IMAGE_BUTTON_STYLE,
        border: "1px dashed lightgray",
        padding: "8px",
    };

    const buttonStyle = {
        width: "100%",
        maxWidth: "100px",
        textAlign: "center",
        justifyContent: "center"
    }

    const imageStyle = {
        width: "100%",
        height: "100%",
        objectFit: "cover"
    }

    /* ------------------------------------------------------------- */
    /*  EMPTY OR DISABLED STATE                                      */
    /* ------------------------------------------------------------- */
    if (!hasSelection) {
        const toggleOff = () => {
            if (isDisabled) {
                callback(""); // enable
            } else {
                callback({
                    source: "#",
                    mime: "video/mp4",
                    isPlaceholder: true
                });
            }
        };

        return (
            <div style={emptyStyle}>
                <Button
                    onClick={onSelectClick}
                    variant={'primary'}
                    style={buttonStyle}
                >
                    Choose
                </Button>

                <Button
                    onClick={toggleOff}
                    variant={isDisabled ? "primary" : "secondary"}
                    style={buttonStyle}
                >
                    {isDisabled ? "Enable" : "Disable"}
                </Button>
            </div>
        );
    }

    /* ------------------------------------------------------------- */
    /* SELECTED THUMBNAIL                                            */
    /* ------------------------------------------------------------- */
    const thumb = isVideo ? (
        <video preload="metadata" style={imageStyle}>
            <source src={src} type="video/mp4"/>
        </video>
    ) : (
        <img src={src} alt="" style={imageStyle}/>
    );

    return (
        <div
            style={thumbnailStyle}
            onClick={() => callback("")}  // clicking thumbnail clears
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