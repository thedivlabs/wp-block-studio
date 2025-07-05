import {__experimentalGrid as Grid, SelectControl, TextControl, ToggleControl} from "@wordpress/components";
import {REL_OPTIONS} from "Includes/config";
import {InspectorControls} from "@wordpress/block-editor";
import React, {useCallback, useState} from "react";

export function LinkPost({attribute, callback}) {

    function updateSettings(newValue) {

        const result = {
            ...attribute,
            ...newValue
        };

        callback(result);
    }

    return <InspectorControls group="advanced">
        <Grid columns={2} rowGap={20} style={{'margin-top': '25px'}}>
            <ToggleControl
                style={{marginTop: '20px'}}
                label="Link Post"
                checked={!!settings?.enabled}
                onChange={(value) => updateSettings({enabled: value})}
            />
            <ToggleControl
                label="New tab"
                checked={!!settings?.linkNewTab}
                onChange={(isChecked) => updateSettings({linkNewTab: !!isChecked})}
            />
            <Grid columns={2} columnGap={15} rowGap={20} style={{'grid-column': '1/-1'}}>
                <SelectControl
                    label="Rel"
                    value={settings?.linkRel ?? ''}
                    options={REL_OPTIONS}
                    onChange={(value) => updateSettings({linkRel: value})}
                />
                <TextControl
                    label="Title"
                    value={settings?.linkTitle ?? ''}
                    onChange={(value) => updateSettings({linkTitle: value})}
                />
            </Grid>
        </Grid>
    </InspectorControls>;
}