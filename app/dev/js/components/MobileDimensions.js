import React, {useState} from "react"
import {parseProp} from '../../js/inc/helper'
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
        top: settings.paddingTop || '0',
        left: settings.paddingLeft || '0',
        right: settings.paddingRight || '0',
        bottom: settings.paddingBottom || '0',
    });

    const [margin, setMargin] = useState({
        top: settings.marginTop || '0',
        left: settings.marginLeft || '0',
        right: settings.marginRight || '0',
        bottom: settings.marginBottom || '0',
    });

    const [gap, setGap] = useState(settings.blockSpacing || '0');

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

    const mobile_dimensions = props.attributes.mobile_dimensions || {};
    const style = blockProps.style || {};

    const blockPadding = () => {

        const paddingTop = 'paddingTop' in style ? 'var(--wpbs-paddingTop, ' + (style.paddingTop || null) + ')' : 'var(--wpbs-paddingTop)';
        const paddingRight = 'paddingRight' in style ? 'var(--wpbs-paddingRight, ' + (style.paddingRight || null) + ')' : 'var(--wpbs-paddingRight)';
        const paddingBottom = 'paddingBottom' in style ? 'var(--wpbs-paddingBottom, ' + (style.paddingBottom || null) + ')' : 'var(--wpbs-paddingBottom)';
        const paddingLeft = 'paddingLeft' in style ? 'var(--wpbs-paddingLeft, ' + (style.paddingLeft || null) + ')' : 'var(--wpbs-paddingLeft)';

        return {
            paddingTop: paddingTop,
            paddingRight: paddingRight,
            paddingBottom: paddingBottom,
            paddingLeft: paddingLeft,
        };
    }

    const blockMargin = () => {

        const mobile_dimensions = props.attributes.mobile_dimensions || {};
        const style = blockProps.style || {};

        const marginTop = 'marginTop' in style ? 'var(--wpbs-marginTop, ' + (style.marginTop || null) + ')' : 'var(--wpbs-marginTop)';
        const marginRight = 'marginRight' in style ? 'var(--wpbs-marginRight, ' + (style.marginRight || null) + ')' : 'var(--wpbs-marginRight)';
        const marginBottom = 'marginBottom' in style ? 'var(--wpbs-marginBottom, ' + (style.marginBottom || null) + ')' : 'var(--wpbs-marginBottom)';
        const marginLeft = 'marginLeft' in style ? 'var(--wpbs-marginLeft, ' + (style.marginLeft || null) + ')' : 'var(--wpbs-marginLeft)';

        return {
            marginTop: marginTop,
            marginRight: marginRight,
            marginBottom: marginBottom,
            marginLeft: marginLeft,
        };
    }

    const blockSpacing = () => {

        const gap = getGapProp(blockProps, props);

        return {
            gap: gap
        }
    }

    return {
        ...blockProps,
        style: {
            ...blockProps.style,
            ...blockPadding(),
            ...blockMargin(),
            ...blockSpacing(),
        }
    }
}

function MobileStyles({blockProps, props}) {

    const mobile_dimensions = props.attributes.mobile_dimensions || {};
    const style = blockProps.style || {};

    const padding = [
        '--wpbs-paddingTop:' + (mobile_dimensions.paddingTop || style.paddingTop || 0),
        '--wpbs-paddingRight:' + (mobile_dimensions.paddingRight || style.paddingRight || 0),
        '--wpbs-paddingBottom:' + (mobile_dimensions.paddingBottom || style.paddingBottom || 0),
        '--wpbs-paddingLeft:' + (mobile_dimensions.paddingLeft || style.paddingLeft || 0),
    ].join('; ');

    const margin = [
        '--wpbs-marginTop:' + (mobile_dimensions.marginTop || style.marginTop || 0),
        '--wpbs-marginRight:' + (mobile_dimensions.marginRight || style.marginRight || 0),
        '--wpbs-marginBottom:' + (mobile_dimensions.marginBottom || style.marginBottom || 0),
        '--wpbs-marginLeft:' + (mobile_dimensions.marginLeft || style.marginLeft || 0),
    ].join('; ');

    const blockSpacing = '--wpbs-blockSpacing:' + getGapProp(blockProps, props);

    const css_properties = [padding, margin, blockSpacing].filter(x => x).join('; ')

    console.log(padding);

    return <style>{'@media (max-width: 768px) {.wpbs-content-section {' + css_properties + '}}'}</style>;
}

function getGapProp(blockProps, props) {


    const mobile_dimensions = 'attributes' in props ? props.attributes.mobile_dimensions || {} : {};
    const desktopGap = 'attributes' in props && 'style' in props.attributes && 'spacing' in props.attributes.style ? parseProp(props.attributes.style.spacing.blockGap) : false

    let gap = 0;

    if (mobile_dimensions.blockSpacing) {

        if (desktopGap) {
            gap = 'var(--wp--preset--spacing--' + mobile_dimensions.blockSpacing + ', ' + desktopGap + ')';
        } else {
            gap = 'var(--wp--preset--spacing--' + mobile_dimensions.blockSpacing + ')';
        }

    } else if (desktopGap) {
        gap = desktopGap;
    }

    return gap;

}


export default MobileDimensions;

export {setMobileProps, MobileStyles};


