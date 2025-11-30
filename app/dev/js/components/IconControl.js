import {
    BaseControl,
    TextControl,
    __experimentalGrid as Grid,
    __experimentalNumberControl as NumberControl,
    SelectControl,
    Button,
    Popover,
} from '@wordpress/components';
import {useEffect, useState, memo, useCallback} from "@wordpress/element";
import {isEqual} from "lodash";
import {ColorSelector} from "Components/ColorSelector";

const generateCSS = (fill, weight, opsz) =>
    `'FILL' ${Number(fill) || 0}, 'wght' ${weight || 300}, 'GRAD' 0, 'opsz' ${opsz || 32}`;

const FAMILY_MAP = {
    solid: "materialsymbols",
    outlined: "materialsymbolsoutlined",
    default: "materialsymbolsoutlined",
};


/* ------------------------------------------------------------
   ICON PREVIEW (real Material Icon)
------------------------------------------------------------ */
const IconPreview = memo(
    ({name, settings}) => {
        const iconName =
            typeof name === "string" && name.trim().length
                ? name.trim()
                : "home";

        const {style, weight, size, color, gradient} = settings;

        const css = `'FILL' ${style === "solid" ? 1 : 0},
                     'wght' ${weight},
                     'GRAD' 0,
                     'opsz 32`;

        const styleObj = {
            fontVariationSettings: css,
            display: "inline-flex",
            fontSize: '32px',
            fontWeight: weight,
            lineHeight: 1,
        };

        if (gradient) {
            styleObj.background = gradient;
            styleObj.color = "transparent";
        } else if (color) {
            styleObj.color = color;
            styleObj.background = "transparent";
        }

        return (
            <span className="material-symbols-outlined wpbs-icon" style={styleObj}>
                {iconName}
            </span>
        );
    },
    (a, b) => isEqual(a, b)
);

