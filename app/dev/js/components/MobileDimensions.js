import React, {useState} from "react"
import {
    __experimentalGrid as Grid,
    __experimentalBoxControl as BoxControl,
    __experimentalDimensionControl as DimensionControl, PanelBody
} from "@wordpress/components";
import {InspectorControls} from "@wordpress/block-editor";

function MobileDimensions({settings, pushSettings}) {


    function updateSettings(attributes, val, callback) {
        if (callback) {
            callback(val);
        }
        pushSettings(Object.assign({}, settings, attributes));
    }

    const [padding, setPadding] = useState({
        top: 'paddingTop' in settings ? settings.paddingTop : undefined,
        left: 'paddingLeft' in settings ? settings.paddingLeft : undefined,
        right: 'paddingRight' in settings ? settings.paddingRight : undefined,
        bottom: 'paddingBottom' in settings ? settings.paddingBottom : undefined,
    });

    const [margin, setMargin] = useState({
        top: 'marginTop' in settings ? settings.marginTop : undefined,
        left: 'marginLeft' in settings ? settings.marginLeft : undefined,
        right: 'marginRight' in settings ? settings.marginRight : undefined,
        bottom: 'marginBottom' in settings ? settings.marginBottom : undefined,
    });

    const [gap, setGap] = useState('');

    return (
        <InspectorControls group={'styles'}>
            <PanelBody title={'Mobile'} initialOpen={false}>
                <Grid columns={1} gap={6}>
                    <BoxControl
                        __next40pxDefaultSize={true}
                        label={'Padding'}
                        splitOnAxis
                        values={padding}
                        sides={['vertical', 'horizontal']}
                        onChange={(values) => {
                            updateSettings({
                                paddingTop: values.top,
                                paddingRight: values.right,
                                paddingBottom: values.bottom,
                                paddingLeft: values.left,
                            }, values, setPadding);
                        }}
                    />
                    <BoxControl
                        __next40pxDefaultSize={true}
                        label={'Margin'}
                        values={margin}
                        onChange={(values) => {
                            updateSettings({
                                marginTop: values.top,
                                marginRight: values.right,
                                marginBottom: values.bottom,
                                marginLeft: values.left,
                            }, values, setMargin)
                        }}
                    />
                    <DimensionControl
                        label={'Block Spacing'}
                        onChange={(values) => {
                            updateSettings({
                                blockSpacing: values
                            }, values, setGap)
                        }}
                        sizes={wp.data.select('core/editor').getEditorSettings().spacingSizes}
                        value={gap}
                    />
                </Grid>
            </PanelBody>
        </InspectorControls>
    )
}

