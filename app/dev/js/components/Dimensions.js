import React, {useState} from "react"
import {TabPanel} from '@wordpress/components'
import {
    __experimentalUnitControl as UnitControl,
    __experimentalGrid as Grid,
    PanelBody,
    __experimentalBoxControl as BoxControl,
} from "@wordpress/components";

export function DimensionsProps(props) {

    let style = {
        //'--column-display': props.attributes.layout.desktop.display,
    };

    let className = [
        'padding' in props.attributes.dimensions.mobile ? '--has-mobile-padding' : null,
        'margin' in props.attributes.dimensions.mobile ? '--has-mobile-margin' : null,
    ].filter(c => c);

    return {
        className: className.join(' '),
        style: style
    };

}

export function Dimensions({attr = {}, update}) {

    const defaultSettings = Object.assign({}, {
        desktop: {
            height: null,
            width: null,
            maxWidth: null,
            basis: null,
        },
        mobile: {
            height: null,
            width: null,
            gap: null,
            maxWidth: null,
            basis: null,
            padding: {},
            margin: {},
        }
    }, attr);

    const [settings, setSettings] = useState(defaultSettings);

    function updateSettings(tab, prop, val) {
        let result = settings;
        result[tab][prop] = val;
        setSettings(result);
        update(result);
    }

    function Fields(tab) {
        return <Grid columns={2} columnGap={20} rowGap={30}>
            <UnitControl
                label="Height"
                isResetValueOnUnitChange={true}
                onChange={(value) => {
                    updateSettings(tab.name, 'height', value);
                }}
                value={settings[tab.name].height}
            />
            <UnitControl
                label="Width"
                isResetValueOnUnitChange={true}
                onChange={(value) => {
                    updateSettings(tab.name, 'width', value);
                }}
                value={settings[tab.name].width}
            />
            <UnitControl
                label="Max-Width"
                isResetValueOnUnitChange={true}
                onChange={(value) => {
                    updateSettings(tab.name, 'maxWidth', value);
                }}
                value={settings[tab.name].maxWidth}
            />
            <UnitControl
                label="Basis"
                isResetValueOnUnitChange={true}
                onChange={(value) => {
                    updateSettings(tab.name, 'basis', value);
                }}
                value={settings[tab.name].basis}
            />
        </Grid>
    }

    function Panels(tab) {
        return Fields(tab);
    }

    function PanelsMobile(tab) {
        return <Grid columns={1} columnGap={20} rowGap={30}>
            <BoxControl
                label="Padding"
                values={settings[tab.name].padding || {}}
                onChange={(value) => {
                    updateSettings(tab.name, 'padding', value);
                }}
            />
            <BoxControl
                label="Margin"
                values={settings[tab.name].margin || {}}
                onChange={(value) => {
                    updateSettings(tab.name, 'margin', value);
                }}
            />
            {Fields(tab)}
        </Grid>
    }

    return (
        <PanelBody title={'Dimensions'} initialOpen={false}>
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
                {(tab) => {
                    if (tab.name === 'desktop') {
                        return Panels(tab);
                    }
                    if (tab.name === 'mobile') {
                        return PanelsMobile(tab);
                    }
                }}
            </TabPanel>
        </PanelBody>

    )
}
