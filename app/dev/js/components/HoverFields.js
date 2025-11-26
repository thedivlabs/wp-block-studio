import {__experimentalToolsPanel as ToolsPanel} from "@wordpress/components";
import {Field} from "Components/Field";

export const HoverFields = ({
                                label = "Hover",
                                settings = {},
                                suppress = [],
                                updateFn,
                            }) => {
    const {hoverFieldsMap: map = []} = window?.WPBS_StyleEditor ?? {};

    return (
        <ToolsPanel
            label={label}
            resetAll={() => updateFn({}, true)}
        >
            {map
                .filter((f) => !suppress.includes(f.slug))
                .map((field) => {
                    return (
                        <Field
                            key={field.slug}
                            field={field}
                            settings={settings}
                            isToolsPanel={true}

                            // Field now ALWAYS gives an object,
                            // so we merge it into the hover object and pass through.
                            callback={(valueObj) => {
                                const nextHover = {
                                    ...settings,
                                    ...valueObj,
                                };

                                updateFn(nextHover);
                            }}
                        />
                    );
                })}
        </ToolsPanel>
    );
};
