import {memo, useCallback, useEffect, useState} from "@wordpress/element";
import _ from "lodash";
import {__experimentalGrid as Grid, ToggleControl} from "@wordpress/components";
import {ElementTagControl} from "Components/ElementTag";

export const AdvancedControls = ({settings = {}, callback}) => {

    const [localSettings, setLocalSettings] = useState(settings.advanced ?? {});

    // Whenever local advanced changes, build full object and send up
    useEffect(() => {
        if (!_.isEqual(settings.advanced, localSettings)) {
            const nextFull = {
                ...settings,
                advanced: localSettings,
            };
            callback(nextFull); // ✅ full wpbs-style object
        }
    }, [localSettings, callback]);

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
                <ElementTagControl
                    value={localSettings?.tagName ?? ''}
                    label="HTML Tag"
                    onChange={(tag) => commitSettings({tagName: tag})}
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
