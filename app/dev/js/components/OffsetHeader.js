import {
    __experimentalBoxControl as BoxControl,
} from '@wordpress/components';
import {useState} from "react";


function OffsetHeader({defaultValue, callback}) {

    const [value, setValue] = useState(defaultValue);

    return <BoxControl
        label={'Offset Header'}
        values={value}
        onChange={(newValue) => {
            setValue(newValue);
            callback(newValue);
        }}
        __nextHasNoMarginBottom={true}
    />;
}

export default OffsetHeader;
