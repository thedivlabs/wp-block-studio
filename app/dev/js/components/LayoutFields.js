import {memo, useCallback} from "@wordpress/element";
import {
    __experimentalToolsPanel as ToolsPanel,
} from "@wordpress/components";
import _ from "lodash";
import {Field} from "Components/Field";

export const LayoutFields = ({label = "Settings", settings = {}, suppress = [], updateFn}) => {
    const {layoutFieldsMap: map = []} = window?.WPBS_StyleEditor ?? {};

    const onUpdate = useCallback(
        (slug, value) => {
            updateFn({[slug]: value});
        },
        [updateFn]
    );

    return (
        <ToolsPanel
            label={label}
            resetAll={() => updateFn({})}
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
