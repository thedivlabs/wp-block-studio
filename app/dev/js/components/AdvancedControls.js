import {memo, useCallback, useEffect, useState} from "@wordpress/element";
import _ from "lodash";
import {__experimentalGrid as Grid, SelectControl, ToggleControl} from "@wordpress/components";
import {ELEMENT_TAG_OPTIONS} from "Includes/config";

export const AdvancedControls = ({settings = {}, callback}) => {

    const commitSettings = useCallback(
        (nextPartial) => {
            const nextAdvanced = {
                ...settings,
                ...nextPartial,
            };
            if (!_.isEqual(settings, nextAdvanced)) {
                callback(nextPartial)
            }
        },
        [settings]
    );

    return (
        <Grid columns={1} columnGap={15} rowGap={20} style={{padding: '15px 0'}}>
            <Grid columns={2} columnGap={15} rowGap={20}>
                <SelectControl
                    label={"HTML Tag"}
                    value={settings?.tagName ?? ''}
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
                    checked={!!settings?.['hide-empty']}
                    onChange={(checked) => commitSettings({'hide-empty': !!checked})}
                />
                <ToggleControl
                    __nextHasNoMarginBottom
                    label="Required"
                    checked={!!settings?.required}
                    onChange={(checked) => commitSettings({required: !!checked})}
                />
            </Grid>

            <Grid columns={2} columnGap={15} rowGap={20}>
                <ToggleControl
                    __nextHasNoMarginBottom
                    label="Offset Header"
                    checked={!!settings?.['offset-header']}
                    onChange={(checked) => commitSettings({'offset-header': !!checked})}
                />
                <ToggleControl
                    __nextHasNoMarginBottom
                    label="Container"
                    checked={!!settings?.container}
                    onChange={(checked) => commitSettings({container: !!checked})}
                />
            </Grid>
        </Grid>
    );
};

export function ElementTag(value, defaultTag = 'div') {
    return value || defaultTag;
}