import {
    __experimentalBoxControl as BoxControl,
} from '@wordpress/components';
import {useState} from "react";


function Padding({defaultValue, callback}) {

    const [value,setValue] = useState(defaultValue);

    return <BoxControl
        label={'Padding'}
        values={value}
        onChange={(newValue) => {
            setValue(newValue);
            callback(newValue);
        }}
        __nextHasNoMarginBottom={ true }
    />;
}

export default Padding;
