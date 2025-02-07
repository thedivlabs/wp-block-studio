import {
    __experimentalBoxControl as BoxControl,
} from '@wordpress/components';
import {useState} from "react";


function Gap({defaultValue, callback}) {

    const [value,setValue] = useState(defaultValue);

    return <BoxControl
        label={'Gap'}
        values={value}
        sides={['top','left']}
        onChange={(newValue) => {
            setValue(newValue);
            callback(newValue);
        }}
    />;
}

export default Gap;
