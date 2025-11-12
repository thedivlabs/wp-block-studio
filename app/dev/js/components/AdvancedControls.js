import {memo, useCallback, useEffect, useState} from "@wordpress/element";
import _ from "lodash";
import {__experimentalGrid as Grid, ToggleControl} from "@wordpress/components";
import {ElementTagControl} from "Components/ElementTag";

export const AdvancedControls = ({settings = {}, callback}) => {
    // Keep only the advanced section in local state
    const [localSettings, setLocalSettings] = useState(settings.advanced ?? {});

    // Sync local state if parent settings change externally
    useEffect(() => {

        const nextSettings = {
            ...settings,
            advanced: localSettings,
        }
        if (!_.isEqual(settings, nextSettings)) {
            callback(nextSettings);
        }

    }, [localSettings]);

    const commitSettings = useCallback(
        (nextPartial) => {
            const nextAdvanced = {
                ...localSettings,
                ...nextPartial,
            };

            // Only update if something actually changed
            if (!_.isEqual(localSettings, nextAdvanced)) {
                setLocalSettings(nextAdvanced);
            }
        },
        [localSettings, callback]
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
