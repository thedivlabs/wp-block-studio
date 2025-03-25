import {__experimentalGrid as Grid, BaseControl, SelectControl} from "@wordpress/components";
import React, {useState} from "react";
import {MediaUpload, MediaUploadCheck} from "@wordpress/block-editor";
import PreviewThumbnail from "Components/PreviewThumbnail";

function Mask({
                  imageValue,
                  originValue,
                  sizeValue,
                  callback
              }) {

    const [image, setImage] = useState(imageValue);
    const [origin, setOrigin] = useState(originValue);
    const [size, setSize] = useState(sizeValue);

    const originOptions = [
        {label: 'Default', value: ''},
        {label: 'Center', value: 'center'},
        {label: 'Top', value: 'top'},
        {label: 'Right', value: 'right'},
        {label: 'Bottom', value: 'bottom'},
        {label: 'Left', value: 'left'},
        {label: 'Top Left', value: 'top left'},
        {label: 'Top Right', value: 'top right'},
        {label: 'Bottom Left', value: 'bottom left'},
        {label: 'Bottom Right', value: 'bottom right'},
    ];

    const sizeOptions = [
        {label: 'Default', value: 'contain'},
        {label: 'Cover', value: 'cover'},
        {label: 'Vertical', value: 'auto 100%'},
        {label: 'Horizontal', value: '100% auto'},
    ];

    return <>
        <Grid columns={1} columnGap={15} rowGap={20} style={{gridColumn:'1/-1'}}>
            <BaseControl label={'Image'} __nextHasNoMarginBottom={true}>
                <MediaUploadCheck>
                    <MediaUpload
                        title={'Mask Image'}
                        onSelect={(value) => {
                            setImage({
                                type: value.type,
                                id: value.id,
                                url: value.url,
                            });
                            callback(image, origin, size);
                        }}
                        allowedTypes={['image']}
                        value={image}
                        render={({open}) => {
                            return <PreviewThumbnail
                                image={image || {}}
                                callback={() => {
                                    setImage(undefined);
                                    callback(image, origin, size);
                                }}
                                style={{
                                    objectFit:'contain'
                                }}
                                onClick={open}
                            />;
                        }}
                    />
                </MediaUploadCheck>
            </BaseControl>


        <Grid columns={2} columnGap={15} rowGap={20} style={{...styles}}>
            <SelectControl
                __next40pxDefaultSize
                label="Origin"
                value={origin}
                options={originOptions}
                onChange={(value) => {
                    setOrigin(value);
                    callback(image, origin, size);
                }}
                __nextHasNoMarginBottom
            />
            <SelectControl
                __next40pxDefaultSize
                label="Size"
                value={size}
                options={sizeOptions}
                onChange={(value) => {
                    setSize(value);
                    callback(image, origin, size);
                }}
                __nextHasNoMarginBottom
            />
        </Grid>
        </Grid>
    </>


}

export default Mask;
