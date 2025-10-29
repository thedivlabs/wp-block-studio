import {useState, useEffect, useRef, Fragment, useCallback, useMemo} from '@wordpress/element';
import {InspectorControls, useBlockProps, useInnerBlocksProps, InnerBlocks} from '@wordpress/block-editor';
import {Background} from "Components/Background.js";
import {PanelBody} from "@wordpress/components";
import {useInstanceId} from "@wordpress/compose";
import {useSelect} from "@wordpress/data";
import {isEqual, cloneDeep, merge} from 'lodash';

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


/*export const useUniqueId = ({clientId, name, attributes, setAttributes}) => {
    const base = name?.split('/')?.pop() || 'block';
    const currentId = attributes?.uniqueId;

    useEffect(() => {
        if (!currentId && clientId) {
            const newId = `${base}-${clientId.slice(0, 6)}`;
            setAttributes({uniqueId: newId});
        }
    }, [clientId, currentId]);

    return attributes?.uniqueId || `${base}-${clientId.slice(0, 6)}`;
};*/

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

const StylePanel = ({props, styleRef, updateStyleSettings}) => {

    const {clientId, attributes} = props;
    const {uniqueId} = attributes;
    const mountRef = useRef(null);
    const {openStyleEditor} = window?.WPBS_StyleEditor ?? {};
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (isOpen && mountRef.current && openStyleEditor) {
            openStyleEditor(mountRef.current, props, styleRef, updateStyleSettings);
        }
    }, [isOpen, openStyleEditor]);

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

    const {clientId, attributes, setAttributes, name} = props;

    const instanceId = useInstanceId(Component, name?.replace(/\//g, '-') || 'wpbs-block');
    const {uniqueId: currentId} = attributes || {};

    // Recursively walk through blocks to collect all nested wpbs blocks
    const allBlocks = useSelect(
        (select) => {
            const {getBlocks} = select('core/block-editor');

            const flattenBlocks = (blocks) => {
                let result = [];
                for (const b of blocks) {
                    if (b.name?.startsWith('wpbs/')) {
                        result.push(b);
                    }
                    if (b.innerBlocks?.length) {
                        result = result.concat(flattenBlocks(b.innerBlocks));
                    }
                }
                return result;
            };

            return flattenBlocks(getBlocks());
        },
        []
    );


    useEffect(() => {
        if (!clientId) return;

        // Detect duplicates across all nested wpbs blocks
        const hasDuplicate =
            currentId &&
            allBlocks.some(
                (b) => b.clientId !== clientId && b.attributes?.uniqueId === currentId
            );

        if (hasDuplicate || !currentId) {
            console.log('newId', clientId, instanceId);
            setAttributes({uniqueId: instanceId});
        }
    }, [clientId, currentId, instanceId, allBlocks, name, setAttributes]);


    const blockCss = useCallback((newProps) => {
        cssPropsRef.current = newProps;
    }, []);


    const updateStyleSettings = useCallback(
        (newProps) => {
            const currentStyle = attributes['wpbs-style'] || {};
            const currentCss = attributes['wpbs-css'] || {};

            const nextStyle = newProps['wpbs-style'] || {};
            const nextCss = newProps['wpbs-css'] || {};

            // merge in block-level css
            const mergedCss = merge({}, cssPropsRef.current, nextCss);

            // avoid redundant updates
            const isSameStyle = isEqual(currentStyle, nextStyle);
            const isSameCss = isEqual(currentCss, mergedCss);
            if (isSameStyle && isSameCss) return;

            // update both attributes
            setAttributes({
                'wpbs-style': cloneDeep(nextStyle),
                'wpbs-css': cloneDeep(mergedCss),
            });
        },
        [setAttributes]
    );

    useEffect(() => {
        if (styleRef.current) {
            window.WPBS_StyleEditor.updateStyleString(props, styleRef);
        }
    }, [attributes?.['wpbs-css']]);


    return (
        <>
            <Component
                {...getComponentProps(props)}
                BlockWrapper={(wrapperProps) => (
                    <BlockWrapper {...wrapperProps} props={props} clientId={clientId}/>
                )}
                blockCss={blockCss}
            />

            <InspectorControls group="styles">
                <StylePanel props={props} styleRef={styleRef} updateStyleSettings={updateStyleSettings}/>
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





