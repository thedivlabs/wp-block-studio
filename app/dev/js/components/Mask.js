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
        <Grid columns={1} columnGap={15} rowGap={20} style={{gridColumn: '1/-1'}}>
            <BaseControl label={'Mask Image'} __nextHasNoMarginBottom={true}>
                <MediaUploadCheck>
                    <MediaUpload
                        title={'Mask Image'}
                        onSelect={(value) => {
                            const imageProps = {
                                type: value.type,
                                id: value.id,
                                url: value.url,
                                alt: value.alt,
                                sizes: value.sizes,
                            };
                            callback(imageProps, originValue, sizeValue);
                        }}
                        allowedTypes={['image']}
                        value={imageValue}
                        render={({open}) => {
                            return <PreviewThumbnail
                                image={imageValue || {}}
                                callback={() => {
                                    callback(undefined, originValue, sizeValue);
                                }}
                                style={{
                                    objectFit: 'contain'
                                }}
                                onClick={open}
                            />;
                        }}
                    />
                </MediaUploadCheck>
            </BaseControl>


            <Grid columns={2} columnGap={15} rowGap={20}>
                <SelectControl
                    __next40pxDefaultSize
                    label="Origin"
                    value={originValue}
                    options={originOptions}
                    onChange={(value) => {
                        callback(imageValue, value, sizeValue);
                    }}
                    __nextHasNoMarginBottom
                />
                <SelectControl
                    __next40pxDefaultSize
                    label="Size"
                    value={sizeValue}
                    options={sizeOptions}
                    onChange={(value) => {
                        callback(imageValue, originValue, value);
                    }}
                    __nextHasNoMarginBottom
                />
            </Grid>
        </Grid>
    </>


}

export default Mask;
