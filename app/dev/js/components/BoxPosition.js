import {
    __experimentalGrid as Grid,
    __experimentalUnitControl as UnitControl,
} from "@wordpress/components";
import {useState} from "react";


function BoxPosition({topValue, rightValue, bottomValue, leftValue, callback}) {

    const [top, setTop] = useState(topValue);
    const [right, setRight] = useState(rightValue);
    const [bottom, setBottom] = useState(bottomValue);
    const [left, setLeft] = useState(leftValue);

    return <Grid columns={2} columnGap={20} rowGap={20} style={{gridColumnStart: 1, gridColumnEnd: -1}}>

        <UnitControl
            label={'Top'}
            value={top || null}
            isResetValueOnUnitChange={true}
            onChange={(newValue) => {
                setTop(newValue);
                callback(newValue, right, bottom, left);
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
            value={right || null}
            isResetValueOnUnitChange={true}
            onChange={(newValue) => {
                setRight(newValue);
                callback(top, newValue, bottom, left);
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
            value={bottom || null}
            isResetValueOnUnitChange={true}
            onChange={(newValue) => {
                setBottom(newValue);
                callback(top, right, newValue, left);
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
            value={left || null}
            isResetValueOnUnitChange={true}
            onChange={(newValue) => {
                setLeft(newValue);
                callback(top, right, bottom, newValue);
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
