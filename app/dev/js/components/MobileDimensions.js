import React, {useState} from "react"
import {
    __experimentalGrid as Grid,
    __experimentalBoxControl as BoxControl,
    __experimentalDimensionControl as DimensionControl, PanelBody
} from "@wordpress/components";
import {InspectorControls} from "@wordpress/block-editor";

function MobileDimensions({settings, pushSettings}) {


    function updateSettings(attr, val, callback) {
        if (callback) {
            callback(val);
        }
        pushSettings(Object.assign({}, settings, {[attr]: val}));
    }

    const [padding, setPadding] = useState(settings.padding || {
        top: undefined,
        left: undefined,
        right: undefined,
        bottom: undefined
    });

    const [margin, setMargin] = useState(settings.margin || {
        top: undefined,
        left: undefined,
        right: undefined,
        bottom: undefined
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
                            updateSettings('padding', values, setPadding);
                        }}
                    />
                    <BoxControl
                        __next40pxDefaultSize={true}
                        label={'Margin'}
                        values={margin}
                        onChange={(values) => {
                            updateSettings('margin', values, setMargin)
                        }}
                    />
                    <DimensionControl
                        label={'Block Spacing'}
                        onChange={(values) => {
                            updateSettings('gap', values, setGap)
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

    if (blockProps.style === undefined || props.attributes.mobile_dimensions === undefined) {
        return false;
    }

    const blockPadding = () => {

        const paddingTop = 'paddingTop' in blockProps.style ? blockProps.style.paddingTop : undefined;
        const paddingRight = 'paddingRight' in blockProps.style ? blockProps.style.paddingRight : undefined;
        const paddingBottom = 'paddingRight' in blockProps.style ? blockProps.style.paddingRight : undefined;
        const paddingLeft = 'paddingLeft' in blockProps.style ? blockProps.style.paddingLeft : undefined;

        return {
            paddingTop: paddingTop ? 'var(--wpbs-paddingTop, ' + blockProps.style.paddingTop + ')' : 'var(--wpbs-paddingTop)',
            paddingRight: paddingRight ? 'var(--wpbs-paddingRight, ' + blockProps.style.paddingTop + ')' : 'var(--wpbs-paddingRight)',
            paddingBottom: paddingBottom ? 'var(--wpbs-paddingBottom, ' + blockProps.style.paddingBottom + ')' : 'var(--wpbs-paddingBottom)',
            paddingLeft: paddingLeft ? 'var(--wpbs-paddingLeft, ' + blockProps.style.paddingLeft + ')' : 'var(--wpbs-paddingLeft)',
        };
    }
    const blockMargin = () => {

        const marginTop = 'marginTop' in blockProps.style ? blockProps.style.marginTop : undefined;
        const marginRight = 'marginRight' in blockProps.style ? blockProps.style.marginRight : undefined;
        const marginBottom = 'marginBottom' in blockProps.style ? blockProps.style.marginBottom : undefined;
        const marginLeft = 'marginLeft' in blockProps.style ? blockProps.style.marginLeft : undefined;

        return {
            marginTop: marginTop ? 'var(--wpbs-marginTop, ' + blockProps.style.paddingTop + ')' : 'var(--wpbs-marginTop)',
            marginRight: marginRight ? 'var(--wpbs-marginRight, ' + blockProps.style.paddingTop + ')' : 'var(--wpbs-marginRight)',
            marginBottom: marginBottom ? 'var(--wpbs-marginBottom, ' + blockProps.style.paddingBottom + ')' : 'var(--wpbs-marginBottom)',
            marginLeft: marginLeft ? 'var(--wpbs-marginLeft, ' + blockProps.style.paddingLeft + ')' : 'var(--wpbs-marginLeft)',
        };
    }
    const blockSpacing = () => {
        const blockSpacing = 'gap' in blockProps.style ? blockProps.style.gap : undefined;

        return blockSpacing ? 'var(--wpbs-gap, ' + blockProps.style.gap + ')' : 'var(--wpbs-gap)';
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

    if (blockProps.style === undefined || props.attributes.mobile_dimensions === undefined) {
        return false;
    }

    console.log(props);

    const padding = [
        'paddingTop' in blockProps.style ? '--wpbs-paddingTop:' + blockProps.style.paddingTop : false,
        'paddingRight' in blockProps.style ? '--wpbs-paddingRight:' + blockProps.style.paddingRight : false,
        'paddingBottom' in blockProps.style ? '--wpbs-paddingBottom:' + blockProps.style.paddingBottom : false,
        'paddingLeft' in blockProps.style ? '--wpbs-paddingLeft:' + blockProps.style.paddingLeft : false,
    ].join('; ');


    const margin = [
        'marginTop' in blockProps.style ? '--wpbs-marginTop:' + blockProps.style.marginTop : false,
        'marginRight' in blockProps.style ? '--wpbs-marginRight:' + blockProps.style.marginRight : false,
        'marginBottom' in blockProps.style ? '--wpbs-marginBottom:' + blockProps.style.marginBottom : false,
        'marginLeft' in blockProps.style ? '--wpbs-marginLeft:' + blockProps.style.marginLeft : false,
    ].join('; ');

    const css = [padding, margin].join(' ')

    return <style>{'@media (max-width: 768px) {.wpbs-content-section {' + {css} + '}}'}</style>;
}


export default MobileDimensions;

export {setMobileProps, MobileStyles};


