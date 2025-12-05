import "./scss/block.scss";

import {registerBlockType} from "@wordpress/blocks";
import metadata from "./block.json";

import {SliderInspector} from "./controls";
import {STYLE_ATTRIBUTES, withStyle, withStyleSave} from "Components/Style";
import {useCallback, useMemo} from "@wordpress/element";
import {isEqual} from "lodash";
import {cleanObject} from "Includes/helper";

const selector = "wpbs-slider";

const getClassNames = (attributes = {}, settings = {}) => {
    return [
        selector,
        "h-auto w-full max-h-full flex flex-col swiper",
    ]
        .filter(Boolean)
        .join(" ");
};

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...STYLE_ATTRIBUTES,
        "wpbs-slider": {
            type: "object",
            default: {props: {}, breakpoints: {}},
        },
    },

    edit: withStyle((props) => {
        const {attributes, BlockWrapper, setAttributes} = props;

        const settings = attributes["wpbs-slider"];
        const classNames = getClassNames(attributes, settings);

        // Update wpbs-slider attribute
        const updateSettings = useCallback(
            (nextValue) => {
                if (!isEqual(settings, nextValue)) {
                    setAttributes({"wpbs-slider": nextValue});
                }
            },
            [settings, setAttributes]
        );

        const inspectorPanel = useMemo(
            () => <SliderInspector attributes={attributes} updateSettings={updateSettings}/>,
            [settings, updateSettings]
        );

        return (
            <>
                {inspectorPanel}
                <BlockWrapper props={props} className={classNames}/>
            </>
        );
    }, {
        hasChildren: true,
        hasBackground: false,
    }),

// block.js
    save: withStyleSave((props) => {
        const {attributes, BlockWrapper} = props;
        const settings = attributes["wpbs-slider"];
        const classNames = getClassNames(attributes, settings);

        return (
            <BlockWrapper
                className={classNames}
                data-wp-interactive="wpbs/slider"
                data-wp-init="actions.observe" // ← auto-call the callback
                data-wp-context={JSON.stringify(settings || {})}
            />
        );
    }, {
        hasChildren: true,
        hasBackground: false,
    }),

});
