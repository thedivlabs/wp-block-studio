import {__experimentalToolsPanel as ToolsPanel} from "@wordpress/components";
import {Field} from "Components/Field";

export const HoverFields = ({
                                label = "Hover",
                                settings = {},
                                suppress = [],
                                updateFn,
                            }) => {
    const {hoverFieldsMap: map = []} = window?.WPBS_StyleEditor ?? {};
console.log(settings);

    return (
        <ToolsPanel
            label={label}
            resetAll={() => updateFn({}, true)}
        >
            {map
                .filter((f) => !suppress.includes(f.slug))
                .map((field) => {

                    console.log(field);

                    return (<Field
                        key={field.slug}
                        field={field}
                        settings={settings}
                        callback={(value) => {
                            const nextHover = {
                                ...settings,   // keep existing hover values
                                ...value       // add the new patched values
                            };

                            updateFn(nextHover);
                        }}
                        isToolsPanel={true}
                    />)
                })}
        </ToolsPanel>
    );
};
