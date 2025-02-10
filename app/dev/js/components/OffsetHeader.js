import {
    __experimentalUnitControl as UnitControl,
} from "@wordpress/components";
import {useState} from "react";


function OffsetHeader({defaultValue, callback}) {

    const [value, setValue] = useState(defaultValue);

    return <UnitControl
        label={'Offset Header'}
        value={value}
        isResetValueOnUnitChange={true}
        onChange={(newValue) => {
            setValue(newValue);
            callback(newValue);
        }}
        __next40pxDefaultSize
    />;
}

export default OffsetHeader;

