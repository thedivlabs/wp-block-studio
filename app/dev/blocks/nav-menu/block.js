import {registerBlockType} from "@wordpress/blocks";
import metadata from "./block.json";

import {STYLE_ATTRIBUTES, withStyle, withStyleSave} from "Components/Style";
import {InspectorControls} from "@wordpress/block-editor";
import {PanelBody, SelectControl} from "@wordpress/components";
import {useSelect} from "@wordpress/data";
import {useCallback} from "@wordpress/element";
import {isEqual} from "lodash/isEqual";

const selector = "nav-menu";

const getClassNames = (attributes = {}, styleData) => {
    return [
        selector,
        "w-full",
        "block",
        "relative",
    ]
        .filter(Boolean)
        .join(" ");
};

registerBlockType(metadata.name, {
    apiVersion: 3,

    attributes: {
        ...metadata.attributes,
        ...STYLE_ATTRIBUTES,
        "nav-menu": {
            type: "object",
            default: {},
        },
    },

    edit: withStyle(
        (props) => {
            const {attributes, setAttributes, BlockWrapper, styleData} = props;
            const settings = attributes["nav-menu"] ?? {};

            /* --------------------------------------------
             * Fetch menus
             * -------------------------------------------- */
            const menus = useSelect((select) => {
                const core = select("core");
                const data = core.getMenus?.();

                if (!core.hasFinishedResolution("getMenus")) {
                    return [];
                }

                return (data || []).map((menu) => ({
                    label: menu.name,
                    value: menu.id,
                }));
            }, []);


            const updateSettings = useCallback(
                (next) => {
                    const updated = {
                        ...settings,
                        ...next,
                    };

                    if (isEqual(settings, updated)) {
                        return;
                    }

                    setAttributes({
                        "nav-menu": updated,
                    });
                },
                [settings, setAttributes]
            );


            const classNames = getClassNames(attributes, styleData);

            return (
                <>
                    <InspectorControls>
                        <PanelBody title="Menu" initialOpen={true}>
                            <SelectControl
                                label="Select Menu"
                                value={settings.menu ?? ""}
                                options={[
                                    {label: "Select", value: ""},
                                    ...menus,
                                ]}
                                onChange={(value) =>
                                    updateSettings({menu: value})
                                }
                            />
                        </PanelBody>
                    </InspectorControls>

                    <BlockWrapper
                        props={props}
                        className={classNames}
                    />
                </>
            );
        },
        {
            hasChildren: true,
            hasBackground: true,
        }
    ),

    save: withStyleSave(
        (props) => {
            const {attributes, styleData, BlockWrapper} = props;
            const classNames = getClassNames(attributes, styleData);

            return (
                <BlockWrapper
                    props={props}
                    className={classNames}
                />
            );
        },
        {
            hasChildren: true,
            hasBackground: true,
        }
    ),
});
