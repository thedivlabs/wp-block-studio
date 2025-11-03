import {Fragment, useCallback, useEffect, useMemo, useRef} from '@wordpress/element';
import {InnerBlocks, InspectorControls, useBlockProps, useInnerBlocksProps} from '@wordpress/block-editor';
import {Background} from "Components/Background.js";
import {ElementTagControl, getElementTag} from "Components/ElementTag.js";
import {isEqual} from 'lodash';
import {cleanObject, getCSSFromStyle, parseSpecialProps} from 'Includes/style-utils';
import {
    ToggleControl,
    __experimentalGrid as Grid,
} from "@wordpress/components";


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

const getDataProps = (props) => {
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
            rowGap: blockGap?.top ?? (typeof blockGap === 'string' ? blockGap : undefined),
            columnGap: blockGap?.left ?? (typeof blockGap === 'string' ? blockGap : undefined),
        })
            .map(([key, value]) => [key, getCSSFromStyle(value)])
            .filter(([_, v]) => v !== undefined && v !== null && v !== '')
    );

    return cleanObject({
        className: classList,
        style: {...blockStyle, ...styleList},
        ...restWrapperProps,
    }, true);
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
    const {advanced} = settings;

    const Tag = getElementTag(advanced?.tagName, tagName);
    const isBackgroundActive = hasBackground && settings?.background?.type;
    const isContainer = settings?.advanced?.container;
    const hasContainer = isContainer || isBackgroundActive;

    const containerClass = [
        uniqueId ? `${uniqueId}__container` : null,
        'wpbs-layout-wrapper wpbs-container w-full h-full relative z-20',
    ]
        .filter(Boolean)
        .join(' ');

    const baseBlockProps = getBlockProps(props, wrapperProps);

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

    const {clientId, attributes, setAttributes, tagName} = props;

    const {uniqueId, 'wpbs-style': settings} = attributes;

    const {advanced = {}} = settings || {};

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

    const updateAdvancedSetting = useCallback(
        (updates) => {
            setAttributes((prev) => {
                const prevStyle = prev['wpbs-style'] || {};
                const prevAdvanced = prevStyle.advanced || {};

                return {
                    ...prev,
                    'wpbs-style': {
                        ...prevStyle,
                        advanced: {
                            ...prevAdvanced,
                            ...updates, // merge new values in
                        },
                    },
                };
            });
        },
        [setAttributes]
    );


    useEffect(() => {
        if (styleRef.current) {
            window.WPBS_StyleEditor.updateStyleString(props, styleRef);
        }
    }, [attributes['wpbs-css'], uniqueId]);

    const memoizedComponent = useMemo(() => (
        <Component
            {...getDataProps(props)}
            BlockWrapper={(wrapperProps) => (
                <BlockWrapper {...wrapperProps} props={props} clientId={clientId} tagName={tagName}/>
            )}
            blockCss={blockCss}
        />
    ), [clientId, blockCss, attributes['wpbs-style']]);


    const SafeStyleEditorUI = ({props, styleRef, updateStyleSettings}) => {
        const {StyleEditorUI} = window.WPBS_StyleEditor || {};

        if (!StyleEditorUI) {
            // still not loaded, render inert placeholder
            return <div className="wpbs-style-editor-loading">Loading style editor…</div>;
        }

        return (
            <StyleEditorUI
                props={props}
                styleRef={styleRef}
                updateStyleSettings={updateStyleSettings}
            />
        );
    };

    return (
        <>
            {memoizedComponent}
            <InspectorControls group="styles">
                <SafeStyleEditorUI
                    props={props}
                    styleRef={styleRef}
                    updateStyleSettings={updateStyleSettings}
                />
            </InspectorControls>
            <InspectorControls group="advanced">
                <Grid columns={1} columnGap={15} rowGap={20} style={{padding: '15px 0'}}>
                    <Grid columns={2} columnGap={15} rowGap={20}>
                        <ElementTagControl
                            value={advanced?.tagName ?? 'div'}
                            label="HTML Tag"
                            onChange={(tag) => updateAdvancedSetting({tagName: tag})}
                        />
                    </Grid>

                    <Grid columns={2} columnGap={15} rowGap={20}>
                        <ToggleControl
                            __nextHasNoMarginBottom
                            label="Hide if Empty"
                            checked={!!advanced?.['hide-empty']}
                            onChange={(checked) => updateAdvancedSetting({'hide-empty': checked})}
                        />
                        <ToggleControl
                            __nextHasNoMarginBottom
                            label="Required"
                            checked={!!advanced?.required}
                            onChange={(checked) => updateAdvancedSetting({required: checked})}
                        />
                    </Grid>

                    <Grid columns={2} columnGap={15} rowGap={20}>
                        <ToggleControl
                            __nextHasNoMarginBottom
                            label="Offset Header"
                            checked={!!advanced?.['offset-header']}
                            onChange={(checked) => updateAdvancedSetting({'offset-header': checked})}
                        />
                        <ToggleControl
                            __nextHasNoMarginBottom
                            label="Container"
                            checked={!!advanced?.container}
                            onChange={(checked) => updateAdvancedSetting({container: checked})}
                        />
                    </Grid>
                </Grid>
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
            {...getDataProps(props)}
            BlockWrapper={(wrapperProps) => (
                <BlockWrapper {...wrapperProps} props={props} clientId={clientId} isSave/>
            )}
            styleData={styleData}
        />
    );
};





