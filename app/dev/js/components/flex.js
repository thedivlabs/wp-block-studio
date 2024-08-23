import React, {useState, useEffect} from "react"


import {TabPanel} from '@wordpress/components'


import {
    __experimentalGrid as Grid,
    PanelBody,
    SelectControl,
    ToggleControl,
    Button,
    RangeControl,
    GradientPicker,
} from "@wordpress/components";

export function Flex({settings = {}, pushSettings, clientId}) {

    settings = Object.assign({}, {
        direction: null,
        align: null,
        justify: null,
        wrap: null,
        basis: null,

        directionMobile: null,
        alignMobile: null,
        justifyMobile: null,
        wrapMobile: null,
        basisMobile: null,
    }, settings);

    const [direction, setDirection] = useState(settings.direction);
    const [align, setAlign] = useState(settings.align);
    const [justify, setJustify] = useState(settings.justify);
    const [basis, setBasis] = useState(settings.basis);
    const [wrap, setWrap] = useState(settings.wrap);

    const [directionMobile, setDirectionMobile] = useState(settings.directionMobile);
    const [alignMobile, setAlignMobile] = useState(settings.alignMobile);
    const [justifyMobile, setJustifyMobile] = useState(settings.justifyMobile);
    const [wrapMobile, setWrapMobile] = useState(settings.wrapMobile);
    const [basisMobile, setBasisMobile] = useState(settings.basisMobile);

    function updateSettings(attr, val, callback) {
        callback(val);
        if (pushSettings) {
            pushSettings(Object.assign({}, settings, {[attr]: val}));
        }
    }


    return (
        <PanelBody title={'Flex'}>
            <TabPanel
                className="wpbs-tab-panel"
                activeClass="active-tab"
                orientation="horizontal"
                initialTabName="desktop"
                tabs={[
                    {
                        name: 'desktop',
                        title: 'Desktop',
                        className: 'desktop'
                    },
                    {
                        name: 'mobile',
                        title: 'Mobile',
                        className: 'mobile'
                    },
                ]}>
                {
                    (tab) => {
                        return <Grid columns={2} columnGap={20} rowGap={20}>
                            <>
                                <SelectControl
                                    label="Direction"
                                    value={tab.name === 'mobile' ? directionMobile : direction}
                                    options={[
                                        {label: 'Default', value: null},
                                    ]}
                                    onChange={(value) => {
                                        updateSettings(tab.name === 'mobile' ? 'directionMobile' : 'direction', value, tab.name === 'mobile' ? setDirectionMobile : setDirection);
                                    }}
                                    __nextHasNoMarginBottom
                                />
                                <SelectControl
                                    label="Align"
                                    value={tab.name === 'mobile' ? alignMobile : align}
                                    options={[
                                        {label: 'Default', value: null},
                                    ]}
                                    onChange={(value) => {
                                        updateSettings(tab.name === 'mobile' ? 'alignMobile' : 'align', value, tab.name === 'mobile' ? setAlignMobile : setAlign);
                                    }}
                                    __nextHasNoMarginBottom
                                />

                                <SelectControl
                                    label="Justify"
                                    value={tab.name === 'mobile' ? justifyMobile : justify}
                                    options={[
                                        {label: 'Default', value: null},
                                    ]}
                                    onChange={(value) => {
                                        updateSettings(tab.name === 'mobile' ? 'justifyMobile' : 'justify', value, tab.name === 'mobile' ? setJustifyMobile : setJustify);

                                    }}
                                    __nextHasNoMarginBottom
                                />

                                <SelectControl
                                    label="Basis"
                                    value={tab.name === 'mobile' ? basisMobile : basis}
                                    options={[
                                        {label: 'Default', value: null},
                                    ]}
                                    onChange={(value) => {
                                        updateSettings(tab.name === 'mobile' ? 'basisMobile' : 'basis', value, tab.name === 'mobile' ? setBasisMobile : setBasis);
                                    }}
                                    __nextHasNoMarginBottom
                                />

                                <ToggleControl
                                    label="Wrap"
                                    checked={tab.name === 'mobile' ? wrapMobile : wrap}
                                    onChange={(value) => {
                                        updateSettings(tab.name === 'mobile' ? 'wrapMobile' : 'wrap', value, tab.name === 'mobile' ? setWrapMobile : setWrap);
                                    }}
                                    className={'flex items-center'}
                                    __nextHasNoMarginBottom
                                /></>
                        </Grid>

                    }
                }
            </TabPanel>
        </PanelBody>

    )
}

export function FlexStyles({flex = {}}) {
    console.log(flex);

    let styles = [];

    switch (flex.align) {
        case 'start':
            styles.push('items-start')
            break;
        case 'center':
            styles.push('items-center')
            break;
        case 'end':
            styles.push('items-end')
            break;
    }

    switch (flex.alignMobile) {
        case 'start':
            styles.push('max-lg:items-start')
            break;
        case 'center':
            styles.push('max-lg:items-center')
            break;
        case 'end':
            styles.push('max-lg:items-end')
            break;
    }

    switch (flex.align) {
        case 'start':
            styles.push('items-start')
            break;
        case 'center':
            styles.push('items-center')
            break;
        case 'end':
            styles.push('items-end')
            break;
    }

    switch (flex.alignMobile) {
        case 'start':
            styles.push('max-lg:items-start')
            break;
        case 'center':
            styles.push('max-lg:items-center')
            break;
        case 'end':
            styles.push('max-lg:items-end')
            break;
    }

    /*const styles = [
        flex.align ? flex.align
    ].filter(x => x).join(' ');*/

    return 'flex';
}