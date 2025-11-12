import {ElementTag} from "Components/AdvancedControls";
import {BackgroundElement} from "Components/Background";
import {useBlockProps, useInnerBlocksProps, InnerBlocks} from "@wordpress/block-editor";

const API = window?.WPBS_StyleEditor ?? {};
const {cleanObject} = API;

const getBlockProps = (props = {}, wrapperProps = {}) => {
    const {attributes = {}, name} = props;
    const {className: userClass = '', style: blockStyle = {}, ...restWrapperProps} = wrapperProps;
    const {'wpbs-style': settings = {}, uniqueId, style: attrStyle = {}} = attributes;
    const {props: layout = {}, background = {}, hover = {}, advanced = {}} = settings;
    const hasBackground =
        !!(background && (background.type || background.image || background.video));
    const hasContainer = hasBackground || advanced.container;
    const isContainer = !hasContainer && !!layout.container;


    const blockBaseName = name ? name.replace('/', '-') : '';

    const classList = [
        blockBaseName,
        uniqueId,
        userClass || null,
        hasBackground ? 'relative' : null,
        layout['offset-height'] && '--offset-height',
        layout['hide-empty'] && '--hide-empty',
        layout['box-shadow'] && '--shadow',
        layout['required'] && '--required',
        layout['offset-header'] && '--offset-header',
        hasContainer && '--has-container',
        isContainer && 'wpbs-container',
        layout['reveal'] && '--reveal',
        layout['transition'] && '--transition',
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

    return cleanObject({
        className: classList,
        style: {...blockStyle, ...styleList},
        ...restWrapperProps,
    }, true);
};

const BlockBackground = ({attributes, isSave}) => (
    <BackgroundElement attributes={attributes} isSave={!!isSave}/>
);

export const BlockWrapper = ({
                                 props,
                                 className,
                                 tagName = 'div',
                                 children,
                                 hasBackground = true,
                                 isSave = false,
                                 ...wrapperProps
                             }) => {
    const {attributes, name} = props;
    const {'wpbs-style': settings = {}} = attributes;
    const {advanced} = settings;

    const blockBaseName = name ? name.replace('/', '-') : '';
    const Tag = ElementTag(advanced?.tagName, tagName);

    const isBackgroundActive = hasBackground && settings?.background?.type;
    const hasContainer = isBackgroundActive || settings?.advanced?.container;

    const containerClass = [
        blockBaseName ? `${blockBaseName}__container` : null,
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

        return (
            <Tag {...saveProps}>
                {hasContainer ? (
                    <div className={containerClass}>
                        <InnerBlocks.Content/>
                    </div>
                ) : (
                    <InnerBlocks.Content/>
                )}

                {children}

                <BlockBackground attributes={attributes} isSave={true}/>
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
};
