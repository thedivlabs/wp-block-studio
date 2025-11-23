import {useCallback} from "@wordpress/element";
import {__experimentalToolsPanel as ToolsPanel} from "@wordpress/components";
import {Field} from "Components/Field";

export const HoverFields = ({
                                label = "Hover",
                                settings = {},
                                suppress = [],
                                updateFn,
                            }) => {
    const {hoverFieldsMap: map = []} = window?.WPBS_StyleEditor ?? {};

    const onUpdate = useCallback(
        (slug, value) => {
            updateFn({[slug]: value});
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
                        callback={(value) => onUpdate(field.slug, value)}
                        isToolsPanel={true}
                    />
                ))}
        </ToolsPanel>
    );
};
