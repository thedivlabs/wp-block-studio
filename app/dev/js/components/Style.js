import {Fragment, useCallback, useEffect, useMemo, useRef, useState} from '@wordpress/element';
import {InnerBlocks, InspectorControls, useBlockProps, useInnerBlocksProps} from '@wordpress/block-editor';
import {ElementTagControl, getElementTag} from "Components/ElementTag";
import {StyleEditorUI} from "Includes/style";
import {isEqual} from 'lodash';
import {__experimentalGrid as Grid, ToggleControl,} from "@wordpress/components";
import {useInstanceId} from "@wordpress/compose";
import {select, subscribe} from "@wordpress/data";

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

const API = window?.WPBS_StyleEditor ?? {};
const {getCSSFromStyle, cleanObject, updateStyleString, parseSpecialProps} = API;

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

const BlockWrapper = ({
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

const AdvancedControls = ({settings, callback}) => {
    return <Grid columns={1} columnGap={15} rowGap={20} style={{padding: '15px 0'}}>
        <Grid columns={2} columnGap={15} rowGap={20}>
            <ElementTagControl
                value={settings?.tagName ?? 'div'}
                label="HTML Tag"
                onChange={(tag) => callback({tagName: tag})}
            />
        </Grid>

        <Grid columns={2} columnGap={15} rowGap={20}>
            <ToggleControl
                __nextHasNoMarginBottom
                label="Hide if Empty"
                checked={!!settings?.['hide-empty']}
                onChange={(checked) => callback({'hide-empty': checked})}
            />
            <ToggleControl
                __nextHasNoMarginBottom
                label="Required"
                checked={!!settings?.required}
                onChange={(checked) => callback({required: checked})}
            />
        </Grid>

        <Grid columns={2} columnGap={15} rowGap={20}>
            <ToggleControl
                __nextHasNoMarginBottom
                label="Offset Header"
                checked={!!settings?.['offset-header']}
                onChange={(checked) => callback({'offset-header': checked})}
            />
            <ToggleControl
                __nextHasNoMarginBottom
                label="Container"
                checked={!!settings?.container}
                onChange={(checked) => callback({container: checked})}
            />
        </Grid>
    </Grid>
}

export const withStyle = (Component) => (props) => {

    const styleRef = useRef(null);
    const cssPropsRef = useRef({});

    const {clientId, attributes, setAttributes, tagName, name} = props;

    const {
        uniqueId,
        'wpbs-style': settings = {props: {}, breakpoints: {}, advanced: {}, hover: {}, background: {}}
    } = attributes;

    const {advanced = {}} = settings || {};

    const {style: styleAttrs = {}} = attributes;

    const [localSettings = {}, setLocalSettings] = useState(settings);

    const baseName = name.replace('/', '-');

    const instanceId = useInstanceId(withStyle, baseName);


    const blockCss = useCallback((newProps) => {
        //console.log('blockCss');
        cssPropsRef.current = newProps;
    }, []);

    useEffect(() => {
        const cleanedLocal = cleanObject(localSettings, true);

        const cssObj = {
            props: parseSpecialProps(cleanedLocal.props || {}),
            breakpoints: {},
            hover: {},
        };

        for (const [bpKey, bpProps] of Object.entries(cleanedLocal.breakpoints || {})) {
            cssObj.breakpoints[bpKey] = parseSpecialProps(bpProps);
        }

        if (cleanedLocal.hover) {
            cssObj.hover = parseSpecialProps(cleanedLocal.hover);
        }

        const cleanedCss = cleanObject(cssObj, true);

        if (
            isEqual(cleanedLocal, cleanObject(settings, true)) &&
            isEqual(cleanedCss, cleanObject(cssObj, true))
        ) {
           return;
        }

        setAttributes({
            'wpbs-style': localSettings,
            'wpbs-css': cleanedCss,
        });
    }, [localSettings, uniqueId]);

    const updateStyleSettings = useCallback(
        (layoutState) => {
            if (isEqual(localSettings, layoutState)) {
                return
            }

            setLocalSettings(layoutState);

        },
        [localSettings, setAttributes]
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
            const css = updateStyleString(props, styleRef);
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
    ), [clientId, blockCss, localSettings, styleAttrs, uniqueId]);

    const memoizedStyleEditor = useMemo(() => (
        <StyleEditorUI
            settings={localSettings}
            updateStyleSettings={updateStyleSettings}
        />
    ), [localSettings]);

    return (
        <>
            {memoizedComponent}
            <InspectorControls group="styles">
                {memoizedStyleEditor}
            </InspectorControls>
            <InspectorControls group="advanced">
                <AdvancedControls settings={advanced} callback={updateAdvancedSetting}/>
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





