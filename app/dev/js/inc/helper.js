import {
    __experimentalBorderControl as BorderControl,
    __experimentalGrid as Grid, __experimentalInputControl as InputControl,
    __experimentalNumberControl as NumberControl, __experimentalUnitControl as UnitControl,
    BaseControl, ToggleControl
} from "@wordpress/components";
import Breakpoint from "Components/Breakpoint.js";
import {PanelColorSettings} from "@wordpress/block-editor";
import React from "react";

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

