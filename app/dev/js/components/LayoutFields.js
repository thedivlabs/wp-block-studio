import {useCallback} from "@wordpress/element";
import {__experimentalToolsPanel as ToolsPanel} from "@wordpress/components";
import {Field} from "Components/Field";

export const LayoutFields = ({
                                 label = "Settings",
                                 settings = {},
                                 suppress = [],
                                 updateFn
                             }) => {
    const {layoutFieldsMap: map = []} = window?.WPBS_StyleEditor ?? {};

    // Single-object update system: Field already sends { slug: value }
    const onUpdate = useCallback(
        (valueObj) => {
            updateFn(valueObj);
        },
        [updateFn]
    );

    return (
        <ToolsPanel
            label={label}
            resetAll={() => updateFn({}, true)}
        >
            {map
                .filter((f) => !suppress.includes(f.slug))
                .map((field) => (
                    <Field
                        key={field.slug}
                        field={field}
                        settings={settings}
                        isToolsPanel={true}

                        // valueObj is already { slug: something }
                        callback={onUpdate}
                    />
                ))}
        </ToolsPanel>
    );
};
