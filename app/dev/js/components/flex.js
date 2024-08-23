import React, {useState, useEffect} from "react"


import {TabPanel, Tab} from '@wordpress/components'


import {
    __experimentalGrid as Grid,
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

        directionMobile: null,
        alignMobile: null,
        justifyMobile: null,
        wrapMobile: null,
        basisMobile: null,
        growMobile: null,
        shrinkMobile: null,
    }, settings);

    const [direction, setDirection] = useState(settings.direction);
    const [align, setAlign] = useState(settings.align);
    const [justify, setJustify] = useState(settings.justify);
    const [basis, setBasis] = useState(settings.basis);
    const [wrap, setWrap] = useState(settings.wrap);
    const [grow, setGrow] = useState(settings.grow);

    const [directionMobile, setDirectionMobile] = useState(settings.directionMobile);
    const [alignMobile, setAlignMobile] = useState(settings.alignMobile);
    const [justifyMobile, setJustifyMobile] = useState(settings.justifyMobile);
    const [wrapMobile, setWrapMobile] = useState(settings.wrapMobile);
    const [basisMobile, setBasisMobile] = useState(settings.basisMobile);
    const [growMobile, setGrowMobile] = useState(settings.growMobile);

    function updateSettings(attr, val, callback) {
        callback(val);
        if (pushSettings) {
            pushSettings(Object.assign({}, settings, {[attr]: val}));
        }
    }

    const Tabs = {
        desktop: <>
            <SelectControl
                label="Direction"
                value={direction}
                options={[
                    {label: 'Default', value: null},
                ]}
                onChange={(value) => {
                    updateSettings('direction', value, setDirection);
                }}
                __nextHasNoMarginBottom
            />
            <SelectControl
                label="Align"
                value={align}
                options={[
                    {label: 'Default', value: null},
                ]}
                onChange={(value) => {
                    updateSettings('align', value, setAlign);
                }}
                __nextHasNoMarginBottom
            />

            <SelectControl
                label="Justify"
                value={justify}
                options={[
                    {label: 'Default', value: null},
                ]}
                onChange={(value) => {
                    updateSettings('justify', value, setJustify);
                }}
                __nextHasNoMarginBottom
            />

            <SelectControl
                label="Basis"
                value={basis}
                options={[
                    {label: 'Default', value: null},
                ]}
                onChange={(value) => {
                    updateSettings('basis', value, setBasis);
                }}
                __nextHasNoMarginBottom
            />

            <ToggleControl
                label="Grow"
                checked={grow}
                onChange={(value) => {
                    updateSettings('grow', value, setGrow);
                }}
                className={'flex items-center'}
                __nextHasNoMarginBottom
            />

            <ToggleControl
                label="Wrap"
                checked={wrap}
                onChange={(value) => {
                    updateSettings('wrap', value, setWrap);
                }}
                className={'flex items-center'}
                __nextHasNoMarginBottom
            /></>,
        mobile: <>
            <SelectControl
                label="Direction"
                value={directionMobile}
                options={[
                    {label: 'Default', value: null},
                ]}
                onChange={(value) => {
                    updateSettings('directionMobile', value, setDirectionMobile);
                }}
                __nextHasNoMarginBottom
            />

            <SelectControl
                label="Align"
                value={alignMobile}
                options={[
                    {label: 'Default', value: null},
                ]}
                onChange={(value) => {
                    updateSettings('alignMobile', value, setAlignMobile);
                }}
                __nextHasNoMarginBottom
            />

            <SelectControl
                label="Justify"
                value={justifyMobile}
                options={[
                    {label: 'Default', value: null},
                ]}
                onChange={(value) => {
                    updateSettings('justifyMobile', value, setJustifyMobile);
                }}
                __nextHasNoMarginBottom
            />

            <SelectControl
                label="Basis"
                value={basisMobile}
                options={[
                    {label: 'Default', value: null},
                ]}
                onChange={(value) => {
                    updateSettings('basisMobile', value, setBasisMobile);
                }}
                __nextHasNoMarginBottom
            />

            <ToggleControl
                label="Grow"
                checked={growMobile}
                onChange={(value) => {
                    updateSettings('growMobile', value, setGrowMobile);
                }}
                className={'flex items-center'}
                __nextHasNoMarginBottom
            />

            <ToggleControl
                label="Wrap"
                checked={wrapMobile}
                onChange={(value) => {
                    updateSettings('wrapMobile', value, setWrapMobile);
                }}
                className={'flex items-center'}
                __nextHasNoMarginBottom
            /></>
    };

    function renderTabs(tab) {
        if (tab.name === 'desktop') {
            return Tabs.desktop;
        }

        if (tab.name === 'mobile') {
            return Tabs.mobile;
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
                            {renderTabs(tab)}
                        </Grid>

                    }
                }
            </TabPanel>
        </PanelBody>

    )
}

export default Flex;