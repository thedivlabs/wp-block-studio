/**
 * Returns a flat array of breakpoint props.
 */
export const getBreakpointPropsList = (raw = {}) => {
    const breakpoints = raw.breakpoints || {};
    return Object.values(breakpoints).map(bp => bp?.props || {});
};


/**
 * Reads a property from base OR any breakpoint override.
 */
export const anyProp = (baseProps = {}, bpPropsList = [], key) => {
    if (baseProps && baseProps[key]) return true;
    for (const bp of bpPropsList) {
        if (bp && bp[key]) return true;
    }
    return false;
};


/**
 * Determines if an image object is a real image and not a placeholder.
 */
export const isRealImage = (img) => {
    if (!img || img.isPlaceholder) return false;
    if (img.id) return true;
    return img.source && img.source !== "#";

};


/**
 * Detects if any level contains an actual image.
 */
export const hasAnyImage = (baseProps = {}, bpPropsList = []) => {
    if (isRealImage(baseProps.image)) return true;
    for (const bp of bpPropsList) {
        if (isRealImage(bp.image)) return true;
    }
    return false;
};


/**
 * Returns true if this is a featured-image type (desktop or mobile).
 */
export const isFeaturedType = (baseType) => {
    return (
        baseType === "featured-image" ||
        baseType === "featured-image-mobile"
    );
};


