import {RangeControl} from "@wordpress/components";
import {useState} from "react";


function Basis({defaultValue, callback}) {

    const [value,setValue] = useState(defaultValue || 0);

    return <RangeControl
        label="Basis"
        step={1}
        withInputField={true}
        allowReset={true}
        isShiftStepEnabled
        initialPosition={0}
        value={value}
        onChange={(newValue) => {
            setValue(newValue);
            callback(newValue);
        }}
        __next40pxDefaultSize
        __nextHasNoMarginBottom
        min={ 0 }
        max={ 100 }
    />;
}

export default Basis;
