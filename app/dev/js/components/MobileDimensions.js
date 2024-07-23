import React, {useState} from "react"
import {__experimentalBoxControl as BoxControl} from "@wordpress/components";

function MobileDimensions({settings, pushSettings}) {


    /*{
        type: '',
        pattern_image: '',
        image_mobile: '',
        image_large: '',
        video_mobile: '',
        video_large: '',
        loading: '',
        opacity: '',
        repeat: '',
        blend: '',
        width_mobile: '',
        width_large: '',
        overlay_mobile: '',
        overlay_large: '',
        mask_mobile: '',
        mask_large: '',
    }*/


    function updateSettings(attr, val, callback) {
        if (callback) {
            callback(val);
        }
        pushSettings(Object.assign({}, settings, {[attr]: val}));
    }

    const [ padding, setPadding ] = useState( {
        top: undefined,
        left: undefined,
        right: undefined,
        bottom: undefined,
    } );

    return (
        <>
            <BoxControl
                label={'Mobile Padding'}
                splitOnAxis={true}
                values={padding}
                sides={['vertical','horizontal']}
                onChange={(values) => {
                    updateSettings('padding', values, setPadding)
                }}
            />
        </>
    )
}

export default MobileDimensions