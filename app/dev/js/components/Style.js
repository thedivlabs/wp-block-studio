import {useState, useEffect, useMemo, useRef, Fragment, useCallback} from '@wordpress/element';
import {InspectorControls, useBlockProps} from '@wordpress/block-editor';
import {Background} from "Components/Background.js";
import {PanelBody} from "@wordpress/components";
import _ from 'lodash';


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
                setAttributes,
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

export const withStyle = (EditComponent, config = {}) => {
    return (props) => {
        const {clientId, isSelected, attributes, setAttributes} = props;
        const styleRef = useRef(null);
        const {parseBlockStyles} = window?.WPBS_StyleControls ?? {};
        const prevAttributes = useRef(null);

        const {'wpbs-style': settings = {}} = attributes;


        useEffect(() => {
            // Deep compare with previous attributes to avoid redundant parsing
            if (
                typeof parseBlockStyles === 'function' &&
                !_.isEqual(prevAttributes.current, attributes['wpbs-style'])
            ) {
                parseBlockStyles({clientId, attributes, styleRef});
                prevAttributes.current = _.cloneDeep(attributes['wpbs-style']);
            }
        }, [clientId, attributes, parseBlockStyles]);

        const styleBlockProps = (userProps = {}) => {

            return useBlockProps({
                ...userProps,
                className: getClassNames(props, userProps),
            });
        };

        return (
            <>
                <EditComponent styleBlockProps={styleBlockProps} {...getComponentProps(props)} />


                {isSelected && <InspectorControls group="styles">
                    <StylePanel
                        clientId={clientId}
                        attributes={attributes}
                        setAttributes={setAttributes}
                    />
                </InspectorControls>}

                <style ref={styleRef} data-wpbs-style={clientId}></style>

            </>
        );
    };
};

export const withStyleSave = (SaveComponent, config = {}) => {

    return (props) => {

        const styleBlockProps = (userProps = {}) => {

            return useBlockProps.save({
                ...userProps,
                className: getClassNames(props, userProps),
            });
        };

        return <SaveComponent styleBlockProps={styleBlockProps} {...getComponentProps(props)} />;
    };
};



