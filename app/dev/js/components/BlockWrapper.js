import {ElementTag} from "Components/AdvancedControls";
import {BackgroundElement, hasAnyBackground} from "Components/Background";
import {useBlockProps, useInnerBlocksProps, InnerBlocks} from "@wordpress/block-editor";
import {memo} from "@wordpress/element";

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

    const blockBaseName = name ? name.replace('/', '-') : '';

    const classList = [
        blockBaseName,
        uniqueId,
        userClass || null,
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
                                 props,
                                 tagName = 'div',
                                 className: blockClassName = '',
                                 children,
                                 hasBackground = true,
                                 isSave = false,
                                 ...wrapperProps
                             }) => {
    const {attributes, name} = props;
    const {'wpbs-style': settings = {}} = attributes;
    const {advanced} = settings;

    const Tag = ElementTag(advanced?.tagName, tagName);

    const isBackgroundActive = hasAnyBackground(settings);
    const hasContainer = isBackgroundActive || advanced?.container;

    const blockBaseName = name ? name.replace('/', '-') : '';

    // ----- USER CLASS NAMES FROM THE BLOCK -----
    const userClass = blockClassName || '';

    // ----- GUTENBERG WILL ADD ITS OWN CLASSES VIA useBlockProps -----
    // DO NOT MERGE THEM MANUALLY. Let useBlockProps handle them.

    // ----- CUSTOM INTERNAL CLASSES -----
    const internalClasses = [
        blockBaseName,
        attributes.uniqueId,
        hasBackground ? 'relative' : null,
        settings?.props?.['hide-empty'] && '--hide-empty',
        settings?.props?.['box-shadow'] && '--shadow',
        settings?.props?.['required'] && '--required',
        settings?.props?.['offset-header'] && '--offset-header',
        hasContainer && '--has-container',
        settings?.props?.['content-visibility'] && '--content-visibility',
        settings?.props?.['mask-image'] && '--mask',
    ]
        .filter(Boolean)
        .join(' ');

    // ----- MERGE ALL CLASS SOURCES SAFELY -----
    const mergedClassName = [userClass, internalClasses]
        .filter(Boolean)
        .join(' ');

    // ----- MERGE WRAPPER PROPS PASSED FROM CTA BLOCK -----
    // Eg. block CTA anchorProps, inline styles, id, data-*, etc.
    const mergedWrapperProps = {
        ...wrapperProps,
        className: mergedClassName,
        // wrapperProps.style (from CTA) overrides internal styles
        style: wrapperProps.style || {},
    };

    // ----- EDIT MODE -----
    if (!isSave) {
        const blockProps = useBlockProps(mergedWrapperProps);

        if (hasContainer || isBackgroundActive) {
            const containerClass = [
                `${blockBaseName}__container`,
                'wpbs-layout-wrapper wpbs-container w-full h-full relative z-20',
            ]
                .filter(Boolean)
                .join(' ');

            const containerProps = useInnerBlocksProps(
                {className: containerClass},
                {}
            );

            return (
                <Tag {...blockProps}>
                    <div {...containerProps}>{containerProps.children}</div>
                    {children}
                    <BlockBackground attributes={attributes}/>
                </Tag>
            );
        }

        const innerProps = useInnerBlocksProps(blockProps, {});
        return (
            <Tag {...innerProps}>
                {innerProps.children}
                {children}
            </Tag>
        );
    }

    // ----- SAVE MODE -----
    const saveProps = useBlockProps.save(mergedWrapperProps);

    return (
        <Tag {...saveProps}>
            {hasContainer ? (
                <div
                    className={`${blockBaseName}__container wpbs-layout-wrapper wpbs-container w-full h-full relative z-20`}>
                    <InnerBlocks.Content/>
                </div>
            ) : (
                <InnerBlocks.Content/>
            )}

            {children}
            <BackgroundElement attributes={attributes} isSave={true}/>
        </Tag>
    );
};

