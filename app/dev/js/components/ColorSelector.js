import {
    ColorIndicator,
    Dropdown,
} from "@wordpress/components";

import {
    __experimentalColorGradientControl as ColorGradientControl,
} from "@wordpress/block-editor";
import {isEqual} from 'lodash';


import {getEditorPalettes} from "Includes/helper";


export function ColorSelector({label, value = {}, onChange}) {
    const {colors, gradients} = getEditorPalettes();

    const colorValue = value.color === '' ? undefined : value.color;
    const gradientValue = value.gradient === '' ? undefined : value.gradient;

    const handleColorChange = (val) => {
        if (!isEqual(val, colorValue)) {
            onChange({color: val});
        }
    };

    const handleGradientChange = (val) => {
        if (!isEqual(val, gradientValue)) {
            onChange({gradient: val});
        }
    };


    return (
        <Dropdown
            style={{width: "100%"}}
            popoverProps={{placement: "left-start"}}
            renderToggle={({isOpen, onToggle}) => (
                <button
                    type="button"
                    onClick={onToggle}
                    aria-expanded={isOpen}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        cursor: "pointer",
                        gap: "8px",
                        padding: "10px 12px",
                        height: "40px",
                        border: "1px solid #ddd",
                        width: "100%",
                        background: "#fff",
                    }}
                >
                    <ColorIndicator colorValue={colorValue || gradientValue}/>
                    <span>{label}</span>
                </button>
            )}
            renderContent={() => (
                <div style={{padding: "8px"}} className="wpbs-color-dropdown">
                    <ColorGradientControl
                        label={label}
                        colorValue={colorValue}
                        gradientValue={gradientValue}
                        onColorChange={handleColorChange}
                        onGradientChange={handleGradientChange}
                        colors={colors}
                        gradients={gradients}
                        enableAlpha
                    />
                </div>
            )}
        />
    );
}
