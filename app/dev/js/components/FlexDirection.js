import {SelectControl} from "@wordpress/components";
import {useState} from "react";


function FlexDirection({defaultValue, callback}) {

    return <SelectControl
        label={'Direction'}
        value={defaultValue}
        options={[
            {label: 'Select', value: ''},
            {label: 'Row', value: 'row'},
            {label: 'Column', value: 'column'},
            {label: 'Row Reverse', value: 'row-reverse'},
            {label: 'Column Reverse', value: 'column-reverse'},
        ]}
        onChange={(newValue) => {
            callback(newValue);
        }}
        __next40pxDefaultSize
        __nextHasNoMarginBottom
    />;
}

export default FlexDirection;
