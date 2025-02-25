import {
    __experimentalBoxControl as BoxControl,
} from '@wordpress/components';
import {useState} from "react";


function Rounded({defaultValue, callback}) {

    const [value, setValue] = useState(defaultValue);

    return <BoxControl
        label={'Rounded'}
        values={value}
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
        __nextHasNoMarginBottom={true}
    />;
}

export default Rounded;
