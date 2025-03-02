import {BaseControl, Button} from "@wordpress/components";
import React, {useState} from "react";
import {MediaUpload, MediaUploadCheck} from "@wordpress/block-editor";
import PreviewThumbnail from "Components/PreviewThumbnail";


function Mask({defaultValue, callback}) {

    const [value, setValue] = useState(defaultValue || 0);

    const buttonStyle = {
        border: '1px dashed lightgray',
        width: '100%',
        height: 'auto',
        aspectRatio: '16/9',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
    };

    return <BaseControl label={'Mask Image'} __nextHasNoMarginBottom={true}>
        <MediaUploadCheck>
            <MediaUpload
                title={'Mask'}
                onChange={(newValue) => {
                    setValue(newValue);
                    callback(newValue);
                }}
                allowedTypes={['image']}
                value={value}
                render={({open}) => {
                    if (value) {
                        return <>
                            <PreviewThumbnail
                                image={value || {}}
                                callback={() => {
                                    setValue(undefined);
                                    callback(undefined);
                                }}
                                style={{
                                    objectFit: 'contain',
                                    backgroundColor: 'rgba(0,0,0,0.1)',
                                }}
                            /></>;
                    } else {
                        return <Button onClick={open} style={buttonStyle}>Choose Mask Image</Button>
                    }
                }}
            />
        </MediaUploadCheck>
    </BaseControl>;
}

export default Mask;
