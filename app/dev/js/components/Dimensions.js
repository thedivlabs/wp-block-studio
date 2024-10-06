import React, {useState} from "react"
import {TabPanel} from '@wordpress/components'
import {
    __experimentalGrid as Grid,
    PanelBody,
    SelectControl,
    ToggleControl,
    __experimentalNumberControl as NumberControl,
} from "@wordpress/components";

export function Dimensions({attr = {}, update}) {

    const defaultSettings = Object.assign({}, {
        desktop: {
            height: null,
            width: null,
            gap: null,
            maxWidth: null,
            basis: null,
        },
        mobile: {
            height: null,
            width: null,
            gap: null,
            maxWidth: null,
            basis: null,
            padding: null,
            margin: null,
        }
    }, attr);

    const [settings, setSettings] = useState(defaultSettings);

    function updateSettings(tab, prop, val) {
        let result = settings;
        result[tab][prop] = val;
        setSettings(result);
        update(result);
    }

    function Panels(tab) {
        return <Grid columns={1} columnGap={20} rowGap={30}>
            <SelectControl
                label={'Display'}
                value={settings[tab.name].display}
                options={options.display}
                onChange={(value) => {
                    updateSettings(tab.name, 'display', value);
                }}
                __nextHasNoMarginBottom
            />

        </Grid>
    }

    function PanelsMobile(tab) {
        return <Grid columns={1} columnGap={20} rowGap={30}>
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
