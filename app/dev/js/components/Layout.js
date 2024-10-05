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

export function Layout({settings = {}, pushSettings, clientId}) {

    settings = Object.assign({}, {
        direction: null,
        align: null,
        justify: null,
        wrap: null,

        directionMobile: null,
        alignMobile: null,
        justifyMobile: null,
        wrapMobile: null,
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
                        return <>
                            <Grid columns={1} columnGap={30} rowGap={20}>
                                <Grid columns={2} columnGap={20} rowGap={20}>
                                    <SelectControl
                                        label="Direction"
                                        value={tab.name === 'mobile' ? directionMobile : direction}
                                        options={[
                                            {label: 'Row', value: 'row'},
                                            {label: 'Column', value: 'column'},
                                            {label: 'None', value: 'none'},
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
                                            {label: 'Start', value: 'start'},
                                            {label: 'Center', value: 'center'},
                                            {label: 'End', value: 'end'},
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
                                            {label: 'Start', value: 'start'},
                                            {label: 'Center', value: 'center'},
                                            {label: 'End', value: 'end'},
                                        ]}
                                        onChange={(value) => {
                                            updateSettings(tab.name === 'mobile' ? 'justifyMobile' : 'justify', value, tab.name === 'mobile' ? setJustifyMobile : setJustify);
                                        }}
                                        __nextHasNoMarginBottom
                                    />
                                </Grid>
                                <Grid columns={2} columnGap={20} rowGap={20}>
                                    <ToggleControl
                                        label="Wrap"
                                        checked={tab.name === 'mobile' ? wrapMobile : wrap}
                                        onChange={(value) => {
                                            updateSettings(tab.name === 'mobile' ? 'wrapMobile' : 'wrap', value, tab.name === 'mobile' ? setWrapMobile : setWrap);
                                        }}
                                        className={'flex items-center col-span-2'}
                                        __nextHasNoMarginBottom
                                    />
                                </Grid>
                            </Grid>
                        </>

                    }
                }
            </TabPanel>
        </PanelBody>

    )
}

export function FlexStyles({flex = {}}) {

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

    switch (flex.justify) {
        case 'start':
            styles.push('justify-start')
            break;
        case 'center':
            styles.push('justify-center')
            break;
        case 'end':
            styles.push('justify-end')
            break;
    }

    switch (flex.justifyMobile) {
        case 'start':
            styles.push('max-lg:justify-start')
            break;
        case 'center':
            styles.push('max-lg:justify-center')
            break;
        case 'end':
            styles.push('max-lg:justify-end')
            break;
    }
    switch (flex.direction) {
        case 'row':
            styles.push('flex flex-row')
            break;
        case 'column':
            styles.push('flex flex-col')
            break;
        case 'none':
            styles.push('block')
            break;
    }

    switch (flex.directionMobile) {
        case 'row':
            styles.push('max-lg:flex max-lg:flex-row')
            break;
        case 'column':
            styles.push('max-lg:flex max-lg:flex-col')
            break;
        case 'none':
            styles.push('max-lg:block')
            break;
    }

    if (flex.wrap) {
        styles.push('lg:flex-wrap');
    }

    if (flex.wrapMobile) {
        styles.push('max-lg:flex-wrap');
    }

    return styles.filter(x => x).join(' ');
}