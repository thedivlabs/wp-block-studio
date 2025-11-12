import {memo, useCallback, useEffect, useState} from "@wordpress/element";
import _ from "lodash";
import {__experimentalGrid as Grid, SelectControl, ToggleControl} from "@wordpress/components";
import {ELEMENT_TAG_OPTIONS} from "Includes/config";

export const AdvancedControls = ({settings = {}, callback}) => {

    const [localSettings, setLocalSettings] = useState(settings.advanced ?? {});

    // Whenever local advanced changes, build full object and send up
    useEffect(() => {
        if (!_.isEqual(settings.advanced, localSettings)) {
            const nextFull = {
                ...settings,
                advanced: localSettings,
            };

            console.log(nextFull);
            callback(nextFull); // ✅ full wpbs-style object
        }
    }, [localSettings]);

    // Merge partials into local advanced state
    const commitSettings = useCallback(
        (nextPartial) => {
            const nextAdvanced = {
                ...localSettings,
                ...nextPartial,
            };
            if (!_.isEqual(localSettings, nextAdvanced)) {
                setLocalSettings(nextAdvanced);
            }
        },
        [localSettings]
    );

    return (
        <Grid columns={1} columnGap={15} rowGap={20} style={{padding: '15px 0'}}>
            <Grid columns={2} columnGap={15} rowGap={20}>
                <SelectControl
                    label={label || "HTML Tag"}
                    value={localSettings?.tagName ?? ''}
                    options={ELEMENT_TAG_OPTIONS}
                    onChange={(tag) => commitSettings({tagName: tag})}
                    __next40pxDefaultSize
                    __nextHasNoMarginBottom
                />
            </Grid>

            <Grid columns={2} columnGap={15} rowGap={20}>
                <ToggleControl
                    __nextHasNoMarginBottom
                    label="Hide if Empty"
                    checked={!!localSettings?.['hide-empty']}
                    onChange={(checked) => commitSettings({'hide-empty': !!checked})}
                />
                <ToggleControl
                    __nextHasNoMarginBottom
                    label="Required"
                    checked={!!localSettings?.required}
                    onChange={(checked) => commitSettings({required: !!checked})}
                />
            </Grid>

            <Grid columns={2} columnGap={15} rowGap={20}>
                <ToggleControl
                    __nextHasNoMarginBottom
                    label="Offset Header"
                    checked={!!localSettings?.['offset-header']}
                    onChange={(checked) => commitSettings({'offset-header': !!checked})}
                />
                <ToggleControl
                    __nextHasNoMarginBottom
                    label="Container"
                    checked={!!localSettings?.container}
                    onChange={(checked) => commitSettings({container: !!checked})}
                />
            </Grid>
        </Grid>
    );
};

export function ElementTag(value, defaultTag = 'div') {
    return value || defaultTag;
}