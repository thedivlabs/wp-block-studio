import {
    __experimentalBoxControl as BoxControl,
} from '@wordpress/components';
import {useState} from "react";


function Rounded({defaultValue, callback}) {

    return <BoxControl
        label={'Rounded'}
        values={defaultValue}
        onChange={(newValue) => {
            callback(newValue);
        }}
        units={[
            {value: 'px', label: 'px', default: 0},
            {value: '%', label: '%', default: 0},
            {value: 'em', label: 'em', default: 0, step: .1},
            {value: 'rem', label: 'rem', default: 0, step: .1},
        ]}
        __nextHasNoMarginBottom={true}
    />;
}

export default Rounded;
