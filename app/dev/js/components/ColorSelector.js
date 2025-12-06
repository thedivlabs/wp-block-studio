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

    const colorValue = value.color;
    const gradientValue = value.gradient;

    const handleColorChange = (val) => {
        const next = {...value, color: val};
        if (!isEqual(next, value)) {
            onChange(next);
        }
    };

    const handleGradientChange = (val) => {
        const next = {...value, gradient: val};
        if (!isEqual(next, value)) {
            onChange(next);
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
