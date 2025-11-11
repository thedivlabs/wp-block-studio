import {Fragment, memo, useCallback, useEffect, useMemo, useRef, useState} from '@wordpress/element';
import {
    InnerBlocks,
    InspectorControls,
    useBlockProps,
    useInnerBlocksProps
} from '@wordpress/block-editor';
import {ElementTagControl, getElementTag} from "Components/ElementTag";
import {StyleEditorUI} from "Includes/style";
import {BackgroundElement} from "Components/Background";
import _, {isEqual} from 'lodash';
import {
    __experimentalGrid as Grid,
    ToggleControl,
} from "@wordpress/components";

export const STYLE_ATTRIBUTES = {
    'uniqueId': {type: 'string'},
    'wpbs-css': {type: 'object', default: {}},
    'wpbs-preload': {type: 'array'},
    'wpbs-style': {type: 'object', default: {}},
};

const API = window?.WPBS_StyleEditor ?? {};
const {getCSSFromStyle, cleanObject, parseSpecialProps, parseBackgroundProps} = API;

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

    return {...props, styleData: data};
};

const getBlockProps = (props = {}, wrapperProps = {}) => {
    const {attributes = {}, name} = props;
    const {className: userClass = '', style: blockStyle = {}, ...restWrapperProps} = wrapperProps;
    const {'wpbs-style': settings = {}, uniqueId, style: attrStyle = {}} = attributes;
    const {props: layout = {}, background = {}, hover = {}} = settings;
    const hasBackground =
        !!(background && (background.type || background.image || background.video));


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
        layout['container'] && '--container',
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

const BlockWrapper = ({
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
    const Tag = getElementTag(advanced?.tagName, tagName);

    const isBackgroundActive = hasBackground && settings?.background?.type;
    const isContainer = settings?.advanced?.container;
    const hasContainer = isContainer || isBackgroundActive;

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

const AdvancedControls = ({settings, callback}) => (
    <Grid columns={1} columnGap={15} rowGap={20} style={{padding: '15px 0'}}>
        <Grid columns={2} columnGap={15} rowGap={20}>
            <ElementTagControl
                value={settings?.tagName ?? 'div'}
                label="HTML Tag"
                onChange={(tag) => callback({...settings, tagName: tag})}
            />
        </Grid>

        <Grid columns={2} columnGap={15} rowGap={20}>
            <ToggleControl
                __nextHasNoMarginBottom
                label="Hide if Empty"
                checked={!!settings?.['hide-empty']}
                onChange={(checked) => callback({...settings, 'hide-empty': checked})}
            />
            <ToggleControl
                __nextHasNoMarginBottom
                label="Required"
                checked={!!settings?.required}
                onChange={(checked) => callback({...settings, required: checked})}
            />
        </Grid>

        <Grid columns={2} columnGap={15} rowGap={20}>
            <ToggleControl
                __nextHasNoMarginBottom
                label="Offset Header"
                checked={!!settings?.['offset-header']}
                onChange={(checked) => callback({...settings, 'offset-header': checked})}
            />
            <ToggleControl
                __nextHasNoMarginBottom
                label="Container"
                checked={!!settings?.container}
                onChange={(checked) => callback({...settings, container: checked})}
            />
        </Grid>
    </Grid>
);

const StyleEditorPanel = memo(({settings, updateStyleSettings}) => (
    <StyleEditorUI
        settings={settings}
        updateStyleSettings={updateStyleSettings}
    />
));


export const withStyle = (Component) => (props) => {
    const cssPropsRef = useRef({});
    const {clientId, attributes, setAttributes, tagName, isSelected} = props;
    const {uniqueId} = attributes;
    const blockGap = attributes?.style?.spacing?.blockGap;

    const settings = attributes?.['wpbs-style'] ?? {
        props: {},
        breakpoints: {},
        advanced: {},
        hover: {},
        background: {},
    };

    const blockCss = useCallback((newProps = {}) => {
        cssPropsRef.current = newProps || {};
    }, []);

    const StyledComponent = useMemo(() => {
        return (
            <Component
                {...getDataProps(props)}
                BlockWrapper={(wrapperProps) => (
                    <BlockWrapper {...wrapperProps} props={props} clientId={clientId}/>
                )}
            />
        );
    }, [clientId, settings, typeof blockGap === 'object' ? JSON.stringify(blockGap) : blockGap]);


    // --- Reactive version of updateStyleSettings
    const updateStyleSettings = useCallback(
        (nextLayout) => {
            const cleanedNext = cleanObject(nextLayout, true);
            const cleanedCurrent = cleanObject(settings, true);

            // Bail if nothing meaningful changed
            if (_.isEqual(cleanedNext, cleanedCurrent)) return;

            // --- Build CSS object immediately
            const cssObj = {
                props: parseSpecialProps(cleanedNext.props || {}, attributes),
                background: parseBackgroundProps(cleanedNext.background || {}),
                hover: {},
                breakpoints: {},
                custom: cleanObject(cssPropsRef.current || {}, true),
            };

            for (const [bpKey, bpProps] of Object.entries(cleanedNext.breakpoints || {})) {
                cssObj.breakpoints[bpKey] = {
                    props: parseSpecialProps(bpProps.props || {}, attributes),
                    background: parseBackgroundProps(bpProps.background || {}),
                };
            }

            if (cleanedNext.hover) {
                cssObj.hover = parseSpecialProps(cleanedNext.hover, attributes);
            }

            const cleanedCss = cleanObject(cssObj, true);
            const prevCss = cleanObject(attributes?.['wpbs-css'] ?? {}, true);

            // Only update attributes if CSS or style changed
            if (!_.isEqual(cleanedCss, prevCss) || !_.isEqual(cleanedNext, cleanedCurrent)) {
                console.log('setting attributes');
                setAttributes({
                    'wpbs-style': nextLayout, // raw (so "" persists)
                    'wpbs-css': cleanedCss,   // cleaned CSS only
                });
            }
        },
        [settings, setAttributes]
    );

    return (
        <>
            {StyledComponent}
            <InspectorControls group="styles">
                {isSelected && (
                    <StyleEditorPanel
                        settings={settings}
                        updateStyleSettings={updateStyleSettings}
                    />
                )}
            </InspectorControls>
            <InspectorControls group="advanced">
                <AdvancedControls
                    settings={settings?.advanced ?? {}}
                    callback={(nextAdvanced) =>
                        updateStyleSettings({
                            ...settings,
                            advanced: nextAdvanced,
                        })
                    }
                />
            </InspectorControls>
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
                <BlockWrapper props={props} clientId={clientId} isSave={true} {...wrapperProps}/>
            )}
            styleData={styleData}
        />
    );
};