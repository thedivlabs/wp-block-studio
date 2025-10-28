import {useState, useEffect, useRef, Fragment, useCallback} from '@wordpress/element';
import {InspectorControls, useBlockProps, useInnerBlocksProps, InnerBlocks} from '@wordpress/block-editor';
import {Background} from "Components/Background.js";
import {PanelBody} from "@wordpress/components";
import {useInstanceId} from "@wordpress/compose";
import {useSelect} from "@wordpress/data";

export const STYLE_ATTRIBUTES = {
    'uniqueId': {
        type: 'string'
    },
    'wpbs-css': {
        type: 'object',
        default: {},
    },
    'wpbs-preload': {
        type: 'array',
    },
    'wpbs-style': {
        type: 'object',
        default: {},
    }
}

const useUniqueId = ({name, attributes}) => {

    const {uniqueId} = attributes;
    const prefix = (name ?? 'wpbs-block').replace(/[^a-z0-9]/gi, '-');
    //return uniqueId || instanceId;
    return useInstanceId(useUniqueId, prefix);
}

const getComponentProps = (props) => {
    const {attributes} = props;
    const style = attributes['wpbs-style'] || {};
    const background = style.background || {};
    const layout = style.layout || {};

    const data = Object.fromEntries(Object.entries({
        ElementTagName: 'div',
        hasBackground: !!background.type,
        hasContainer: !!layout.container || !!background.type,
        background,
    }).filter(Boolean));

    return {
        ...props,
        styleData: data,
    }
}

const getBlockProps = (props = {}, wrapperProps = {}) => {
    const {attributes = {}, name} = props;
    const {className: userClass = '', ...restWrapperProps} = wrapperProps;
    const {'wpbs-style': settings = {}, uniqueId} = attributes;
    const {layout = {}, background = {}, hover = {}} = settings;

    // Compute base block name class
    const blockNameClass = name ? name.replace('/', '-') : '';

    // Construct class list with clean filtering
    const classList = [
        blockNameClass,
        uniqueId,
        userClass || null,
        layout['offset-height'] && '--offset-height',
        layout['hide-empty'] && '--hide-empty',
        layout['box-shadow'] && '--shadow',
        layout['required'] && '--required',
        layout['offset-header'] && '--offset-header',
        layout['container'] && '--container',
        layout['reveal'] && '--reveal',
        layout['transition'] && '--transition',
        layout['content-visibility'] && '--content-visibility',
        layout['mask-image'] && '--mask',
    ]
        .filter(Boolean)
        .join(' ')
        .trim();

    // Return normalized HTML props object
    return {
        className: classList,
        ...restWrapperProps,
    };
};

const StylePanel = ({props, styleRef, cssProps}) => {
    const {clientId, attributes} = props;
    const {uniqueId} = attributes;
    const mountRef = useRef(null);
    const {openStyleEditor} = window?.WPBS_StyleControls ?? {};
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (isOpen && mountRef.current && openStyleEditor) {
            openStyleEditor(mountRef.current, props, styleRef, cssProps);
        }
    }, [isOpen, cssProps, openStyleEditor]);

    return (
        <PanelBody
            title="Layout"
            initialOpen={false}
            className="wpbs-layout-tools"
            onToggle={setIsOpen}
        >
            <div
                ref={mountRef}
                className="wpbs-style-placeholder"
                data-client-id={clientId}
                style={{padding: '4px 0'}}
            />
        </PanelBody>
    );
};

export const BlockWrapper = ({
                                 props,
                                 className,
                                 tagName = 'div',
                                 children,
                                 hasBackground = false,
                                 isSave = false,
                                 ...wrapperProps
                             }) => {
    const {attributes} = props;
    const {uniqueId} = attributes;
    const {'wpbs-style': settings = {}} = attributes;
    const Tag = settings?.tagName ?? tagName;
    const hasContainer = settings?.layout?.container || settings?.background?.type;

    const containerClass = [
        uniqueId ? `${uniqueId}__container` : null,
        'wpbs-layout-wrapper wpbs-container w-full h-full relative z-20',
    ].filter(Boolean).join(' ');

    // Merge all HTML/block props in one place
    const blockProps = isSave
        ? useBlockProps.save(getBlockProps(props, wrapperProps))
        : useBlockProps(getBlockProps(props, wrapperProps));

    // Save version
    if (isSave) {

        return (
            <Tag {...blockProps}>
                {hasContainer ? (
                    <div className={containerClass}>
                        <InnerBlocks.Content/>
                    </div>
                ) : (
                    <InnerBlocks.Content/>
                )}
                {hasBackground && <Background/>}
                {children}
            </Tag>
        );
    }

    // Editor version (live inner blocks)
    const containerProps = {className: containerClass};
    const innerBlocksProps = hasContainer
        ? useInnerBlocksProps(containerProps, {})
        : useInnerBlocksProps(blockProps, {});

    return (
        <Tag {...blockProps}>
            {hasContainer || hasBackground ? (
                <div {...innerBlocksProps} />
            ) : (
                innerBlocksProps.children
            )}
            {hasBackground && <Background/>}
            {children}
        </Tag>
    );
};


export const withStyle = (Component, isSave = false) => {
    return (props) => {
        const {clientId, isSelected, attributes, setAttributes, name} = props;
        const styleRef = useRef(null);
        const uniqueId = useUniqueId({name, attributes});
        const [cssProps, setCssProps] = useState({});

        const BoundBlockWrapper = useCallback(
            (wrapperProps) => (
                <BlockWrapper
                    {...wrapperProps}
                    props={props}
                    clientId={clientId}
                    isSave={isSave}
                />
            ),
            [clientId, attributes?.uniqueId, attributes['wpbs-style']]
        );

        if (isSave) {
            const {'wpbs-style': styleData = {}} = attributes;
            return (
                <Component
                    {...getComponentProps(props)}
                    BlockWrapper={BoundBlockWrapper}
                    styleData={styleData}
                />
            );
        }

        const guardFailed =
            !window?.WPBS_StyleControls ||
            typeof window.WPBS_StyleControls.updateStyleString !== 'function' ||
            typeof window.WPBS_StyleControls.openStyleEditor !== 'function' ||
            !uniqueId;

        if (guardFailed) {
            console.warn(`[WPBS] Block "${name}" disabled: missing style environment.`, {
                uniqueId,
                hasStyleControls: !!window?.WPBS_StyleControls,
            });
            return null;
        }

        const duplicateIds = useSelect(
            (select) => {
                const {getBlocks} = select('core/block-editor');
                const blocks = getBlocks();
                const currentId = attributes.uniqueId;
                return blocks.filter(
                    (b) => b.attributes?.uniqueId === currentId && b.clientId !== clientId
                );
            },
            [attributes.uniqueId, clientId]
        );

        useEffect(() => {
            const {uniqueId: currentId} = attributes;
            if (!currentId || duplicateIds.length > 0) {
                setAttributes({uniqueId});
            }
        }, [uniqueId, duplicateIds]);

        useEffect(() => {
            window.WPBS_StyleControls.updateStyleString(props, styleRef);
        }, [attributes?.['wpbs-css'], uniqueId]);

        return (
            <>
                <Component BlockWrapper={BoundBlockWrapper} setCssProps={setCssProps} {...getComponentProps(props)} />

                <InspectorControls group="styles">
                    <StylePanel props={props} styleRef={styleRef} cssProps={cssProps}/>
                </InspectorControls>

                <style ref={styleRef} id={`wpbs-style-${clientId}`}></style>
            </>
        );
    };
};




