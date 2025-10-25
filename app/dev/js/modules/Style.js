import {useState, useEffect, useMemo, useRef, Fragment, useCallback} from '@wordpress/element';
import {InspectorControls, useBlockProps} from '@wordpress/block-editor';
import {Background} from "Components/Background.js";
import {StyleControls, StyleEditorUI} from 'Components/StyleControls'

const getComponentProps = (props) => {
    const {attributes} = props;
    const style = attributes['wpbs-style'] || {};
    const background = style.background || {};
    const layout = style.layout || {};

    const data = Object.fromEntries(Object.entries({
        hasBackground: !!background.type,
        hasContainer: !!layout.container || !!background.type,
        background,
        layout,
    }).filter(Boolean));


    return {
        ...props,
        styleData: data,
        Background: data?.hasBackground ? Background : Fragment,
        ElementTagName: 'div'
    }
}

const getClassNames = (props, userProps) => {

    const {attributes} = props;

    const {uniqueId} = attributes;


    return [
        uniqueId,
        userProps.className
    ].filter(Boolean).join(' ');

}

const openStyleEditor = ({
                             mountNode,
                             clientId,
                             attributes,
                             setAttributes,
                         }) => {

    if (!mountNode || !mountNode.classList.contains('wpbs-style-placeholder')) return;

    // Close any existing editor
    if (window.WPBS_Style?.activeRoot) {
        window.WPBS_Style.activeRoot.unmount();
        window.WPBS_Style.activeRoot = null;
    }

    const root = wp.element.createRoot(mountNode);

    const close = () => {
        if (window.WPBS_Style.activeRoot) {
            root.unmount();
            window.WPBS_Style.activeRoot = null;
        }
        // Restore placeholder
        mountNode.innerHTML = '';
        unsubscribeSelection();
        document.removeEventListener('keydown', escListener);
    };

    // Mount your editor
    root.render(
        wp.element.createElement(StyleEditorUI, {
            clientId,
            attributes,
            setAttributes,
            onClose: close,
        })
    );

    window.WPBS_Style.activeRoot = root;

    // --- Auto-close when block deselected or deleted ---
    const unsubscribeSelection = wp.data.subscribe(() => {
        const selectedId = wp.data.select('core/block-editor').getSelectedBlockClientId();
        const block = wp.data.select('core/block-editor').getBlock(clientId);
        if (selectedId !== clientId || !block) close();
    });

    // --- Close on Escape key ---
    const escListener = (e) => e.key === 'Escape' && close();
    document.addEventListener('keydown', escListener);
};

const withStyle = (EditComponent, config = {}) => {
    return (props) => {
        const {clientId, isSelected, attributes, setAttributes} = props;

        const editStyleProps = (userProps = {}) => {

            return useBlockProps({
                ...userProps,
                className: getClassNames(props, userProps),
            });
        };

        return (
            <>
                <EditComponent styleBlockProps={editStyleProps} {...getComponentProps(props)} />


                {isSelected && <InspectorControls group="styles">
                    <StyleControls
                        clientId={clientId}
                        attributes={attributes}
                        setAttributes={setAttributes}
                    />
                </InspectorControls>}

            </>
        );
    };
};

const withStyleSave = (SaveComponent, config = {}) => {

    return (props) => {

        const saveStyleProps = (userProps = {}) => {

            return useBlockProps.save({
                ...userProps,
                className: getClassNames(props, userProps),
            });
        };

        return <SaveComponent styleBlockProps={saveStyleProps} {...getComponentProps(props)} />;
    };
};


export default class WPBS_Style {
    constructor() {

        this.withStyle = withStyle;
        this.withStyleSave = withStyleSave;
        this.openStyleEditor = openStyleEditor;

        if (window.WPBS_Style) {
            console.warn('WPBS.Style already defined, skipping reinit.');
            return window.WPBS_Style;
        }

        this.init();
    }

    init() {

        if (!window.WPBS_Style) {
            window.WPBS_Style = {};
        }

        window.WPBS_Style = this;

        return window.WPBS_Style;
    }
}
