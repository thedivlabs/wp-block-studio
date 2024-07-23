import React, {useState} from "react"
import {
    BaseControl,
    useBaseControlProps,
    PanelBody,
    __experimentalGrid as Grid,
    __experimentalBoxControl as BoxControl, RangeControl
} from "@wordpress/components";
import {InspectorControls} from "@wordpress/block-editor";

function MobileDimensions({settings, pushSettings}) {


    function updateSettings(attr, val, callback) {
        if (callback) {
            callback(val);
        }
        pushSettings(Object.assign({}, settings, {[attr]: val}));
    }

    const [padding, setPadding] = useState({
        top: undefined,
        left: undefined,
        right: undefined,
        bottom: undefined,
    });

    const [margin, setMargin] = useState({
        top: undefined,
        left: undefined,
        right: undefined,
        bottom: undefined,
    });

    const [gap, setGap] = useState(0);

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
                            updateSettings('padding', values, setPadding)
                        }}
                    />
                    <BoxControl
                        __next40pxDefaultSize={true}
                        label={'Margin'}
                        values={margin}
                        onChange={(values) => {
                            updateSettings('padding', values, setMargin)
                        }}
                    />
                    <RangeControl
                        __next40pxDefaultSize={true}
                        label="Block Spacing"
                        value={ gap }
                        onChange={(values) => {
                            updateSettings('gap', values, setGap)
                        }}
                        min={ 0 }
                        max={ 7 }
                    />
                </Grid>
            </PanelBody>
        </InspectorControls>
    )
}

export default MobileDimensions