import {__experimentalGrid as Grid, SelectControl} from "@wordpress/components";
import React, {useState} from "react";
import {InspectorControls} from "@wordpress/block-editor";
import {ELEMENT_TAG_OPTIONS} from 'Includes/config'

const prop = 'wpbs-element-tag';

export const ELEMENT_TAG_ATTRIBUTES = {
    'wpbs-element-tag': {
        type: 'string',
        defaultValue: 'div'
    }
}

export function ElementTag(attributes) {

    return attributes[prop] || 'div';
}

export function ElementTagSettings({attributes, setAttributes, options = []}) {

    const [value, setValue] = useState(attributes?.[prop] ?? '');

    const select_options = options.length > 0 ? options : ELEMENT_TAG_OPTIONS;

    return <InspectorControls group="advanced">
        <Grid columns={1} columnGap={15} rowGap={20} style={{paddingTop: '20px'}}>
            <SelectControl
                value={value}
                label={'HTML element'}
                options={select_options}
                onChange={(newValue) => {
                    setValue(newValue);
                    setAttributes({'wpbs-element-tag': newValue});
                }}
                __next40pxDefaultSize
                __nextHasNoMarginBottom
            />
        </Grid>
    </InspectorControls>;
}

