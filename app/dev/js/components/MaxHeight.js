import {
    __experimentalUnitControl as UnitControl,
} from "@wordpress/components";
import {useState} from "react";


function MaxHeight({defaultValue, callback}) {

    const [value, setValue] = useState(defaultValue || null);

    return <UnitControl
        label={'Max-Height'}
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
            {value: 'vh', label: 'vh', default: 0},
            {value: 'vw', label: 'vw', default: 0},
            {value: 'ch', label: 'ch', default: 0},
        ]}
        __next40pxDefaultSize
    />;
}

export default MaxHeight;