function setMobileProps(blockProps, props) {

    if (!blockProps.style || !props.attributes.mobile_dimensions) {
        return false;
    }

    const blockPadding = () => {

        const paddingTop = 'paddingTop' in props.attributes.mobile_dimensions ? 'paddingTop' in blockProps.style ? 'var(--wpbs-paddingTop, ' + blockProps.style.paddingTop + ')' : 'var(--wpbs-paddingTop)' : blockProps.style.paddingTop;
        const paddingRight = 'paddingRight' in props.attributes.mobile_dimensions ? 'paddingRight' in blockProps.style ? 'var(--wpbs-paddingRight, ' + blockProps.style.paddingRight + ')' : 'var(--wpbs-paddingRight)' : blockProps.style.paddingRight;
        const paddingBottom = 'paddingBottom' in props.attributes.mobile_dimensions ? 'paddingBottom' in blockProps.style ? 'var(--wpbs-paddingBottom, ' + blockProps.style.paddingBottom + ')' : 'var(--wpbs-paddingBottom)' : blockProps.style.paddingBottom;
        const paddingLeft = 'paddingLeft' in props.attributes.mobile_dimensions ? 'paddingLeft' in blockProps.style ? 'var(--wpbs-paddingLeft, ' + blockProps.style.paddingLeft + ')' : 'var(--wpbs-paddingLeft)' : blockProps.style.paddingLeft;

        return {
            paddingTop: paddingTop,
            paddingRight: paddingRight,
            paddingBottom: paddingBottom,
            paddingLeft: paddingLeft,
        };
    }
    const blockMargin = () => {

        const marginTop = 'marginTop' in props.attributes.mobile_dimensions ? 'marginTop' in blockProps.style ? 'var(--wpbs-marginTop, ' + blockProps.style.marginTop + ')' : 'var(--wpbs-marginTop)' : blockProps.style.marginTop;
        const marginRight = 'marginRight' in props.attributes.mobile_dimensions ? 'marginRight' in blockProps.style ? 'var(--wpbs-marginRight, ' + blockProps.style.marginRight + ')' : 'var(--wpbs-marginRight)' : blockProps.style.marginRight;
        const marginBottom = 'marginBottom' in props.attributes.mobile_dimensions ? 'marginBottom' in blockProps.style ? 'var(--wpbs-marginBottom, ' + blockProps.style.marginBottom + ')' : 'var(--wpbs-marginBottom)' : blockProps.style.marginBottom;
        const marginLeft = 'marginLeft' in props.attributes.mobile_dimensions ? 'marginLeft' in blockProps.style ? 'var(--wpbs-marginLeft, ' + blockProps.style.marginLeft + ')' : 'var(--wpbs-marginLeft)' : blockProps.style.marginLeft;

        return {
            marginTop: marginTop,
            marginRight: marginRight,
            marginBottom: marginBottom,
            marginLeft: marginLeft,
        };
    }
    const blockSpacing = () => {

        return 'blockSpacing' in props.attributes.mobile_dimensions ? 'blockSpacing' in blockProps.style ? 'var(--wpbs-blockSpacing, ' + blockProps.style.blockSpacing + ')' : 'var(--wpbs-blockSpacing)' : blockProps.style.blockSpacing;
    }

    return {
        ...blockProps,
        style: {
            ...blockProps.style,
            ...blockPadding(),
            ...blockMargin(),
            ...blockSpacing()
        }
    }
}

function MobileStyles({blockProps, props}) {

    if (!blockProps.style || !props.attributes.mobile_dimensions) {
        return false;
    }

    console.log(props);

    const padding = [
        'paddingTop' in props.attributes.mobile_dimensions ? '--wpbs-paddingTop:' + props.attributes.mobile_dimensions.paddingTop : false,
        'paddingRight' in props.attributes.mobile_dimensions ? '--wpbs-paddingRight:' + props.attributes.mobile_dimensions.paddingRight : false,
        'paddingBottom' in props.attributes.mobile_dimensions ? '--wpbs-paddingBottom:' + props.attributes.mobile_dimensions.paddingBottom : false,
        'paddingLeft' in props.attributes.mobile_dimensions ? '--wpbs-paddingLeft:' + props.attributes.mobile_dimensions.paddingLeft : false,
    ].join('; ');


    const margin = [
        'marginTop' in props.attributes.mobile_dimensions ? '--wpbs-marginTop:' + props.attributes.mobile_dimensions.marginTop : false,
        'marginRight' in props.attributes.mobile_dimensions ? '--wpbs-marginRight:' + props.attributes.mobile_dimensions.marginRight : false,
        'marginBottom' in props.attributes.mobile_dimensions ? '--wpbs-marginBottom:' + props.attributes.mobile_dimensions.marginBottom : false,
        'marginLeft' in props.attributes.mobile_dimensions ? '--wpbs-marginLeft:' + props.attributes.mobile_dimensions.marginLeft : false,
    ].join('; ');

    const css_properties = [padding, margin].join(' ')

    return <style>{'@media (max-width: 768px) {.wpbs-content-section {' + css_properties + '}}'}</style>;
}


export default MobileDimensions;

export {setMobileProps, MobileStyles};


