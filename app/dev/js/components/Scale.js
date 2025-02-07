import {RangeControl} from "@wordpress/components";
import {useState} from "react";


function Scale({defaultValue, callback}) {

    const [value,setValue] = useState(defaultValue || 0);

    return <RangeControl
        label="Scale"
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
        min={ -100 }
        max={ 100 }
    />;
}

export default Scale;
