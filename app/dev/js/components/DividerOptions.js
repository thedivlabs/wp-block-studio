import {
    __experimentalGrid as Grid,
    __experimentalUnitControl as UnitControl,
    __experimentalBorderControl as BorderControl,
} from "@wordpress/components";
import {PanelColorSettings} from "@wordpress/block-editor";

import {useCallback} from "@wordpress/element";
import {IconControl} from "Components/IconControl";
import {cleanObject} from "Includes/helper";


export const DividerOptions = ({value = {}, props, onChange}) => {
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

    return (
        <div className="wpbs-layout-tools__panel">
            {/* ------- Divider Border / Line Style ------- */}
            <BorderControl
                __next40pxDefaultSize
                enableAlpha
                enableStyle
                disableUnits
                value={border}
                colors={WPBS?.settings?.colors ?? []}
                __experimentalIsRenderedInSidebar={true}
                label="Border"
                onChange={(newBorder) => update({border: newBorder})}
                shouldSanitizeBorder
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
                className="!p-0 !border-0"
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
        </div>
    );
};
