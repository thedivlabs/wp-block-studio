import {
    ColorIndicator,
    Dropdown,
} from "@wordpress/components";

import {
    __experimentalColorGradientControl as ColorGradientControl,
} from "@wordpress/block-editor";

import { getEditorPalettes } from "Includes/helper";

/**
 * A unified color/gradient selector.
 *
 * Accepts either a color string ("#fff") or a gradient string ("linear-gradient(...)").
 * The parent is expected to store whatever we return via onChange.
 */
export function ColorSelector({ label, value, onChange }) {
    const { colors, gradients } = getEditorPalettes();

    // Normalize what the control expects
    const isGradient = typeof value === "string" && value.startsWith("linear-gradient");
    const colorValue = !isGradient ? value : undefined;
    const gradientValue = isGradient ? value : undefined;

    // Normalize output coming from ColorGradientControl
    const handleChange = (val) => {
        // val can be either:
        // - { color: string|null, gradient: undefined }
        // - { gradient: string|null, color: undefined }
        // - null


        console.log(val);

        if (!val) {
            onChange("");
            return;
        }

        if (val.color) {
            onChange(val.color);
            return;
        }

        if (val.gradient) {
            onChange(val.gradient);
            return;
        }

        // Fallback: pass through
        onChange("");
    };

    return (
        <Dropdown
            style={{ width: "100%" }}
            popoverProps={{ placement: "left-start" }}
            renderToggle={({ isOpen, onToggle }) => (
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
                    <ColorIndicator
                        colorValue={colorValue || gradientValue}
                    />
                    <span>{label}</span>
                </button>
            )}
            renderContent={() => (
                <div style={{ padding: "12px", width: "240px" }}>
                    <ColorGradientControl
                        label={label}
                        colorValue={colorValue}
                        gradientValue={gradientValue}
                        onChange={(newValue) => {
                            console.log("RAW", newValue);
                            onChange(newValue || "");
                        }}
                        colors={colors}
                        gradients={gradients}
                        enableAlpha
                    />
                </div>
            )}
        />
    );
}