import {RangeControl} from "@wordpress/components";
import {useState} from "react";


function Opacity({defaultValue, callback}) {

    return <RangeControl
        label="Opacity"
        step={.1}
        withInputField={true}
        allowReset={true}
        isShiftStepEnabled
        initialPosition={0}
        value={defaultValue}
        onChange={(newValue) => {
            callback(newValue);
        }}
        __next40pxDefaultSize
        __nextHasNoMarginBottom
        min={0}
        max={1}
    />;
}

export default Opacity;
