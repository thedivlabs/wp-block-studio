import {__experimentalGrid as Grid, BaseControl, Button, SelectControl} from "@wordpress/components";
import React, {useState} from "react";
import {MediaUpload, MediaUploadCheck} from "@wordpress/block-editor";
import PreviewThumbnail from "Components/PreviewThumbnail";
import {imageButtonStyle} from "Inc/helper";

function Mask({mobileValue, largeValue, originValue, sizeValue, callback}) {

    const [mobile, setMobile] = useState(mobileValue);
    const [large, setLarge] = useState(largeValue);
    const [origin, setOrigin] = useState(originValue);
    const [size, setSize] = useState(sizeValue);

    return <>
        <Grid columns={2} columnGap={15} rowGap={20}>
            <BaseControl label={'Mask Mobile'} __nextHasNoMarginBottom={true}>
                <MediaUploadCheck>
                    <MediaUpload
                        title={'Mask Mobile'}
                        onSelect={(value) => {
                            setMobile({
                                type: value.type,
                                id: value.id,
                                url: value.url,
                            });
                            callback(mobile, large, origin, size);
                        }}
                        allowedTypes={['image']}
                        value={mobile}
                        render={({open}) => {
                            return <PreviewThumbnail
                                image={mobile || {}}
                                callback={() => {
                                    setMobile(undefined);
                                    callback(mobile, large, origin, size);
                                }}
                                style={imageButtonStyle}
                                onClick={open}
                            />;
                        }}
                    />
                </MediaUploadCheck>
            </BaseControl>
            <BaseControl label={'Mask Large'} __nextHasNoMarginBottom={true}>
                <MediaUploadCheck>
                    <MediaUpload
                        title={'Mask Large'}
                        onSelect={(value) => {
                            setLarge({
                                type: value.type,
                                id: value.id,
                                url: value.url,
                            });
                            callback(mobile, large, origin, size);
                        }}
                        allowedTypes={['image']}
                        value={large}
                        render={({open}) => {
                            return <PreviewThumbnail
                                image={large || {}}
                                callback={() => {
                                    setLarge(undefined);
                                    callback(mobile, large, origin, size);
                                }}
                                style={{
                                    objectFit: 'contain',
                                    backgroundColor: 'rgba(0,0,0,0.1)',
                                }}
                                onClick={open}
                            />;
                        }}
                    />
                </MediaUploadCheck>
            </BaseControl>
            <SelectControl
                __next40pxDefaultSize
                label="Mask Origin"
                value={origin}
                options={[
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
                ]}
                onChange={(value) => {
                    setOrigin(value);
                    callback(mobile, large, origin, size);
                }}
                __nextHasNoMarginBottom
            />
            <SelectControl
                __next40pxDefaultSize
                label="Mask Size"
                value={size}
                options={[
                    {label: 'Default', value: 'contain'},
                    {label: 'Cover', value: 'cover'},
                    {label: 'Vertical', value: 'auto 100%'},
                    {label: 'Horizontal', value: '100% auto'},
                ]}
                onChange={(value) => {
                    setSize(value);
                    callback(mobile, large, origin, size);
                }}
                __nextHasNoMarginBottom
            />
        </Grid>
    </>


}

export default Mask;
