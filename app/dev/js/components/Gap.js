import {
    __experimentalBoxControl as BoxControl,
} from '@wordpress/components';
import {useState} from "react";


function Gap({defaultValue, callback}) {

    return <BoxControl
        label={'Gap'}
        units={[
            {value: 'px', label: 'px', default: 0},
            {value: '%', label: '%', default: 0},
            {value: 'em', label: 'em', default: 0, step: .1},
            {value: 'rem', label: 'rem', default: 0, step: .1},
            {value: 'vh', label: 'vh', default: 0},
            {value: 'vw', label: 'vw', default: 0},
            {value: 'ch', label: 'ch', default: 0},
        ]}
        values={defaultValue}
        sides={['top', 'left']}
        onChange={(newValue) => {
            callback(newValue);
        }}
    />;
}

export default Gap;
