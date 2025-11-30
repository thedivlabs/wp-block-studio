import {
    ColorIndicator,
    Dropdown,
} from "@wordpress/components";

import {
    __experimentalColorGradientControl as ColorGradientControl,
} from "@wordpress/block-editor";

import {getEditorPalettes} from "Includes/helper";

/**
 * A unified color/gradient selector.
 *
 * Accepts either a color string ("#fff") or a gradient string ("linear-gradient(...)").
 * The parent is expected to store whatever we return via onChange.
 */
export function ColorSelector({label, value, onChange, normalize = true}) {
    const {colors, gradients} = getEditorPalettes();

    const isGradient = typeof value === "string" && value.startsWith("linear-gradient");
    const colorValue = !isGradient ? value : undefined;
    const gradientValue = isGradient ? value : undefined;

    const handleColorChange = (val) => {

        if (val === undefined) {
            return
        }

        if (normalize) {
            onChange(val);
        } else {
            onChange({
                color: val,
                gradient: undefined
            });
        }
    };

    const handleGradientChange = (val) => {

        if (val === undefined) {
            return
        }

        if (normalize) {
            onChange(val);
        } else {
            onChange({
                gradient: val,
                color: undefined
            });
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
