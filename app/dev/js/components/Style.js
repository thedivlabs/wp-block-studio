import {useState, useEffect, useRef, Fragment, useCallback} from '@wordpress/element';
import {InspectorControls, useBlockProps, useInnerBlocksProps, InnerBlocks} from '@wordpress/block-editor';
import {Background} from "Components/Background.js";
import {PanelBody} from "@wordpress/components";
import _ from 'lodash';
import {useInstanceId} from "@wordpress/compose";

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
import {cleanObject} from 'Includes/helper';

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

const getBlockProps = (props = {}, userProps = {}, uniqueId) => {
    const {attributes = {}, name} = props;
    const {className: userClass, ...restUserProps} = userProps;
    const {'wpbs-style': settings = {}} = attributes;
    const {layout = {}, background = {}, hover = {}} = settings;

    // Construct class list
    const classList = [
        name ? name.replace('/', '-') : null,
        uniqueId || attributes?.uniqueId || null,
        userClass,
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
    ].filter(Boolean).join(' ');

    // Return an extendable HTML prop object
    return {
        className: classList,
        ...restUserProps,
    };
};

const StylePanel = ({attributes, setAttributes, clientId}) => {
    const [isOpen, setIsOpen] = useState(false);
    const mountRef = useRef(null);

    const {openStyleEditor} = window?.WPBS_StyleControls ?? {};

    useEffect(() => {
        if (
            isOpen &&
            mountRef.current &&
            openStyleEditor
        ) {
            openStyleEditor({
                mountNode: mountRef.current,
                clientId,
                attributes,
                onChange: (newStyle) => {
                    setAttributes({'wpbs-style': newStyle});
                },
            });

        }
    }, [isOpen, attributes, setAttributes, clientId]);

    return (
        <PanelBody
            title="Layout"
            initialOpen={false}
            className="wpbs-layout-tools"
            onToggle={(nextOpen) => setIsOpen(nextOpen)}
        >
            <div
                ref={mountRef}
                className="wpbs-style-placeholder"
                data-client-id={clientId}
                style={{padding: '4px 0'}}
            ></div>
        </PanelBody>
    );
};

export const BlockWrapper = ({
                                 props,
                                 className,
                                 children,
                                 hasTag = true,
                                 hasBackground,
                                 isSave = false, // <— key difference
                                 ...userProps
                             }) => {
    const {attributes} = props;
    const {'wpbs-style': settings = {}} = attributes;
    const uniqueId = attributes?.uniqueId;
    const Tag = hasTag ? settings?.tagName ?? 'div' : Fragment;
    const hasContainer = settings?.layout?.container || settings?.background?.type;

    const containerClass = [
        uniqueId ? `${uniqueId}__container` : null,
        'wpbs-layout-wrapper wpbs-container w-full h-full relative z-20',
    ]
        .filter(Boolean)
        .join(' ');

    // For save vs editor environments:
    const blockProps = isSave
        ? useBlockProps.save({
            ...userProps,
            ...getBlockProps(props, userProps, uniqueId),
        })
        : useBlockProps({
            ...userProps,
            ...getBlockProps(props, userProps, uniqueId),
        });

    // Editor uses hooks; save uses static <InnerBlocks.Content />
    if (isSave) {
        return (
            <Tag {...blockProps} >
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

    // Editor version (live hooks)
    const containerProps = {className: containerClass};
    const innerBlocksProps = hasContainer
        ? useInnerBlocksProps(containerProps, {})
        : useInnerBlocksProps(blockProps, {});

    return (
        <Tag {...blockProps} >
            {hasContainer || hasBackground ? <div {...innerBlocksProps} /> : innerBlocksProps.children}
            {hasBackground && <Background/>}
            {children}
        </Tag>
    );
};


export const withStyle = (EditComponent, config = {}) => {
    return (props) => {
        const {clientId, isSelected, attributes, setAttributes, name} = props;
        const styleRef = useRef(null);
        const {parseBlockStyles} = window?.WPBS_StyleControls ?? {};
        const prevAttributes = useRef(null);

        const {settings = {}} = attributes;

        const uniqueId = useUniqueId({name, attributes});

        const [layoutSettings, setLayoutSettings] = useState(settings?.layout ?? {});

        const BoundBlockWrapper = useCallback(
            (wrapperProps) => (
                <BlockWrapper
                    {...wrapperProps}
                    props={props}
                    clientId={clientId}
                    uniqueId={uniqueId}
                    hasContainer={config.container}
                    hasBackground={config.background}
                />
            ),
            [clientId, uniqueId, attributes, config]
        );

        useEffect(() => {
            const {uniqueId: currentId} = attributes;
            if (!currentId) return;

            const {getBlocks} = wp.data.select('core/block-editor');
            const blocks = getBlocks();
            const duplicates = blocks.filter(
                b => b.attributes?.uniqueId === currentId && b.clientId !== clientId
            );

            if (duplicates.length > 0) {
                const newId = `${currentId}-${clientId.slice(0, 5)}`;
                setAttributes({uniqueId: newId});
            }
        }, []); // once on mount

        useEffect(() => {
            if (typeof parseBlockStyles === 'function' && !_.isEqual(prevAttributes.current, settings)) {
                try {
                    parseBlockStyles({uniqueId, props, styleRef});
                    prevAttributes.current = _.cloneDeep(settings);
                } catch (err) {
                    console.warn('WPBS parse error:', err);
                }
            }
        }, [uniqueId, settings, parseBlockStyles]);

        useEffect(() => {
            const newStyle = cleanObject({
                layout: layoutSettings,
            });

            const needsStyleUpdate = !_.isEqual(settings, newStyle);

            if (needsStyleUpdate) {
                setAttributes({
                    ...(needsStyleUpdate ? {'wpbs-style': newStyle} : {}),
                });
            }
        }, [
            layoutSettings,
            uniqueId,
            settings,
            setAttributes,
        ]);

        return (
            <>
                <EditComponent BlockWrapper={BoundBlockWrapper} {...getComponentProps(props)} />


                {isSelected && <InspectorControls group="styles">
                    <StylePanel
                        clientId={clientId}
                        attributes={attributes}
                        setAttributes={setAttributes}
                    />
                </InspectorControls>}

                <style ref={styleRef} id={`wpbs-style-${clientId}`}></style>

            </>
        );
    };
};

export const withStyleSave = (SaveComponent, config = {}) => {
    return (props) => {
        const {attributes, name} = props;
        const {'wpbs-style': styleData = {}} = attributes;

        const BoundBlockWrapper = (wrapperProps) => (
            <BlockWrapper
                {...wrapperProps}
                props={props}
                uniqueId={attributes?.uniqueId}
                hasContainer={config.container}
                hasBackground={config.background}
                isSave={true}
            />
        );

        return (
            <SaveComponent
                {...getComponentProps(props)}
                BlockWrapper={BoundBlockWrapper}
                styleData={styleData}
            />
        );
    };
};




