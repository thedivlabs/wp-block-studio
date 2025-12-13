import {
    BaseControl,
    TextControl,
    __experimentalGrid as Grid,
    SelectControl,
    Button,
    Popover,
} from "@wordpress/components";
import {useEffect, useState, memo, useCallback} from "@wordpress/element";
import {isEqual, debounce} from "lodash";
import {ColorSelector} from "Components/ColorSelector";

/* ------------------------------------------------------------
 * FONT AWESOME FONT VARIABLE MAP
 * ------------------------------------------------------------ */
const FONT_MAP = {
    classic: {
        solid: "var(--fa-font-solid)",
        regular: "var(--fa-font-regular)",
        light: "var(--fa-font-light)",
        thin: "var(--fa-font-thin)",
    },
    duotone: {
        solid: "var(--fa-font-duotone)",
        regular: "var(--fa-font-duotone-regular)",
        light: "var(--fa-font-duotone-light)",
        thin: "var(--fa-font-duotone-thin)",
    },
    sharp: {
        solid: "var(--fa-font-sharp-solid)",
        regular: "var(--fa-font-sharp-regular)",
        light: "var(--fa-font-sharp-light)",
        thin: "var(--fa-font-sharp-thin)",
    },
    "sharp-duotone": {
        solid: "var(--fa-font-sharp-duotone-solid)",
        regular: "var(--fa-font-sharp-duotone-regular)",
        light: "var(--fa-font-sharp-duotone-light)",
        thin: "var(--fa-font-sharp-duotone-thin)",
    },
    brands: {
        brands: "var(--fa-font-brands)",
    },
};

/* ------------------------------------------------------------
 * NORMALIZER (SINGLE SOURCE OF TRUTH)
 * ------------------------------------------------------------ */
function normalizeIcon(input = {}, defaultName = "") {
    const name = input.name || defaultName || "";
    const family = input.family ?? "classic";
    const style = input.style ?? "solid";
    const color = input.color || "";

    return {
        name,
        family,
        style,
        css: buildIconCssVars({
            name,
            family,
            style,
            color,
        }),
    };
}

/* ------------------------------------------------------------
 * BUILD CSS CUSTOM PROPERTIES (PERSISTED)
 * ------------------------------------------------------------ */
function buildIconCssVars({name, family, style, color}) {
    const font =
        FONT_MAP?.[family]?.[style] ??
        FONT_MAP.classic.solid;

    return {
        "--icon-family": family,
        "--icon-style": style,
        "--icon-name": name,
        "--icon-font": font,
        "--icon-color": color || "currentColor",
    };
}

/* ------------------------------------------------------------
 * FA CLASS BUILDER (DERIVED)
 * ------------------------------------------------------------ */
export function getFaClassNames({
                                    name,
                                    family = "classic",
                                    style = "solid",
                                }) {
    if (!name) return "";

    if (family === "brands") {
        return `fa-brands fa-${name}`;
    }

    return [
        family !== "classic" && `fa-${family}`,
        `fa-${style}`,
        `fa-${name}`,
    ]
        .filter(Boolean)
        .join(" ");
}

/* ------------------------------------------------------------
 * ICON PREVIEW (EDITOR)
 * ------------------------------------------------------------ */
const IconPreview = memo(
    ({settings, defaultName}) => {
        const icon = normalizeIcon(settings, defaultName);
        if (!icon.name) return null;

        return (
            <i
                aria-hidden="true"
                className={getFaClassNames(icon)}
                style={{color: icon.css["--icon-color"]}}
            />
        );
    },
    isEqual
);

/* ------------------------------------------------------------
 * ICON CONTROL
 * ------------------------------------------------------------ */
export const IconControl = ({
                                value = {},
                                onChange,
                                defaultName,
                                label = "Icon",
                            }) => {
    const [local, setLocal] = useState(() =>
        normalizeIcon(value, defaultName)
    );
    const [localName, setLocalName] = useState(local.name);
    const [isOpen, setIsOpen] = useState(false);

    /* --------------------------------------------------------
     * UPDATE
     * -------------------------------------------------------- */
    const update = useCallback(
        (patch) => {
            setLocal((prev) => {
                const next = normalizeIcon(
                    {...prev, ...patch},
                    defaultName
                );

                onChange(next);
                return next;
            });
        },
        [onChange, defaultName]
    );

    const debouncedUpdate = useCallback(
        debounce((patch) => update(patch), 600),
        [update]
    );

    /* --------------------------------------------------------
     * SYNC
     * -------------------------------------------------------- */
    useEffect(() => {
        const normalized = normalizeIcon(value, defaultName);
        if (!isEqual(normalized, local)) {
            setLocal(normalized);
            setLocalName(normalized.name);
        }
    }, [value, defaultName]);

    /* --------------------------------------------------------
     * UI
     * -------------------------------------------------------- */
    const {family, style} = local;

    return (
        <BaseControl label={label} style={{marginBottom: 0}}>
            <div style={{display: "flex", alignItems: "center", gap: "6px"}}>
                <TextControl
                    value={localName}
                    onChange={(val) => {
                        setLocalName(val);
                        debouncedUpdate({name: val});
                    }}
                    placeholder="check"
                    style={{flex: 1}}
                    __nextHasNoMarginBottom
                    __next40pxDefaultSize
                />

                <IconPreview settings={local} defaultName={defaultName}/>

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
                            style={{padding: "10px", width: "240px"}}
                        >
                            <SelectControl
                                label="Family"
                                value={family}
                                onChange={(val) => update({family: val})}
                                options={[
                                    {value: "classic", label: "Classic"},
                                    {value: "duotone", label: "Duotone"},
                                    {value: "sharp", label: "Sharp"},
                                    {
                                        value: "sharp-duotone",
                                        label: "Sharp Duotone",
                                    },
                                    {value: "brands", label: "Brands"},
                                ]}
                            />

                            <SelectControl
                                label="Style"
                                value={style}
                                onChange={(val) => update({style: val})}
                                options={[
                                    {value: "solid", label: "Solid"},
                                    {value: "regular", label: "Regular"},
                                    {value: "light", label: "Light"},
                                    {value: "thin", label: "Thin"},
                                ]}
                            />

                            <ColorSelector
                                label="Icon Color"
                                value={{
                                    color: local?.css?.["--icon-color"],
                                }}
                                normalize={false}
                                onChange={(val) =>
                                    update({color: val.color})
                                }
                            />
                        </Grid>
                    </Popover>
                )}
            </div>
        </BaseControl>
    );
};

/* ------------------------------------------------------------
 * <i> ICON RENDERER (PRIMARY OUTPUT)
 * ------------------------------------------------------------ */
export const FontAwesomeIcon = ({
                                    icon = {},
                                    defaultName = "calendar-check",
                                    className = "",
                                    ...rest
                                }) => {
    const normalized = normalizeIcon(icon, defaultName);
    if (!normalized.name) return null;

    return (
        <i
            aria-hidden="true"
            className={[
                getFaClassNames(normalized),
                className,
            ]
                .filter(Boolean)
                .join(" ")}
            {...rest}
        />
    );
};
