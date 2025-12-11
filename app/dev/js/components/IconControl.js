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
import {isEqual, debounce} from "lodash";
import {ColorSelector} from "Components/ColorSelector";

const generateCSS = (fill, weight, opsz) =>
    `'FILL' ${Number(fill) || 0}, 'wght' ${weight || 300}, 'GRAD' 0, 'opsz' ${opsz || 32}`;


export function getIconCssProps(icon = {}, returnKeys = [], string = false) {
    // Normalize inputs & defaults at the top
    const size = Number(icon.size) || 32;
    const weight = Number(icon.weight) || 300;
    const style = icon.style ?? "outlined";
    const color = icon.color || "";
    const gradient = icon.gradient || "";

    // Solid = 1, Outlined = 0
    const fill = style === "solid" ? 1 : 0;

    // Always generate a reliable variation string
    const fontVariation =
        icon.css ||
        `'FILL' ${fill}, 'wght' ${weight}, 'GRAD' 0, 'opsz' ${size}`;

    // CSS object with guaranteed non-empty values
    const fullStyles = {
        fontSize: `${size}px`,
        fontVariationSettings: fontVariation,
        fontFamily: '"Material Icons Outlines", sans-serif',
    };

    if (gradient) {
        fullStyles.background = gradient;
        fullStyles.color = "transparent";
        fullStyles.backgroundClip = "text";
    } else if (color) {
        fullStyles.color = color;
        fullStyles.background = "transparent";
    }

    // Optional key filtering
    let result =
        returnKeys.length > 0
            ? Object.fromEntries(
                Object.entries(fullStyles).filter(([key]) =>
                    returnKeys.includes(key)
                )
            )
            : fullStyles;

    // String mode → kebab-case + inline CSS
    if (string) {
        return Object.entries(result)
            .map(([key, value]) => {
                const cssKey = key.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
                return `${cssKey}: ${value}`;
            })
            .join("; ");
    }

    // Object mode
    return result;
}


/* ------------------------------------------------------------
   ICON PREVIEW (real Material Icon)
------------------------------------------------------------ */
const IconPreview = memo(
    ({name, settings, defaultName}) => {
        const iconName =
            typeof name === "string" && name.trim().length
                ? name.trim()
                : defaultName || "home";

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
                                defaultName,
                                label = "Icon",
                            }) => {
    const {updateEditorIcons} = window?.WPBS_StyleEditor ?? {};

    const [local, setLocal] = useState(value);
    const [localName, setLocalName] = useState(local.name || "");

    const [isOpen, setIsOpen] = useState(false);

    const icons = props.attributes["wpbs-icons"] || [];
    const fieldId = fieldKey;

    /* ------------------------------------------------------------
       NORMALIZER
    ------------------------------------------------------------ */
    const normalize = (obj) => {
        const normalized = {
            name: obj.name || defaultName || "",
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

        normalized.styles = getIconCssProps(normalized, [], true);

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

                updateEditorIcons(nextIcons);

                return next;
            });
        },
        [icons, fieldId, onChange, props.setAttributes, updateEditorIcons]
    );

    const debouncedUpdate = useCallback(
        debounce((patch) => {
            update(patch);
        }, 1200),
        [update]
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
            <span>{label} </span>
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
                    value={localName}
                    onChange={(val) => {
                        setLocalName(val);
                        debouncedUpdate({name: val});
                    }}
                    placeholder="Icon name"
                    style={{flex: 1}}
                    __nextHasNoMarginBottom
                    __next40pxDefaultSize
                />

                <IconPreview name={name} settings={local} defaultName={defaultName}/>

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
                                    value={{
                                        color: color,
                                        gradient: gradient,
                                    }}
                                    normalize={false}
                                    onChange={(val) => {
                                        update(val);
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
                                 defaultName,
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

    return !name && !defaultName ? null : (
        <span className={classNames} style={styleObj}>
            {name || defaultName}
        </span>
    );
};

