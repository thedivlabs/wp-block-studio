import {BaseControl, GradientPicker} from "@wordpress/components";
import React, {useState} from "react";


function Overlay({defaultValue, callback}) {

    const [value, setValue] = useState(defaultValue);

    return <BaseControl label={'Overlay'} __nextHasNoMarginBottom={true}>
        <GradientPicker
            gradients={[
                {
                    name: 'Transparent',
                    gradient:
                        'linear-gradient(rgba(0,0,0,0),rgba(0,0,0,0))',
                    slug: 'transparent',
                },
                {
                    name: 'Light',
                    gradient:
                        'linear-gradient(rgba(0,0,0,.3),rgba(0,0,0,.3))',
                    slug: 'light',
                },
                {
                    name: 'Strong',
                    gradient:
                        'linear-gradient(rgba(0,0,0,.7),rgba(0,0,0,.7))',
                    slug: 'Strong',
                }
            ]}
            clearable={true}
            value={value}
            onChange={(newValue) => {
                setValue(newValue);
                callback(newValue);
            }}
        />
    </BaseControl>;
}

export default Overlay;