/* ------------------------------------------------------------
   ICON CONTROL
------------------------------------------------------------ */
export const IconControl = ({
                                fieldKey,
                                props,
                                value = {},
                                onChange,
                                label = "Icon",
                            }) => {
    const {updateEditorIcons} = window?.WPBS_StyleEditor ?? {};

    const [local, setLocal] = useState(value);
    const [isOpen, setIsOpen] = useState(false);

    const icons = props.attributes["wpbs-icons"] || [];
    const fieldId = fieldKey;

    /* ------------------------------------------------------------
       NORMALIZER
    ------------------------------------------------------------ */
    const normalize = (obj) => {
        const normalized = {
            name: obj.name || "",
            weight: Number(obj.weight ?? 300),
            size: Number(obj.size ?? 32),
            style: obj.style ?? "outlined",
            color: obj.color || "",
            gradient: obj.gradient || "",
        };

        normalized.css = generateCSS(
            normalized.style === "solid" ? 1 : 0,
            normalized.weight,
            normalized.size
        );

        return normalized;
    };

    /* ------------------------------------------------------------
       UPDATE — single object patch
    ------------------------------------------------------------ */
    const update = useCallback(
        (patch) => {
            if (!patch || typeof patch !== "object") return;

            setLocal((prev) => {
                const next = {...prev, ...patch};
                const normalized = normalize(next);

                // pass normalized object UP
                onChange(normalized);

                // update registry
                const nextIcons =
                    normalized.name.length > 0
                        ? [
                            ...icons.filter((icon) => icon.key !== fieldId),
                            {
                                key: fieldId,
                                name: normalized.name,
                                fill: normalized.style === "solid" ? 1 : 0,
                                weight: normalized.weight,
                                opsz: normalized.size,
                                grade: Number(normalized.grade ?? 0),
                                color: normalized.color,
                                gradient: normalized.gradient,
                            },
                        ]
                        : icons.filter((i) => i.key !== fieldId);

                props.setAttributes({"wpbs-icons": nextIcons});

                if (typeof updateEditorIcons === "function") {
                    updateEditorIcons(nextIcons);
                }

                return next;
            });
        },
        [icons, fieldId, onChange, props.setAttributes, updateEditorIcons]
    );

    /* ------------------------------------------------------------
       EXTERNAL → INTERNAL SYNC
    ------------------------------------------------------------ */
    useEffect(() => {
        if (!isEqual(value, local)) {
            setLocal(value);
        }
    }, [value]);

    /* ------------------------------------------------------------
       UI
    ------------------------------------------------------------ */
    const {name, weight, size, style, color, gradient} = local;

    const labelNode = (
        <>
            <span>Icon </span>
            <a
                href="https://fonts.google.com/icons"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                    textDecoration: "none",
                    display: "inline-flex",
                    justifyContent: "center",
                    alignItems: "center",
                    verticalAlign: "text-bottom",
                    height: "1em",
                    marginLeft: "2px",
                }}
            >
                <span
                    className="material-symbols-outlined"
                    style={{
                        fontVariationSettings: `'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 15`,
                        fontSize: "15px",
                    }}
                >
                    help
                </span>
            </a>
        </>
    );

    return (
        <BaseControl label={labelNode} style={{marginBottom: 0}}>
            <div style={{display: "flex", alignItems: "center", gap: "5px"}}>
                <TextControl
                    value={name}
                    onChange={(val) => update({name: val})}
                    placeholder="Icon name"
                    style={{flex: 1}}
                    __nextHasNoMarginBottom
                    __next40pxDefaultSize
                />

                <IconPreview name={name} settings={local}/>

                <div>
                    <Button
                        variant="secondary"
                        onClick={() => setIsOpen(!isOpen)}
                        icon="admin-generic"
                    />

                    {isOpen && (
                        <Popover
                            position="bottom right"
                            onClose={() => setIsOpen(false)}
                        >
                            <Grid
                                columns={1}
                                rowGap={15}
                                style={{padding: "10px", width: "200px"}}
                            >
                                <NumberControl
                                    label="Size"
                                    value={size}
                                    min={6}
                                    max={120}
                                    step={1}
                                    onChange={(val) =>
                                        update({size: Number(val)})
                                    }
                                />

                                <SelectControl
                                    label="Weight"
                                    value={weight}
                                    onChange={(val) =>
                                        update({weight: Number(val)})
                                    }
                                    options={[
                                        {value: 100, label: 100},
                                        {value: 200, label: 200},
                                        {value: 300, label: 300},
                                        {value: 400, label: 400},
                                        {value: 500, label: 500},
                                        {value: 600, label: 600},
                                    ]}
                                />

                                <SelectControl
                                    label="Style"
                                    value={style}
                                    onChange={(val) => update({style: val})}
                                    options={[
                                        {value: "outlined", label: "Outlined"},
                                        {value: "solid", label: "Solid"},
                                    ]}
                                />

                                <ColorSelector
                                    label="Icon Color"
                                    value={color || gradient}
                                    normalize={false}
                                    onChange={(val) => {
                                        // val = { color: ... } OR { gradient: ... }
                                        if (!val) return;

                                        const patch = {};

                                        if ("color" in val) {
                                            patch.color = val.color || "";
                                        }
                                        if ("gradient" in val) {
                                            patch.gradient = val.gradient || "";
                                        }

                                        update(patch);
                                    }}
                                />
                            </Grid>
                        </Popover>
                    )}
                </div>
            </div>
        </BaseControl>
    );
};


export const MaterialIcon = ({
                                 name,
                                 weight = 300,
                                 size,
                                 style = "outlined",
                                 color,
                                 gradient,
                                 className = "",
                             }) => {

    const css = `'FILL' ${style === "solid" ? 1 : 0},
                 'wght' ${weight},
                 'GRAD' 0,
                 'opsz' ${size || 32}`;

    const classNames = [
        "material-symbols-outlined",
        "wpbs-icon",
        className,
        gradient ? "--gradient" : null,
    ].filter(Boolean).join(" ");

    // Build the style object
    const styleObj = {
        fontVariationSettings: css,
        fontSize: `${size}px`,
        fontWeight: weight,
    };

    if (gradient) {
        // Gradient text technique
        styleObj.background = gradient;
        styleObj.color = "transparent"; // fallback
    } else if (color) {
        styleObj.color = color;
        styleObj.background = 'transparent';
    }

    return !name ? null : (
        <span className={classNames} style={styleObj}>
            {name}
        </span>
    );
};

