import { ElementTag } from "Components/AdvancedControls";
import { BackgroundElement, hasAnyBackground } from "Components/Background";
import {
    useBlockProps,
    useInnerBlocksProps,
    InnerBlocks,
} from "@wordpress/block-editor";
import { memo } from "@wordpress/element";
import _ from "lodash";

const API = window?.WPBS_StyleEditor ?? {};
const { cleanObject, getCSSFromStyle } = API;

/**
 * Build block props (classes, styles, data attributes) from layout props.
 */
const getBlockProps = (props = {}, wrapperProps = {}) => {
    const { attributes = {} } = props;
    const {
        className: userClass = "",
        style: blockStyle = {},
        ...restWrapperProps
    } = wrapperProps;

    const { "wpbs-style": styleSettings = {}, uniqueId } = attributes;
    const { props: layout = {}, hover = {}, advanced = {} } = styleSettings;

    // background now comes from separate attribute
    const bgSettings = attributes["wpbs-background"] || {};
    const hasBackground = hasAnyBackground(bgSettings);
    const hasContainer = hasBackground || advanced.container;
    const isContainer = !hasContainer && !!layout.container;

    const classList = [
        userClass || null,
        uniqueId,
        hasBackground ? "relative" : null,
        layout["hide-empty"] && "--hide-empty",
        layout["box-shadow"] && "--shadow",
        layout["required"] && "--required",
        layout["offset-header"] && "--offset-header",
        hasContainer && "--has-container",
        isContainer && "wpbs-container",
        layout["content-visibility"] && "--content-visibility",
        layout["mask-image"] && "--mask",
    ]
        .filter(Boolean)
        .join(" ")
        .trim();

    const styleList = Object.fromEntries(
        Object.entries({})
            .map(([key, value]) => [key, getCSSFromStyle(value)])
            .filter(([_, v]) => v !== undefined && v !== null && v !== "")
    );

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
            style: { ...blockStyle, ...styleList },
            ...dataProps,
            ...restWrapperProps,
        },
        true
    );
};

/**
 * Memoized editor-only background layer.
 * Must compare `wpbs-background` instead of old `wpbs-style.background`.
 */
const BlockBackground = memo(
    ({ attributes }) => {
        return <BackgroundElement attributes={attributes} isSave={false} />;
    },
    (prev, next) =>
        _.isEqual(
            prev.attributes["wpbs-background"],
            next.attributes["wpbs-background"]
        )
);

export const BlockWrapper = ({
                                 props,
                                 wrapperProps = {},
                                 children,
                                 isSave = false,
                             }) => {
    const { attributes } = props;

    // NEW: background comes from wpbs-background, not wpbs-style
    const bgSettings = attributes["wpbs-background"] || {};
    const {"wpbs-style": styleSettings = {} } = attributes;
    const { advanced = {} } = styleSettings;

    const {
        tagName: wrapperTagName = "div",
        hasBackground = true,
        hasChildren = false,
    } = wrapperProps;

    const Tag = ElementTag(advanced?.tagName, wrapperTagName);

    const isBackgroundActive =
        hasAnyBackground(bgSettings) && !!hasBackground;

    const hasContainer = isBackgroundActive || advanced?.container;

    const containerClass = [
        "wpbs-layout-wrapper wpbs-container w-full h-full relative z-20",
    ]
        .filter(Boolean)
        .join(" ");

    const baseBlockProps = getBlockProps(props, wrapperProps);

    /* ──────────────────────────────────────────────────────────────
       SAVE VERSION
    ─────────────────────────────────────────────────────────────── */
    if (isSave) {
        const saveProps = useBlockProps.save(baseBlockProps);

        // CASE 1 — InnerBlocks + container/background
        if (hasChildren && (hasContainer || isBackgroundActive)) {
            return (
                <Tag {...saveProps}>
                    <div className={containerClass}>
                        <InnerBlocks.Content />
                        {children}
                    </div>

                    <BackgroundElement attributes={attributes} isSave={true} />
                </Tag>
            );
        }

        // CASE 2 — InnerBlocks only
        if (hasChildren) {
            return (
                <Tag {...saveProps}>
                    <InnerBlocks.Content />
                    {children}
                </Tag>
            );
        }

        // CASE 3 — No InnerBlocks + container/background
        if (hasContainer || isBackgroundActive) {
            return (
                <Tag {...saveProps}>
                    <div className={containerClass}>{children}</div>

                    <BackgroundElement attributes={attributes} isSave={true} />
                </Tag>
            );
        }

        // CASE 4 — No InnerBlocks, no container/background
        return <Tag {...saveProps}>{children}</Tag>;
    }

    /* ──────────────────────────────────────────────────────────────
       EDIT VERSION
    ─────────────────────────────────────────────────────────────── */
    const blockProps = useBlockProps(baseBlockProps);

    if (hasContainer || isBackgroundActive) {
        const containerProps = useInnerBlocksProps(
            { className: containerClass },
            {}
        );

        return (
            <Tag {...blockProps}>
                <div {...containerProps}>
                    {containerProps.children}
                    {children}
                </div>

                <BlockBackground attributes={attributes} />
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

    // NO CHILDREN — Basic rendering
    return <Tag {...blockProps}>{children}</Tag>;
};