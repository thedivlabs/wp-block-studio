import {ElementTag} from "Components/AdvancedControls";
import {BackgroundElement, hasAnyBackground} from "Components/Background";
import {useBlockProps, useInnerBlocksProps, InnerBlocks} from "@wordpress/block-editor";
import {memo} from "@wordpress/element";
import _ from "lodash";

const API = window?.WPBS_StyleEditor ?? {};
const {cleanObject, getCSSFromStyle} = API;

const getBlockProps = (props = {}, wrapperProps = {}) => {
    const {attributes = {}, name} = props;

    const {className: userClass = '', style: blockStyle = {}, ...restWrapperProps} = wrapperProps;
    const {'wpbs-style': settings = {}, uniqueId, style: attrStyle = {}} = attributes;
    const {props: layout = {}, background = {}, hover = {}, advanced = {}} = settings;
    const hasBackground = hasAnyBackground(settings);
    const hasContainer = hasBackground || advanced.container;
    const isContainer = !hasContainer && !!layout.container;


    const classList = [
        //blockBaseName,
        userClass || null,
        uniqueId,
        hasBackground ? 'relative' : null,
        layout['hide-empty'] && '--hide-empty',
        layout['box-shadow'] && '--shadow',
        layout['required'] && '--required',
        layout['offset-header'] && '--offset-header',
        hasContainer && '--has-container',
        isContainer && 'wpbs-container',
        layout['content-visibility'] && '--content-visibility',
        layout['mask-image'] && '--mask',
    ]
        .filter(Boolean)
        .join(' ')
        .trim();


    const styleList = Object.fromEntries(
        Object.entries({})
            .map(([key, value]) => [key, getCSSFromStyle(value)])
            .filter(([_, v]) => v !== undefined && v !== null && v !== '')
    );

    const dataProps = Object.fromEntries(
        Object.entries({
            'data-aos': layout?.['reveal-anim'] ?? null,
            'data-aos-distance': layout?.['reveal-distance'] ?? null,
            'data-aos-duration': layout?.['reveal-duration'] ?? null,
            'data-aos-easing': layout?.['reveal-easing'] ?? null,
            'data-aos-offset': layout?.['reveal-offset'] ?? null,
            'data-aos-delay': layout?.['reveal-delay'] ?? null,
        })
            .filter(Boolean)
    );

    return cleanObject({
        className: classList,
        style: {...blockStyle, ...styleList},
        ...dataProps,
        ...restWrapperProps,
    }, true);
};

const BlockBackground = memo(
    ({attributes}) => {
        return <BackgroundElement attributes={attributes} isSave={false}/>;
    },
    (prev, next) =>
        _.isEqual(
            prev.attributes['wpbs-style']?.background,
            next.attributes['wpbs-style']?.background
        )
);


export const BlockWrapper = ({
                                 props,            // full block props from Gutenberg
                                 wrapperProps = {},// wrapper-level props (className, tagName, etc.)
                                 children,
                                 isSave = false,
                                 ...rest
                             }) => {

    const {attributes} = props;
    const {'wpbs-style': settings = {}} = attributes;
    const {advanced} = settings;

    const {tagName: wrapperTagName = 'div', hasBackground = true, hasChildren = false} = wrapperProps;
    const Tag = ElementTag(advanced?.tagName, wrapperTagName || tagName);

    const isBackgroundActive = hasAnyBackground(settings) && !!hasBackground;

    const hasContainer = isBackgroundActive || settings?.advanced?.container;

    const containerClass = [
        //blockBaseName ? `${blockBaseName}__container` : null,
        'wpbs-layout-wrapper wpbs-container w-full h-full relative z-20',
    ]
        .filter(Boolean)
        .join(' ');

    const baseBlockProps = getBlockProps(props, wrapperProps);

    // ──────────────────────────────────────────────
    // SAVE VERSION
    // ──────────────────────────────────────────────
    if (isSave) {
        const saveProps = useBlockProps.save(baseBlockProps);

        // CASE 1 — InnerBlocks + container/background
        if (hasChildren && (hasContainer || isBackgroundActive)) {
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

        // CASE 2 — InnerBlocks only
        if (hasChildren) {
            return (
                <Tag {...saveProps}>
                    <InnerBlocks.Content/>
                    {children}
                </Tag>
            );
        }

        // CASE 3 — No InnerBlocks + container/background
        if (hasContainer || isBackgroundActive) {
            return (
                <Tag {...saveProps}>
                    <div className={containerClass}>
                        {children}
                    </div>

                    <BackgroundElement attributes={attributes} isSave={true}/>
                </Tag>
            );
        }

        // CASE 4 — No InnerBlocks, no container/background
        return (
            <Tag {...saveProps}>
                {children}
            </Tag>
        );
    }


    // ──────────────────────────────────────────────
    // EDIT VERSION
    // ──────────────────────────────────────────────
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

    if (hasContainer || isBackgroundActive) {

        const containerProps = {
            className: containerClass
        };

        return (
            <Tag {...blockProps}>
                <div {...containerProps}>
                    {children}
                </div>

                <BlockBackground attributes={attributes}/>
            </Tag>
        );
    }

// NO CHILDREN — Basic rendering
    return (
        <Tag {...blockProps}>
            {children}
        </Tag>
    );

};
