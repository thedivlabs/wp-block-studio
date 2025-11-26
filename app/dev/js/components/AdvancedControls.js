import {useCallback} from "@wordpress/element";
import _ from "lodash";
import {__experimentalGrid as Grid, SelectControl, ToggleControl} from "@wordpress/components";
import {ELEMENT_TAG_OPTIONS} from "Includes/config";

export const AdvancedControls = ({settings = {}, callback}) => {

    // Accepts patch objects, merges locally, returns ONLY the patch
    const commitSettings = useCallback(
        (patch) => {
            if (!patch || typeof patch !== "object") return;

            const next = {
                ...settings,
                ...patch,
            };

            if (!_.isEqual(settings, next)) {
                callback(patch); // <— return patch only
            }
        },
        [settings, callback]
    );

    return (
        <Grid columns={1} columnGap={15} rowGap={20} style={{padding: "15px 0"}}>
            <Grid columns={2} columnGap={15} rowGap={20}>
                <SelectControl
                    label={"HTML Tag"}
                    value={settings?.tagName ?? ""}
                    options={ELEMENT_TAG_OPTIONS}
                    onChange={(tag) => commitSettings({tagName: tag})}
                    __next40pxDefaultSize
                    __nextHasNoMarginBottom
                />
            </Grid>

            <Grid columns={2} columnGap={15} rowGap={20}>
                <ToggleControl
                    label="Hide if Empty"
                    checked={!!settings["hide-empty"]}
                    onChange={(checked) => commitSettings({"hide-empty": !!checked})}
                    __nextHasNoMarginBottom
                />

                <ToggleControl
                    label="Required"
                    checked={!!settings.required}
                    onChange={(checked) => commitSettings({required: !!checked})}
                    __nextHasNoMarginBottom
                />
            </Grid>

            <Grid columns={2} columnGap={15} rowGap={20}>
                <ToggleControl
                    label="Offset Header"
                    checked={!!settings["offset-header"]}
                    onChange={(checked) =>
                        commitSettings({"offset-header": !!checked})
                    }
                    __nextHasNoMarginBottom
                />

                <ToggleControl
                    label="Container"
                    checked={!!settings.container}
                    onChange={(checked) =>
                        commitSettings({container: !!checked})
                    }
                    __nextHasNoMarginBottom
                />
            </Grid>
        </Grid>
    );
};

export function ElementTag(value, defaultTag = "div") {
    return value || defaultTag;
}
