import {SelectControl} from "@wordpress/components";
import {useState} from "react";

const prop = 'wpbs-element-tag';

export function ElementTag({attributes}) {


    return attributes[prop] || 'div';
}

export function ElementTagSettings({attributes, callback}) {

    const [value, setValue] = useState(attributes[prop]);

    return <SelectControl
        value={value}
        label={'HTML element'}
        options={[
            {label: 'Default (<div>)', value: 'div'},
            {label: '<header>', value: 'header'},
            {label: '<main>', value: 'main'},
            {label: '<section>', value: 'section'},
            {label: '<article>', value: 'article'},
            {label: '<aside>', value: 'aside'},
            {label: '<footer>', value: 'footer'},
        ]}
        onChange={(newValue) => {
            setValue(newValue);
            callback({[prop]: newValue});
        }}
        __next40pxDefaultSize
        __nextHasNoMarginBottom
    />;
}

