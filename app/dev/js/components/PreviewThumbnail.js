import {Button, Icon} from '@wordpress/components';
import {IMAGE_BUTTON_STYLE} from 'Includes/config';
import {getImageUrlForResolution} from 'Includes/helper';

function PreviewThumbnail({
                              image = null,
                              resolution = "large",
                              onSelectClick,
                              callback,      // must receive raw media object
                              style = {}
                          }) {

    const isVideoType = image?.type === "video";

    //
    // FIX: send RAW values, never wrapped
    //
    const clearValue = () => {
        callback(null);     // not { media:"" }
    };

    const setPlaceholder = () => {
        callback({
            id: null,
            source: "#",
            type: null,
            width: null,
            height: null,
            sizes: null,
            isPlaceholder: true,
        });
    };

    const enableFromPlaceholder = () => {
        clearValue(); // restores normal selector
    };

    const isPlaceholder = image?.isPlaceholder === true;
    const hasRealMedia = !!(image?.id && !isPlaceholder);

    const src = hasRealMedia
        ? getImageUrlForResolution(image, resolution)
        : null;

    const hasSelection = !!src;

    const thumbnailStyle = {
        ...IMAGE_BUTTON_STYLE,
        ...style,
        position: "relative",
        cursor: "pointer"
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
        justifyContent: "center",
    };

    const buttonDisabledStyle = {
        backgroundColor: "var(--wp--preset--color--vivid-red)",
        borderColor: "var(--wp--preset--color--vivid-red)",
    };

    const imageStyle = {
        width: "100%",
        height: "100%",
        objectFit: "cover",
    };

    //
    // EMPTY STATE (no selected media)
    //
    if (!hasSelection) {
        const toggleDisabled = () => {
            if (isPlaceholder) {
                enableFromPlaceholder();
            } else {
                setPlaceholder();
            }
        };

        return (
            <div style={emptyStyle}>
                <Button
                    onClick={onSelectClick}
                    variant="primary"
                    style={buttonStyle}
                >
                    Choose
                </Button>

                <Button
                    onClick={toggleDisabled}
                    variant={isPlaceholder ? "primary" : "secondary"}
                    style={{
                        ...buttonStyle,
                        ...(isPlaceholder && buttonDisabledStyle),
                    }}
                >
                    {isPlaceholder ? "Enable" : "Disable"}
                </Button>
            </div>
        );
    }

    //
    // SELECTED MEDIA STATE
    //
    const thumb = isVideoType ? (
        <video preload="metadata" style={imageStyle}>
            <source src={src} type="video/mp4"/>
        </video>
    ) : (
        <img src={src} alt="" style={imageStyle}/>
    );

    return (
        <div
            style={thumbnailStyle}
            onClick={clearValue}
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
                    borderRadius: "4px",
                }}
            />
        </div>
    );
}

export default PreviewThumbnail;
