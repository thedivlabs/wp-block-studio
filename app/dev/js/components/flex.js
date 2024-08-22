import React, {useState, useEffect} from "react"
import {
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    __experimentalText as Text,
    __experimentalHeading as Heading,
} from '@wordpress/components';

import {
    __experimentalGrid as Grid,
    BaseControl,
    PanelBody,
    SelectControl,
    ToggleControl,
    Button,
    RangeControl,
    GradientPicker,
} from "@wordpress/components";

function Flex({settings = {}, pushSettings}) {

    settings = Object.assign({}, {
        direction: null,
        align: null,
        justify: null,
        wrap: null,
        basis: null,
        grow: null,
        shrink: null,
    }, settings)

    const [direction, setDirection] = useState(settings.direction);
    const [align, setAlign] = useState(settings.align);
    const [justify, setJustify] = useState(settings.justify);
    const [basis, setBasis] = useState(settings.basis);
    const [wrap, setWrap] = useState(settings.wrap);
    const [grow, setGrow] = useState(settings.grow);

    export function updateSettings(attr, val, callback) {
        callback(val);
        if (pushSettings) {
            pushSettings(Object.assign({}, settings, {[attr]: val}));
        }
    }


    return (

        <Card>
            <CardHeader>
                <Heading level={4}>Flex</Heading>
            </CardHeader>
            <CardBody>
                <Grid columns={2} columnGap={20} rowGap={20}>

                    <SelectControl
                        label="direction"
                        value={type}
                        options={[
                            {label: 'Default', value: null},
                        ]}
                        onChange={(value) => {
                            updateSettings('direction', value, setDirection);
                        }}
                        __nextHasNoMarginBottom
                    />

                    <SelectControl
                        label="align"
                        value={type}
                        options={[
                            {label: 'Default', value: null},
                        ]}
                        onChange={(value) => {
                            updateSettings('align', value, setDirection);
                        }}
                        __nextHasNoMarginBottom
                    />

                    <SelectControl
                        label="justify"
                        value={type}
                        options={[
                            {label: 'Default', value: null},
                        ]}
                        onChange={(value) => {
                            updateSettings('justify', value, setDirection);
                        }}
                        __nextHasNoMarginBottom
                    />

                    <SelectControl
                        label="basis"
                        value={type}
                        options={[
                            {label: 'Default', value: null},
                        ]}
                        onChange={(value) => {
                            updateSettings('basis', value, setDirection);
                        }}
                        __nextHasNoMarginBottom
                    />

                    <ToggleControl
                        label="Grow"
                        checked={grow}
                        onChange={(value) => {
                            setGrow(value);
                            updateSettings('basis', value, setDirection);
                        }}
                        className={'flex items-center'}
                        __nextHasNoMarginBottom
                    />

                    <ToggleControl
                        label="Wrap"
                        checked={wrap}
                        onChange={(value) => {
                            setWrap(value);
                            updateSettings('basis', value, setDirection);
                        }}
                        className={'flex items-center'}
                        __nextHasNoMarginBottom
                    />

                </Grid>
            </CardBody>
        </Card>
    )
}

export default Flex;