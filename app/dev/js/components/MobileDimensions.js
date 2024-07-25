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

function setMobileProps(props) {

    const blockPadding = () => {
        return 'style' in props && 'paddingTop' in props.style ? 'var(--wpbs-paddingTop, ' + props.style.paddingTop + ')' : 'var(--wpbs-paddingTop)';
    }

    return {
        ...props,
        style: {
            ...props.style,
            paddingTop: blockPadding()
        }
    }
}

function MobileStyles() {
    return <style>{'@media (max-width: 768px) {.wpbs-content-section {--wpbs-paddingTop: 20rem}}'}</style>;
}


export default MobileDimensions;

export {setMobileProps, MobileStyles};


