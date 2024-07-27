import React, {useState} from "react"
import {
    __experimentalGrid as Grid,
    PanelBody,
    SelectControl,
    ToggleControl,
} from "@wordpress/components";
import {InspectorControls} from "@wordpress/block-editor";

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
        <InspectorControls group={'styles'}>
            <PanelBody title={'Mobile'} initialOpen={false}>
                <Grid columns={1} columnGap={20} rowGap={20}>
                    <SelectControl
                        label="Type"
                        value={type}
                        options={[
                            {label: 'Default', value: null},
                            {label: 'Image', value: 'image'},
                            {label: 'Video', value: 'video'},
                            {label: 'Pattern', value: 'pattern'},
                        ]}
                        onChange={(value) => {
                            updateSettings('type',value,setType);
                        }}
                        __nextHasNoMarginBottom
                    />

                </Grid>
            </PanelBody>
        </InspectorControls>
    )
}

export default Background