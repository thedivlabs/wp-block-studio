import React, {useState} from "react"
import {useBlockProps} from '@wordpress/block-editor'
import {ToggleControl} from "@wordpress/components";

function Background({settings,pushSettings}) {

    const [defaultSettings, setDefaultSettings] = useState({
        type: '',
        pattern_image: '',
        image_mobile: '',
        image_large: '',
        video_mobile: '',
        video_large: '',
        loading: 'xxxxx',
        opacity: '',
        repeat: 'xxxx',
        blend: '',
        width_mobile: '',
        width_large: '',
        overlay_mobile: '',
        overlay_large: '',
        mask_mobile: '',
        mask_large: '',
    });

    const [testing, setTesting] = useState(false);

    function updateSettings (prop, val) {
        setDefaultSettings(Object.assign(defaultSettings, {[prop]:val}));
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