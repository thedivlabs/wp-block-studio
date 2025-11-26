import {ElementTag} from "Components/AdvancedControls";
import {BackgroundElement, hasAnyBackground} from "Components/Background";
import {
    useBlockProps,
    useInnerBlocksProps,
    InnerBlocks,
} from "@wordpress/block-editor";
import {memo, useMemo} from "@wordpress/element";
import _ from "lodash";

const API = window?.WPBS_StyleEditor ?? {};
const {cleanObject, getCSSFromStyle} = API;

/**
 * Memoized background renderer — safe + cheap.
 */
const BlockBackground = memo(
    ({attributes}) => {
        return <BackgroundElement attributes={attributes} isSave={false}/>;
    },
    (prev, next) =>
        _.isEqual(
            prev.attributes["wpbs-background"],
            next.attributes["wpbs-background"]
        )
);

/**
 * Compute full block props (classes, styles, data attributes).
 * MUST run every render — DO NOT memoize the output.
 */
const getBlockPropsMerged = (props, mergedWrapperProps) => {
    const {attributes = {}} = props;

    const {
        className: userClass = "",
        style: blockStyle = {},
        ...restWrapperProps
    } = mergedWrapperProps;

    const {"wpbs-style": styleSettings = {}, uniqueId} = attributes;
    const advanced = attributes["wpbs-advanced"] || {};
    const {props: layout = {}} = styleSettings;

    const bgSettings = attributes["wpbs-background"] || {};
    const hasBackgroundActive = hasAnyBackground(bgSettings);
    const hasContainer = hasBackgroundActive || advanced.container;
    const isContainer = !hasContainer && !!layout.container;

    const classList = [
        userClass || null,
        uniqueId,
        hasBackgroundActive ? "relative" : null,
        advanced["hide-empty"] && "--hide-empty",
        advanced["required"] && "--required",
        layout["box-shadow"] && "--shadow",
        layout["offset-header"] && "--offset-header",
        hasContainer && "--has-container",
        isContainer && "wpbs-container",
        layout["content-visibility"] && "--content-visibility",
        layout["mask-image"] && "--mask",
    ]
        .filter(Boolean)
        .join(" ")
        .trim();

    const dataProps = Object.fromEntries(
        Object.entries({
            "data-aos": layout?.["reveal-anim"] ?? null,
            "data-aos-distance": layout?.["reveal-distance"] ?? null,
            "data-aos-duration": layout?.["reveal-duration"] ?? null,
            "data-aos-easing": layout?.["reveal-easing"] ?? null,
            "data-aos-offset": layout?.["reveal-offset"] ?? null,
            "data-aos-delay": layout?.["reveal-delay"] ?? null,
        }).filter(Boolean)
    );

    return cleanObject(
        {
            className: classList,
            style: {...blockStyle},
            ...dataProps,
            ...restWrapperProps,
        },
        true
    );
};

export const BlockWrapper = ({
                                 props,
                                 wrapperProps = {},
                                 config = {},
                                 children,
                                 isSave = false,
                             }) => {
    const {attributes} = props;


    const bgSettings = attributes["wpbs-background"] || {};
    const {"wpbs-style": styleSettings = {}} = attributes;
    const {"wpbs-advanced": advanced = {}} = attributes;

    const {
        tagName: wrapperTagName = "div",
        hasBackground = true,
        hasChildren = false,
    } = wrapperProps;

    const Tag = ElementTag(advanced?.tagName, wrapperTagName);

    const isBackgroundActive =
        hasAnyBackground(bgSettings) && !!hasBackground;

    const hasContainer = isBackgroundActive || advanced?.container;

    const containerClass =
        "wpbs-layout-wrapper wpbs-container w-full h-full relative z-20";

    /**
     * ✔ SAFE MEMOIZATION
     * Merge wrapperProps + config in BlockWrapper.
     * Prevents identity churn.
     */
    const mergedWrapperProps = {...wrapperProps, ...config};

    /**
     * MUST NOT MEMOIZE
     * baseBlockProps MUST be recomputed every render
     * to keep Gutenberg’s useSelect hook in the correct mode.
     */
    const baseBlockProps = getBlockPropsMerged(props, mergedWrapperProps);

    /* ─────────────────────────────────────────────
       SAVE VERSION
    ───────────────────────────────────────────── */
    if (isSave) {
        const saveProps = useBlockProps.save(baseBlockProps);

        if (hasChildren && (hasContainer && isBackgroundActive)) {
            return (
                <Tag {...saveProps}>
                    <div className={containerClass}>
                        <InnerBlocks.Content/>
                        {children}
                    </div>

                    <BackgroundElement attributes={attributes} isSave={true}/>
                </Tag>
            );
        }

        if (hasChildren) {
            return (
                <Tag {...saveProps}>
                    <InnerBlocks.Content/>
                    {children}
                </Tag>
            );
        }

        if (hasContainer || isBackgroundActive) {
            return (
                <Tag {...saveProps}>
                    <div className={containerClass}>{children}</div>

                    <BackgroundElement attributes={attributes} isSave={true}/>
                </Tag>
            );
        }

        return <Tag {...saveProps}>{children}</Tag>;
    }

    /* ─────────────────────────────────────────────
       EDIT VERSION
    ───────────────────────────────────────────── */
    const blockProps = useBlockProps(baseBlockProps);

    if (hasContainer || isBackgroundActive) {
        const containerProps = useInnerBlocksProps(
            {className: containerClass},
            {}
        );

        return (
            <Tag {...blockProps}>
                <div {...containerProps}>
                    {containerProps.children}
                    {children}
                </div>

                <BlockBackground attributes={attributes}/>
            </Tag>
        );
    }

    if (hasChildren) {
        const innerProps = useInnerBlocksProps(blockProps, {});
        return (
            <Tag {...innerProps}>
                {innerProps.children}
                {children}
            </Tag>
        );
    }

    return <Tag {...blockProps}>{children}</Tag>;
};
