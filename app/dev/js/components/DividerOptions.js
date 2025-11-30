import {
    __experimentalGrid as Grid,
    __experimentalUnitControl as UnitControl,
    __experimentalBorderControl as BorderControl,
} from "@wordpress/components";
import {PanelColorSettings} from "@wordpress/block-editor";

import {useCallback} from "@wordpress/element";
import {IconControl} from "Components/IconControl";
import {Field} from "Components/Field";
import {cleanObject} from "Includes/helper";


export const DividerOptions = ({value = {}, props, onChange, ...restProps}) => {
    const divider = value || {};


    const update = useCallback(
        (patch) => {
            const next = cleanObject({...divider, ...patch}, false);
            onChange(next);
        },
        [divider, onChange]
    );

    const border = divider.border || {};
    const icon = divider.icon || {};

    const panelProps = {
        columns: 1,
        columnGap: 15,
        rowGap: 20,
        className: "wpbs-layout-tools__panel",
        ...restProps,
    }

    return (
        <Grid {...panelProps}>


            <Field
                field={{
                    type: "border",
                    slug: "border",
                    label: "Border",
                    full: true,
                }}
                settings={border}
                callback={(newBorder) => update({border: newBorder})}
                isToolsPanel={false}
                props={props}
            />

            {/* ------- Divider Icon ------- */}
            <IconControl
                fieldKey="divider-icon"
                label="Divider Icon"
                value={icon}
                props={props}
                onChange={(iconObj) => update({icon: iconObj})}
            />

            {/* ------- Icon Color ------- */}
            <PanelColorSettings
                enableAlpha
                className="!p-0 !border-0 !m-0"
                colorSettings={[
                    {
                        slug: "icon-color",
                        label: "Icon Color",
                        value: divider.iconColor,
                        onChange: (val) => update({'icon-color': val}),
                        isShownByDefault: true,
                    },
                ]}
            />
        </Grid>
    );
};
