import {
    __experimentalBorderControl as BorderControl,
    __experimentalGrid as Grid, __experimentalInputControl as InputControl,
    __experimentalNumberControl as NumberControl, __experimentalUnitControl as UnitControl,
    BaseControl, ToggleControl
} from "@wordpress/components";
import Breakpoint from "Components/Breakpoint.js";
import {PanelColorSettings} from "@wordpress/block-editor";
import React from "react";

export const SWIPER_OPTIONS_DEFAULT = {
    createElements: false,
    navigation: {
        enabled: true,
        nextEl: '.wpbs-slider-btn--next',
        prevEl: '.wpbs-slider-btn--prev',
    },
    pagination: {
        enabled: true,
        el: '.swiper-pagination',
    },
    watchSlidesProgress: true,
    updateOnWindowResize: true,
    simulateTouch: true,
    slidesPerView: 1,
    spaceBetween: 0,
    watchOverflow: true,
    passiveListeners: true,
    grabCursor: true,
    uniqueNavElements: true,
};


export const imageButtonStyle = {
    border: '1px dashed lightgray',
    width: '100%',
    height: 'auto',
    aspectRatio: '16/9',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
}

export const GridControls = ({grid, callback}) => {
    return <Grid columns={1} columnGap={15} rowGap={20}>
        <BaseControl label={'Grid Columns'} __nextHasNoMarginBottom={true}>
            <Grid columns={3} columnGap={15} rowGap={20}>
                <NumberControl
                    label={'Mobile'}
                    __next40pxDefaultSize
                    isShiftStepEnabled={false}
                    onChange={(newValue) => {
                        callback({'columns-mobile': newValue});
                    }}
                    value={grid['columns-mobile']}
                />
                <NumberControl
                    label={'Small'}
                    __next40pxDefaultSize
                    isShiftStepEnabled={false}
                    onChange={(newValue) => {
                        callback({'columns-small': newValue});
                    }}
                    value={grid['columns-small']}
                />
                <NumberControl
                    label={'Large'}
                    __next40pxDefaultSize
                    isShiftStepEnabled={false}
                    onChange={(newValue) => {
                        callback({'columns-large': newValue});
                    }}
                    value={grid['columns-large']}
                />
            </Grid>
        </BaseControl>
        <Grid columns={2} columnGap={15} rowGap={20} style={{padding: '10px 0'}}>
            <Breakpoint
                label={'Breakpoint SM'}
                defaultValue={grid['breakpoint-small']}
                callback={(newValue) => {
                    callback({'breakpoint-small': newValue});
                }}/>
            <Breakpoint
                label={'Breakpoint LG'}
                defaultValue={grid['breakpoint-large']}
                callback={(newValue) => {
                    callback({'breakpoint-large': newValue});
                }}/>
        </Grid>
        <Grid columns={2} columnGap={15} rowGap={20} style={{padding: '10px 0'}}>
            <ToggleControl
                __nextHasNoMarginBottom
                label="Masonry"
                checked={!!grid['masonry']}
                onChange={(newValue) => {
                    callback({'masonry': newValue});
                }}
            />
        </Grid>
        <BorderControl
            __next40pxDefaultSize
            enableAlpha
            enableStyle
            disableUnits
            value={grid['divider'] || {}}
            colors={WPBS?.settings?.colors ?? []}
            __experimentalIsRenderedInSidebar={true}
            label="Divider"
            onChange={(newValue) => {
                callback({'divider': newValue})
            }}
            shouldSanitizeBorder
        />
        <Grid columns={2} columnGap={15} rowGap={20}>

            <InputControl
                label={'Divider Icon'}
                __next40pxDefaultSize
                value={grid['divider-icon']}
                onChange={(newValue) => {
                    callback({'divider-icon': newValue})
                }}
            />
            <UnitControl
                label={'Icon Size'}
                value={grid['divider-icon-size']}
                isResetValueOnUnitChange={true}
                onChange={(newValue) => {
                    callback({'divider-icon-size': newValue})
                }}
                units={[
                    {value: 'px', label: 'px', default: 0},
                    {value: 'em', label: 'em', default: 0},
                    {value: 'rem', label: 'rem', default: 0},
                    {value: 'vw', label: 'vw', default: 0},
                ]}
                __next40pxDefaultSize
            />
        </Grid>
        <PanelColorSettings
            enableAlpha
            className={'!p-0 !border-0 [&_.components-tools-panel-item]:!m-0'}
            colorSettings={[
                {
                    slug: 'icon-color',
                    label: 'Divider Icon Color',
                    value: grid['divider-icon-color'],
                    onChange: (newValue) => {
                        callback({'divider-icon-color': newValue})
                    },
                    isShownByDefault: true
                }
            ]}
        />
    </Grid>
};