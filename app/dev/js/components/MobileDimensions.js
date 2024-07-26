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

        const paddingTop = 'paddingTop' in style ? 'var(--wpbs-paddingTop, ' + (style.paddingTop || 0) + ')' : 'var(--wpbs-paddingTop)';
        const paddingRight = 'paddingRight' in style ? 'var(--wpbs-paddingRight, ' + (style.paddingRight || 0) + ')' : 'var(--wpbs-paddingRight)';
        const paddingBottom = 'paddingBottom' in style ? 'var(--wpbs-paddingBottom, ' + (style.paddingBottom || 0) + ')' : 'var(--wpbs-paddingBottom)';
        const paddingLeft = 'paddingLeft' in style ? 'var(--wpbs-paddingLeft, ' + (style.paddingLeft || 0) + ')' : 'var(--wpbs-paddingLeft)';

        return {
            paddingTop: paddingTop,
            paddingRight: paddingRight,
            paddingBottom: paddingBottom,
            paddingLeft: paddingLeft,
        };
    }

    const blockMargin = () => {

        const marginTop = 'marginTop' in style ? 'var(--wpbs-marginTop, ' + (style.marginTop || 0) + ')' : 'var(--wpbs-marginTop)';
        const marginRight = 'marginRight' in style ? 'var(--wpbs-marginRight, ' + (style.marginRight || 0) + ')' : 'var(--wpbs-marginRight)';
        const marginBottom = 'marginBottom' in style ? 'var(--wpbs-marginBottom, ' + (style.marginBottom || 0) + ')' : 'var(--wpbs-marginBottom)';
        const marginLeft = 'marginLeft' in style ? 'var(--wpbs-marginLeft, ' + (style.marginLeft || 0) + ')' : 'var(--wpbs-marginLeft)';

        return {
            marginTop: marginTop,
            marginRight: marginRight,
            marginBottom: marginBottom,
            marginLeft: marginLeft,
        };
    }

    const blockSpacing = () => {

        const attr = 'attributes' in props && 'style' in props.attributes && 'spacing' in props.attributes.style ? props.attributes.style.spacing.blockGap : false;
        const defaultAttr = attr ? 'var(--wp--' + attr.replace('var:', '').replaceAll('|', '--') + ')' : null;

        return {
            gap: 'blockSpacing' in mobile_dimensions ? 'var(--wpbs-blockSpacing,' + defaultAttr + ')' : 'var(--wpbs-blockSpacing)'
        };
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

    const mobile_dimensions = props.attributes.mobile_dimensions;

    const padding = [
        '--wpbs-paddingTop:' + (mobile_dimensions.paddingTop || 0),
        '--wpbs-paddingRight:' + (mobile_dimensions.paddingRight || 0),
        '--wpbs-paddingBottom:' + (mobile_dimensions.paddingBottom || 0),
        '--wpbs-paddingLeft:' + (mobile_dimensions.paddingLeft || 0),
    ].join('; ');

    const margin = [
        '--wpbs-marginTop:' + (mobile_dimensions.marginTop || 0),
        '--wpbs-marginRight:' + (mobile_dimensions.marginRight || 0),
        '--wpbs-marginBottom:' + (mobile_dimensions.marginBottom || 0),
        '--wpbs-marginLeft:' + (mobile_dimensions.marginLeft || 0),
    ].join('; ');

    const blockSpacing = [
        '--wpbs-blockSpacing:var(--wp--preset--spacing--' + (mobile_dimensions.blockSpacing || 0) + ')',
    ].join('; ');

    const css_properties = [padding, margin, blockSpacing].join('; ')

    return <style>{'@media (max-width: 768px) {.wpbs-content-section {' + css_properties + '}}'}</style>;
}


export default MobileDimensions;

export {setMobileProps, MobileStyles};


