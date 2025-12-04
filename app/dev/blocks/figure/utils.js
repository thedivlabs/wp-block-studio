/**
 * Determines if an image object is a real image and not a placeholder.
 */
export const isRealImage = (img) => {
    if (!img || img.isPlaceholder) return false;
    if (img.id) return true;
    return img.source && img.source !== "#";
};

export const hasAnyImage = (baseProps = {}, bpPropsList = []) => {
    // If any level has a real image → true
    if (isRealImage(baseProps.image)) return true;
    for (const bp of bpPropsList) {
        if (isRealImage(bp.image)) return true;
    }

    // If type indicates the featured-image system → true
    const baseType = baseProps.type;
    if (
        baseType === "featured-image" ||
        baseType === "featured-image-mobile"
    ) {
        return true;
    }

    // Otherwise → no image anywhere
    return false;
};
