import { useBlockProps } from '@wordpress/block-editor';

const getSettingsData = (props) => {
    const { attributes } = props;
    const style = attributes['wpbs-style'] || {};
    const background = style.background || {};
    const layout = style.layout || {};

    return {
        hasBackground: !!background.type,
        hasContainer: !!layout.container || !!background.type,
        background,
        layout,
    };
};


const styleClassNames = (props)=>{

    const {attributes} = props;

    const {uniqueId} = attributes;

    return [uniqueId].filter(Boolean).join(' ');

}

const withStyle = (EditComponent, config = {}) => {
    return (props) => {
        console.log('withStyle called', config, props);
        // eventually: add useStyleProps, InspectorControls, etc.
        return <EditComponent {...props} styleData={getSettingsData(props)} />;
    };
};

const withStyleSave = (SaveComponent, config = {}) => {

    return (props) => {
        console.log('withStyleSave called', config, props);

        const {attributes} = props;

        const {uniqueId} = attributes;

        const saveStyleProps = (userProps = {}) => {
            const mergedClassName = [styleClassNames(props), userProps.className]
                .filter(Boolean)
                .join(' ');

            return useBlockProps.save({
                ...userProps,
                className: mergedClassName,
                'data-style-id': uniqueId,
            });
        };

        // eventually: merge classes, styles, etc.
        return <SaveComponent {...props} saveStyleProps={saveStyleProps} />;
    };
};


export default class WPBS_Style {
    constructor() {
        this.withStyle = withStyle;
        this.withStyleSave = withStyleSave;
    }

    init() {

        if (window.WPBS?.Style) {
            console.warn('WPBS.Style already defined, skipping reinit.');
            return window.WPBS.Style;
        }

        // Ensure WPBS namespace exists
        if (!window.WPBS) {
            window.WPBS = {};
        }

        // Attach this module
        window.WPBS.Style = {
            withStyle: this.withStyle,
            withStyleSave: this.withStyleSave,
        };

        return window.WPBS.Style;
    }
}
