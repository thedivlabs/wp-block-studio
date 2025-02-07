import {
    __experimentalBoxControl as BoxControl,
} from '@wordpress/components';
import {useState} from "react";


function Margin({defaultValue, callback}) {

    const [value,setValue] = useState(defaultValue);

    return <BoxControl
        label={'Margin'}
        values={value}
        units={[
            { value: 'px', label: 'px', default: 10 },
            { value: '%', label: '%', default: 10 },
            { value: 'rem', label: 'rem', default: 1 },
            { value: 'em', label: 'em', default: 1 },
        ]}
        onChange={(newValue) => {
            setValue(newValue);
            callback(newValue);
        }}
    />;
}

export default Margin;
