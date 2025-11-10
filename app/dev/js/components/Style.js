import {Fragment, useCallback, useEffect, useMemo, useRef, useState} from '@wordpress/element';
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
    'uniqueId': { type: 'string' },
    'wpbs-css': { type: 'object', default: {} },
    'wpbs-preload': { type: 'array' },
    'wpbs-style': { type: 'object', default: {} },
};

const API = window?.WPBS_StyleEditor ?? {};
const { getCSSFromStyle, cleanObject, parseSpecialProps, parseBackgroundProps } = API;

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

    return { ...props, styleData: data };
};

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
        style: { ...blockStyle, ...styleList },
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
            </Tag>
        );
    }

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
                </div>
                {children}
            </Tag>
        );
    }

    const innerProps = useInnerBlocksProps(blockProps, {});
    const Background = useMemo(() => (<BackgroundElement {...props} />), []);

    return (
        <Tag {...innerProps}>
            {innerProps.children}
            {children}
            {Background}
        </Tag>
    );
};

const AdvancedControls = ({settings, callback}) => (
    <Grid columns={1} columnGap={15} rowGap={20} style={{padding: '15px 0'}}>
        <Grid columns={2} columnGap={15} rowGap={20}>
            <ElementTagControl
                value={settings?.tagName ?? 'div'}
                label="HTML Tag"
                onChange={(tag) => callback({ ...settings, tagName: tag })}
            />
        </Grid>

        <Grid columns={2} columnGap={15} rowGap={20}>
            <ToggleControl
                __nextHasNoMarginBottom
                label="Hide if Empty"
                checked={!!settings?.['hide-empty']}
                onChange={(checked) => callback({ ...settings, 'hide-empty': checked })}
            />
            <ToggleControl
                __nextHasNoMarginBottom
                label="Required"
                checked={!!settings?.required}
                onChange={(checked) => callback({ ...settings, required: checked })}
            />
        </Grid>

        <Grid columns={2} columnGap={15} rowGap={20}>
            <ToggleControl
                __nextHasNoMarginBottom
                label="Offset Header"
                checked={!!settings?.['offset-header']}
                onChange={(checked) => callback({ ...settings, 'offset-header': checked })}
            />
            <ToggleControl
                __nextHasNoMarginBottom
                label="Container"
                checked={!!settings?.container}
                onChange={(checked) => callback({ ...settings, container: checked })}
            />
        </Grid>
    </Grid>
);

export const withStyle = (Component) => (props) => {
    const cssPropsRef = useRef({});
    const { clientId, attributes, setAttributes, tagName, isSelected } = props;
    const { uniqueId } = attributes;

    // --- Local style state mirrors wpbs-style
    const [settings, setSettings] = useState(attributes?.['wpbs-style'] ?? {
        props: {},
        breakpoints: {},
        advanced: {},
        hover: {},
        background: {},
    });

    const blockCss = useCallback((newProps = {}) => {
        cssPropsRef.current = newProps || {};
    }, []);

    // --- Sync settings -> attributes + wpbs-css
    useEffect(() => {
        const cleanedLocal = cleanObject(settings, true);
        const currentAttrStyle = cleanObject(attributes?.['wpbs-style'] ?? {}, true);

        if (isEqual(cleanedLocal, currentAttrStyle)) return;

        const cssObj = {
            props: parseSpecialProps(cleanedLocal.props || {}),
            background: parseBackgroundProps(cleanedLocal.background || {}),
            hover: {},
            breakpoints: {},
            custom: cleanObject(cssPropsRef.current || {}, true),
        };

        for (const [bpKey, bpProps] of Object.entries(cleanedLocal.breakpoints || {})) {
            cssObj.breakpoints[bpKey] = {
                props: parseSpecialProps(bpProps.props || {}),
                background: parseBackgroundProps(bpProps.background || {}),
            };
        }

        if (cleanedLocal.hover) {
            cssObj.hover = parseSpecialProps(cleanedLocal.hover);
        }

        const cleanedCss = cleanObject(cssObj, true);
        const prevCss = cleanObject(attributes?.['wpbs-css'] ?? {}, true);

        if (isEqual(cleanedCss, prevCss)) return;

        setAttributes({
            'wpbs-style': settings,
            'wpbs-css': cleanedCss,
        });
    }, [settings, setAttributes]);

    // --- UI sends full object -> update local settings
    const updateStyleSettings = useCallback(
        (nextLayout) => {
            if (_.isEqual(cleanObject(nextLayout, true), cleanObject(settings, true))) return;
            setSettings(nextLayout);
        },
        [settings]
    );

    const memoizedComponent = useMemo(
        () => (
            <Component
                {...getDataProps(props)}
                BlockWrapper={(wrapperProps) => (
                    <BlockWrapper {...wrapperProps} props={props} clientId={clientId} />
                )}
            />
        ),
        [clientId, settings, uniqueId]
    );

    const memoizedStyleEditor = useMemo(
        () => (
            <StyleEditorUI
                settings={settings}
                updateStyleSettings={updateStyleSettings}
            />
        ),
        [settings, updateStyleSettings]
    );

    return (
        <>
            {memoizedComponent}

            <InspectorControls group="styles">
                {isSelected && memoizedStyleEditor}
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
    const { attributes, clientId } = props;
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