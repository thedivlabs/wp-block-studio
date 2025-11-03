import {SelectControl} from "@wordpress/components";
import {useState} from '@wordpress/element';
import {ELEMENT_TAG_OPTIONS} from "Includes/config";

export function getElementTag(value, defaultTag = 'div') {
    return value || defaultTag;
}

export function ElementTagControl({value = "div", onChange, options = [], label, ...restProps}) {
    const [localValue, setLocalValue] = useState(value);
    const selectOptions = options.length > 0 ? options : ELEMENT_TAG_OPTIONS;

    return (
        <SelectControl
            label={label || "HTML Tag"}
            value={localValue}
            options={selectOptions}
            onChange={(newValue) => {
                setLocalValue(newValue);
                onChange?.(newValue);
            }}
            {...restProps}
            __next40pxDefaultSize
            __nextHasNoMarginBottom
        />
    );
}
