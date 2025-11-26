import {useCallback} from "@wordpress/element";
import {
    __experimentalToolsPanel as ToolsPanel,
} from "@wordpress/components";
import {Field} from "Components/Field";

export const LayoutFields = ({
                                 label = "Settings",
                                 settings = {},
                                 suppress = [],
                                 updateFn,
                             }) => {
    const {layoutFieldsMap: map = []} = window?.WPBS_StyleEditor ?? {};

    // Field now always emits a patch object, e.g. { "justify-content": "center" }
    const onUpdate = useCallback(
        (patch) => {
            if (!patch || typeof patch !== "object") return;
            updateFn(patch);
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
                        callback={onUpdate}
                        isToolsPanel={true}
                    />
                ))}
        </ToolsPanel>
    );
};
