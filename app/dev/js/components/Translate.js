import {
    __experimentalBoxControl as BoxControl,
} from '@wordpress/components';
import {useState} from "react";


function Translate({label, defaultValue, callback}) {

    const [value, setValue] = useState(defaultValue);

    return <BoxControl
        label={label || 'Translate'}
        values={value}
        sides={['top', 'left']}
        onChange={(newValue) => {
            setValue(newValue);
            callback(newValue);
        }}
        inputProps={{min: -300, max: 300}}
        __nextHasNoMarginBottom={true}
    />;
}

export default Translate;
