import {
    __experimentalBoxControl as BoxControl,
} from '@wordpress/components';
import {useState} from "react";


function Padding({defaultValue, callback}) {

    const [value, setValue] = useState(defaultValue);

    return <BoxControl
        label={'Padding'}
        values={value}
        onChange={(newValue) => {
            setValue(newValue);
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

export default Padding;
