import React, {useState} from "react"
import {useBlockProps} from '@wordpress/block-editor'
import {ToggleControl} from "@wordpress/components";

function Background({settings, pushSettings}) {


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


    const [type, setType] = useState(settings.type || false);

    function updateSettings(attr, val, callback) {
        callback(val);
        pushSettings(Object.assign({}, settings, {[attr]: val}));
    }

    return (
        <div>


            <ToggleControl
                label="Testing"
                checked={type}
                onChange={(value) => {
                    updateSettings('type', value, setType);
                }}
            />
        </div>
    )
}

export default Background