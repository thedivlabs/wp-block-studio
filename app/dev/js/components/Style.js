const withStyle = (EditComponent, config = {}) => {
    return (props) => {
        console.log('withStyle called', config, props);
        // eventually: add useStyleProps, InspectorControls, etc.
        return <EditComponent {...props} />;
    };
};

const withStyleSave = (SaveComponent, config = {}) => {
    return (props) => {
        console.log('withStyleSave called', config, props);
        // eventually: merge classes, styles, etc.
        return <SaveComponent {...props} />;
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
