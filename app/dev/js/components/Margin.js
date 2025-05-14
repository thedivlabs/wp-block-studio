import {
    __experimentalBoxControl as BoxControl,
} from '@wordpress/components';
import {useState} from "react";


function Margin({defaultValue, callback}) {

    return <BoxControl
        label={'Margin'}
        values={defaultValue}
        units={[
            {value: 'px', label: 'px', default: 10},
            {value: '%', label: '%', default: 10},
            {value: 'rem', label: 'rem', default: 1, step: .1},
            {value: 'em', label: 'em', default: 1, step: .1},
        ]}
        onChange={(newValue) => {
            callback(newValue);
        }}
    />;
}

export default Margin;
