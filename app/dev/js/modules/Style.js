import {useState, useEffect, useMemo, useRef, Fragment, useCallback} from '@wordpress/element';
import {InspectorControls, useBlockProps} from '@wordpress/block-editor';
import {Background} from "Components/Background.js";
import {StyleControls, StyleEditorUI, openStyleEditor} from 'Components/StyleControls'

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
                <InspectorControls group="styles">
                    <StyleControls
                        clientId={clientId}
                        attributes={attributes}
                        setAttributes={setAttributes}
                    />
                </InspectorControls>

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

        // eventually: merge classes, styles, etc.
        return <SaveComponent styleBlockProps={saveStyleProps} {...getComponentProps(props)} />;
    };
};


export default class WPBS_Style {
    constructor() {

        if (window.WPBS_Style) {
            console.warn('WPBS.Style already defined, skipping reinit.');
            return window.WPBS_Style;
        }

        this.init();
    }

    init() {

        // Ensure WPBS namespace exists
        if (!window.WPBS_Style) {
            window.WPBS_Style = {};
        }

        // Attach this module
        window.WPBS_Style = {
            withStyle: withStyle,
            withStyleSave: withStyleSave,
            openStyleEditor: openStyleEditor,
        };

        console.log(WPBS_Style);

        return window.WPBS_Style;
    }
}
