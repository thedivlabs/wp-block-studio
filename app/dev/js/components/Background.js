import React, {useState} from "react"
import {
    __experimentalGrid as Grid,
    PanelBody,
    SelectControl,
    ToggleControl,
    Button,
} from "@wordpress/components";
import {InspectorControls,MediaUpload} from "@wordpress/block-editor";
import { Component } from '@wordpress/element';

function Background({settings = {}, pushSettings}) {


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
    const [image, setImage] = useState(settings.image || false);

    function updateSettings(attr, val, callback) {
        callback(val);
        pushSettings(Object.assign({}, settings, {[attr]: val}));
    }

    return (
        <InspectorControls group={'styles'}>
            <PanelBody title={'Background'} initialOpen={false}>
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
                    <MediaUpload
                        title={ 'Image'}
                        onSelect={(value) => {
                            updateSettings('image',value,setType);
                        }}
                        allowedTypes={ [ 'image' ] }
                        value={ image }
                        render={ ( { open } ) => (
                            <Button
                                className={ 'editor-post-featured-image__toggle' }
                                onClick={ open }>
                                { image && <img /> }
                                { ! image && 'Set background image' }
                            </Button>
                        ) }
                    />
                </Grid>
            </PanelBody>
        </InspectorControls>
    )
}

export default Background