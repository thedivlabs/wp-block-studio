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
        inputProps={{
            min: -300,
            max: 300,
            units: [
                {value: 'px', label: 'px', default: 0},
                {value: '%', label: '%', default: 0},
                {value: 'em', label: 'em', default: 0},
                {value: 'rem', label: 'rem', default: 0},
                {value: 'vh', label: 'vh', default: 0},
                {value: 'vw', label: 'vw', default: 0},
                {value: 'ch', label: 'ch', default: 0},
            ]
        }}
        __nextHasNoMarginBottom={true}
    />;
}

export default Translate;
