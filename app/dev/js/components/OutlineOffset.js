import {
    __experimentalUnitControl as UnitControl,
} from "@wordpress/components";
import {useState} from "react";


function OutlineOffset({defaultValue, callback}) {

    const [value, setValue] = useState(defaultValue);

    return <UnitControl
        label={'Outline Offset'}
        value={value}
        isResetValueOnUnitChange={true}
        onChange={(newValue) => {
            setValue(newValue);
            callback(newValue);
        }}
        units={[
            {value: 'px', label: 'px', default: 0},
            {value: '%', label: '%', default: 0},
            {value: 'em', label: 'em', default: 0},
            {value: 'rem', label: 'rem', default: 0},
        ]}
        __next40pxDefaultSize
    />;
}

export default OutlineOffset;
