import {useEffect, useRef, Fragment, useCallback, useMemo} from '@wordpress/element';
import {InspectorControls, useBlockProps, useInnerBlocksProps, InnerBlocks} from '@wordpress/block-editor';
import {Background} from "Components/Background.js";
import {isEqual} from 'lodash';
import {cleanObject, parseSpecialProps, getCSSFromStyle} from 'Includes/style-utils'; // at top


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
    const {className: userClass = '', style: blockStyle = {}, ...restWrapperProps} = wrapperProps;
    const {'wpbs-style': settings = {}, uniqueId, style: attrStyle = {}} = attributes;
    const {props: layout = {}, background = {}, hover = {}} = settings;

    const blockNameClass = name ? name.replace('/', '-') : '';

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

    const blockGap = attributes?.style?.spacing?.blockGap ?? {};

    const styleList = Object.fromEntries(
        Object.entries({
            rowGap: blockGap?.top ?? blockGap,
            columnGap: blockGap?.left ?? blockGap,
        })
            .filter(([_, v]) => v !== undefined && v !== null && v !== '')
            .map(([key, value]) => [key, getCSSFromStyle(value)])
    );

    return {
        className: classList,
        style: {...blockStyle, ...styleList},
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

    const baseBlockProps = useMemo(
        () => getBlockProps(props, wrapperProps),
        [
            attributes.uniqueId,
            attributes['wpbs-style'],
            attributes.style?.spacing?.blockGap,
            wrapperProps.className,
            wrapperProps.style,
        ]
    );

    // --- Save (frontend) version ---
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
                {isBackgroundActive && <Background/>}
            </Tag>
        );
    }

    const blockProps = useBlockProps(baseBlockProps);

    if (hasContainer || isBackgroundActive) {
        // Inner blocks live inside a container div
        const containerProps = useInnerBlocksProps(
            {className: containerClass},
            {}
        );

        return (
            <Tag {...blockProps}>
                <div {...containerProps}>
                    {containerProps.children}
                </div>

                {isBackgroundActive && <Background/>}
                {children}
            </Tag>
        );
    }

    const innerProps = useInnerBlocksProps(blockProps, {});

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
        (layoutState) => {
            const cleanedStyle = cleanObject(layoutState);

            const cssObj = {
                props: parseSpecialProps(cleanedStyle.props || {}),
                breakpoints: {},
                hover: {},
            };

            for (const [bpKey, bpProps] of Object.entries(cleanedStyle.breakpoints || {})) {
                cssObj.breakpoints[bpKey] = parseSpecialProps(bpProps);
            }

            if (cleanedStyle.hover) {
                cssObj.hover = parseSpecialProps(cleanedStyle.hover);
            }

            const cleanedCss = cleanObject(cssObj);

            if (
                isEqual(cleanObject(attributes['wpbs-style']), cleanedStyle) &&
                isEqual(cleanObject(attributes['wpbs-css']), cleanedCss)
            ) {
                return;
            }

            setAttributes({
                'wpbs-style': cleanedStyle,
                'wpbs-css': cleanedCss,
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





