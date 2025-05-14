import {
    __experimentalGrid as Grid,
    __experimentalUnitControl as UnitControl,
} from "@wordpress/components";
import {useState} from "react";


function BoxPosition({topValue, rightValue, bottomValue, leftValue, callback}) {

    return <Grid columns={2} columnGap={20} rowGap={20} style={{gridColumnStart: 1, gridColumnEnd: -1}}>

        <UnitControl
            label={'Top'}
            value={topValue || null}
            isResetValueOnUnitChange={true}
            onChange={(newValue) => {
                callback(newValue, rightValue, bottomValue, leftValue);
            }}
            units={[
                {value: 'px', label: 'px', default: 0},
                {value: '%', label: '%', default: 0},
                {value: 'em', label: 'em', default: 0},
                {value: 'rem', label: 'rem', default: 0},
                {value: 'vh', label: 'vh', default: 0},
                {value: 'vw', label: 'vw', default: 0},
                {value: 'ch', label: 'ch', default: 0},
                {value: 'hdr', label: 'header', default: 1},
            ]}
            __next40pxDefaultSize
        />
        <UnitControl
            label={'Right'}
            value={rightValue || null}
            isResetValueOnUnitChange={true}
            onChange={(newValue) => {
                callback(topValue, newValue, bottomValue, leftValue);
            }}
            units={[
                {value: 'px', label: 'px', default: 0},
                {value: '%', label: '%', default: 0},
                {value: 'em', label: 'em', default: 0},
                {value: 'rem', label: 'rem', default: 0},
                {value: 'vh', label: 'vh', default: 0},
                {value: 'vw', label: 'vw', default: 0},
                {value: 'ch', label: 'ch', default: 0},
            ]}
            __next40pxDefaultSize
        />
        <UnitControl
            label={'Bottom'}
            value={bottomValue || null}
            isResetValueOnUnitChange={true}
            onChange={(newValue) => {
                callback(topValue, rightValue, newValue, leftValue);
            }}
            units={[
                {value: 'px', label: 'px', default: 0},
                {value: '%', label: '%', default: 0},
                {value: 'em', label: 'em', default: 0},
                {value: 'rem', label: 'rem', default: 0},
                {value: 'vh', label: 'vh', default: 0},
                {value: 'vw', label: 'vw', default: 0},
                {value: 'ch', label: 'ch', default: 0},
            ]}
            __next40pxDefaultSize
        />
        <UnitControl
            label={'Left'}
            value={leftValue || null}
            isResetValueOnUnitChange={true}
            onChange={(newValue) => {
                callback(topValue, rightValue, bottomValue, newValue);
            }}
            units={[
                {value: 'px', label: 'px', default: 0},
                {value: '%', label: '%', default: 0},
                {value: 'em', label: 'em', default: 0},
                {value: 'rem', label: 'rem', default: 0},
                {value: 'vh', label: 'vh', default: 0},
                {value: 'vw', label: 'vw', default: 0},
                {value: 'ch', label: 'ch', default: 0},
            ]}
            __next40pxDefaultSize
        />

    </Grid>;
}

export default BoxPosition;
