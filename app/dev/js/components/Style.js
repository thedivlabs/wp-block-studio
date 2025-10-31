import {useEffect, useRef, Fragment, useCallback, useMemo} from '@wordpress/element';
import {InspectorControls, useBlockProps, useInnerBlocksProps, InnerBlocks} from '@wordpress/block-editor';
import {Background} from "Components/Background.js";
import {isEqual, cloneDeep, merge} from 'lodash';
import {cleanObject, parseSpecialProps} from 'Includes/style-utils'; // at top


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
    const isBackgroundActive = hasBackground && settings?.background?.type;
    const hasContainer = settings?.layout?.container || isBackgroundActive;

    const containerClass = [
        uniqueId ? `${uniqueId}__container` : null,
        'wpbs-layout-wrapper wpbs-container w-full h-full relative z-20',
    ]
        .filter(Boolean)
        .join(' ');

    // --- Save (frontend) version ---
    if (isSave) {
        const saveProps = useBlockProps.save(getBlockProps(props, wrapperProps));

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
                {isBackgroundActive && <Background/>}
            </Tag>
        );
    }

    // --- Editor (backend) version ---
    const baseBlockProps = useBlockProps(getBlockProps(props, wrapperProps));

    if (hasContainer || isBackgroundActive) {
        // Inner blocks live inside a container div
        const containerProps = useInnerBlocksProps(
            {className: containerClass},
            {}
        );

        return (
            <Tag {...baseBlockProps}>
                <div {...containerProps}>
                    {containerProps.children}
                </div>

                {isBackgroundActive && <Background/>}
                {children}
            </Tag>
        );
    }

    // No container: inner blocks live directly on Tag
    const innerProps = useInnerBlocksProps(baseBlockProps, {});

    return (
        <Tag {...innerProps}>
            {innerProps.children}
            {isBackgroundActive && <Background/>}
            {children}
        </Tag>
    );
};

export const withStyle = (Component) => (props) => {

    const styleRef = useRef(null);
    const cssPropsRef = useRef({});
    const initializedRef = useRef(false);
    const {StyleEditorUI} = window.WPBS_StyleEditor;

    const {clientId, attributes, setAttributes, name} = props;

    const {uniqueId} = attributes;

    useEffect(() => {
        if (initializedRef.current || uniqueId) return;
        initializedRef.current = true;

        const id = `${name.split('/').pop()}-${clientId.slice(0, 6)}`;
        setAttributes({uniqueId: id});
    }, [uniqueId]);


    const blockCss = useCallback((newProps) => {
        console.log('blockCss');
        cssPropsRef.current = newProps;
    }, []);


    const updateStyleSettings = useCallback(
        (incoming) => {
            // Support both direct layout objects and wrapped { 'wpbs-style': layout } calls
            const newStyle =
                incoming && incoming['wpbs-style']
                    ? incoming['wpbs-style']
                    : incoming || {};

            const currentStyle = attributes['wpbs-style'] || {};
            const currentCss = attributes['wpbs-css'] || {};

            // Normalize layout to CSS object
            const cleanedStyle = cleanObject(newStyle);
            const cssObj = {
                props: parseSpecialProps(cleanedStyle.props || {}),
                breakpoints: {},
                hover: {},
            };

            if (cleanedStyle.breakpoints) {
                for (const [bpKey, bpProps] of Object.entries(cleanedStyle.breakpoints)) {
                    cssObj.breakpoints[bpKey] = parseSpecialProps(bpProps);
                }
            }

            if (cleanedStyle.hover) {
                cssObj.hover = parseSpecialProps(cleanedStyle.hover);
            }

            // Merge in block-level css from cssPropsRef
            const mergedCss = merge({}, cssPropsRef.current, cleanObject(cssObj));

            // Skip redundant updates
            if (isEqual(currentStyle, cleanedStyle) && isEqual(currentCss, mergedCss)) return;

            setAttributes({
                'wpbs-style': cloneDeep(cleanedStyle),
                'wpbs-css': cloneDeep(mergedCss),
            });
        },
        [attributes, setAttributes]
    );

    useEffect(() => {
        if (styleRef.current) {
            window.WPBS_StyleEditor.updateStyleString(props, styleRef);
        }
    }, [attributes['wpbs-css'], uniqueId]);

    const memoizedComponent = useMemo(() => (
        <Component
            {...getComponentProps(props)}
            BlockWrapper={(wrapperProps) => (
                <BlockWrapper {...wrapperProps} props={props} clientId={clientId}/>
            )}
            blockCss={blockCss}
        />
    ), [clientId, blockCss, attributes['wpbs-style']]);

    return (
        <>
            {memoizedComponent}
            <InspectorControls group="styles">
                <StyleEditorUI
                    props={props}
                    styleRef={styleRef}
                    updateStyleSettings={updateStyleSettings}
                />
            </InspectorControls>
            <style ref={styleRef} id={`wpbs-style-${clientId}`}></style>
        </>
    );
};

export const withStyleSave = (Component) => (props) => {
    const {attributes, clientId} = props;
    const {'wpbs-style': styleData = {}} = attributes;

    return (
        <Component
            {...getComponentProps(props)}
            BlockWrapper={(wrapperProps) => (
                <BlockWrapper {...wrapperProps} props={props} clientId={clientId} isSave/>
            )}
            styleData={styleData}
        />
    );
};





