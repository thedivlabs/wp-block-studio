import {
    BaseControl,
    PanelBody,
    __experimentalGrid as Grid,
    __experimentalUnitControl as UnitControl,
    PanelColorSettings,
    __experimentalBorderControl as BorderControl,
} from "@wordpress/components";

import { useCallback, useMemo } from "@wordpress/element";
import { IconControl } from "Components/IconControl";
import { cleanObject } from "Includes/helper";

/**
 * DividerOptions
 * ---------------
 * A unified, reusable divider editor for WPBS blocks.
 *
 * Returns a single structured object:
 *
 * {
 *     style: { width, color, style }
 *     icon: {
 *         name,
 *         weight,
 *         size,
 *         style
 *     }
 * }
 *
 * Usage:
 * <DividerOptions
 *      value={settings.divider}
 *      onChange={(next) => updateSettings({ divider: next })}
 * />
 */
export const DividerOptions = ({ value = {}, onChange }) => {
    const divider = value || {};

    const update = useCallback(
        (patch) => {
            const next = cleanObject({ ...divider, ...patch }, false);
            onChange(next);
        },
        [divider, onChange]
    );

    const dividerStyle = divider.style || {};
    const dividerIcon = divider.icon || {};

    return (
        <PanelBody
            title="Divider"
            initialOpen={true}
            className="wpbs-divider-panel"
        >
            {/* ------- Border / Line Style ------- */}
            <BorderControl
                __next40pxDefaultSize
                enableAlpha
                enableStyle
                disableUnits
                value={dividerStyle}
                colors={WPBS?.settings?.colors ?? []}
                __experimentalIsRenderedInSidebar={true}
                label="Divider Style"
                onChange={(border) => update({ style: border })}
                shouldSanitizeBorder
            />

            {/* ------- Icon Options ------- */}
            <IconControl
                fieldKey="divider-icon"
                label="Divider Icon"
                value={dividerIcon}
                props={{ attributes: {}, setAttributes: () => {} }}
                onChange={(iconObj) => update({ icon: iconObj })}
            />

            {/* ------- Icon Size ------- */}
            <Grid columns={1} columnGap={10} rowGap={12}>
                <UnitControl
                    label="Icon Size"
                    value={divider.iconSize || ""}
                    isResetValueOnUnitChange={true}
                    onChange={(val) => update({ iconSize: val })}
                    units={[
                        { value: "px", label: "px", default: "0px" },
                        { value: "em", label: "em", default: "0em" },
                        { value: "rem", label: "rem", default: "0rem" },
                        { value: "vw", label: "vw", default: "0vw" },
                    ]}
                    __next40pxDefaultSize
                />
            </Grid>

            {/* ------- Icon Color ------- */}
            <PanelColorSettings
                enableAlpha
                className="!p-0 !border-0"
                colorSettings={[
                    {
                        slug: "divider-icon-color",
                        label: "Icon Color",
                        value: divider.iconColor,
                        onChange: (val) => update({ iconColor: val }),
                        isShownByDefault: true,
                    },
                ]}
            />
        </PanelBody>
    );
};