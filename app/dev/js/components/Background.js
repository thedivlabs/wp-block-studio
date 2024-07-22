import React, {useState} from "react"
import {useBlockProps} from '@wordpress/block-editor'
import {ToggleControl} from "@wordpress/components";

function Background({settings,pushSettings}) {



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

    const [defaultSettings, setDefaultSettings] = useState(settings);

    const [testing, setTesting] = useState(defaultSettings.type);

    function updateSettings (prop, val) {
        setDefaultSettings(Object.assign(settings, {[prop]:val}));
        pushSettings(defaultSettings);
    }

    return (
        <div>
            <ToggleControl
                label="Testing"
                checked={testing}
                onChange={(value) => {
                    updateSettings('type', value);
                    setTesting(value)
                }}
            />
        </div>
    )
}

export default Background