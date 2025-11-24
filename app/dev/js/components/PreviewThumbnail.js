import { Button, Icon } from '@wordpress/components';
import { IMAGE_BUTTON_STYLE } from 'Includes/config';
import { getImageUrlForResolution } from 'Includes/helper';

function PreviewThumbnail({
                              image = null,
                              type = "image",
                              resolution = "large",
                              onSelectClick,
                              callback,
                              style = {}
                          }) {
    /* -------------------------------------------------------------
     * HELPERS: NORMALIZED OUTPUT SHAPES
     * ------------------------------------------------------------- */

    const normalizeEmpty = () => {
        callback({});
    };

    const normalizePlaceholder = () => {
        callback({
            id: null,
            source: "#",
            type: null,
            width: null,
            height: null,
            sizes: null,
            isPlaceholder: true
        });
    };

    const normalizeEnable = () => {
        // enabling from placeholder just clears to empty
        normalizeEmpty();
    };

    /* -------------------------------------------------------------
     * STATE DETECTION
     * ------------------------------------------------------------- */

    const isPlaceholder = image?.isPlaceholder === true;

    const hasRealMedia = image?.id && !isPlaceholder;

    const src = hasRealMedia
        ? getImageUrlForResolution(image, resolution)
        : null;

    const hasSelection = !!src;

    /* -------------------------------------------------------------
     * STYLES
     * ------------------------------------------------------------- */

    const thumbnailStyle = {
        ...IMAGE_BUTTON_STYLE
    };

    const emptyStyle = {
        ...IMAGE_BUTTON_STYLE,
        border: "1px dashed lightgray",
        padding: "8px"
    };

    const buttonStyle = {
        width: "100%",
        maxWidth: "100px",
        textAlign: "center",
        justifyContent: "center"
    };

    const buttonDisabledStyle = {
        backgroundColor: "var(--wp--preset--color--vivid-red)",
        borderColor: "var(--wp--preset--color--vivid-red)"
    };

    const imageStyle = {
        width: "100%",
        height: "100%",
        objectFit: "cover"
    };

    /* -------------------------------------------------------------
     * EMPTY OR PLACEHOLDER UI
     * ------------------------------------------------------------- */

    if (!hasSelection) {
        const toggle = () => {
            if (isPlaceholder) {
                normalizeEnable();
            } else {
                normalizePlaceholder();
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
                    onClick={toggle}
                    variant={isPlaceholder ? "primary" : "secondary"}
                    style={{
                        ...buttonStyle,
                        ...(isPlaceholder && buttonDisabledStyle)
                    }}
                >
                    {isPlaceholder ? "Enable" : "Disable"}
                </Button>
            </div>
        );
    }

    /* -------------------------------------------------------------
     * SELECTED THUMBNAIL
     * ------------------------------------------------------------- */

    const thumb = type === "video" ? (
        <video preload="metadata" style={imageStyle}>
            <source src={src} type="video/mp4" />
        </video>
    ) : (
        <img src={src} alt="" style={imageStyle} />
    );

    return (
        <div
            style={thumbnailStyle}
            onClick={() => normalizeEmpty()} // clicking thumbnail clears
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