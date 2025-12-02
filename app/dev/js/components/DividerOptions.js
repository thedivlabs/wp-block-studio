import {
    __experimentalGrid as Grid,
    __experimentalUnitControl as UnitControl,
    __experimentalBorderControl as BorderControl,
} from "@wordpress/components";
import { PanelColorSettings } from "@wordpress/block-editor";

import { useCallback } from "@wordpress/element";
import { IconControl } from "Components/IconControl";
import { Field } from "Components/Field";
import { cleanObject } from "Includes/helper";


export const DividerOptions = ({ value = {}, props, onChange, ...restProps }) => {
    const divider = value || {};

    const update = useCallback(
        (patch) => {
            const next = cleanObject({ ...divider, ...patch }, false);
            onChange(next);
        },
        [divider, onChange]
    );

    // existing stored values
    const border = divider.border || {};
    const icon = divider.icon || {};

    const panelProps = {
        columns: 1,
        columnGap: 15,
        rowGap: 20,
        className: "wpbs-layout-tools__panel",
        ...restProps,
    };

    return (
        <Grid {...panelProps}>

            {/* BORDER CONTROL — FIXED */}
            <Field
                field={{
                    type: "border",
                    slug: "border",
                    label: "Border",
                    full: true,
                }}
                // Field expects: { border: {...} }
                settings={{ border }}
                callback={(newBorder) => {
                    // Field always returns: { border: { color, style, width } }
                    update({ border: newBorder?.border || {} });
                }}
                isToolsPanel={false}
                props={props}
            />

            {/* ICON CONTROL (unchanged) */}
            <IconControl
                fieldKey="divider-icon"
                label="Divider Icon"
                value={icon}
                props={props}
                onChange={(iconObj) => update({ icon: iconObj })}
            />
        </Grid>
    );
};