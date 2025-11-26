import {memo, useCallback} from "@wordpress/element";
import {PanelBody} from "@wordpress/components";
import {BreakpointPanels} from "Components/BreakpointPanels";
import {merge, isPlainObject} from "lodash";
import {BackgroundFields} from "./BackgroundFields";
import {BackgroundMedia} from "./BackgroundMedia";
import {resolveFeaturedMedia} from "Includes/helper";

function resolveBackgroundSettings(settings = {}, isEditor = false) {
    const base = settings?.props || {};
    const bps = settings?.breakpoints || {};

    const baseType = base.type;
    const baseRes = (base.resolution || "large").toUpperCase();

    const resolved = {
        props: {
            ...base,
            media: resolveFeaturedMedia({
                type: baseType,
                media: base.media,
                resolution: baseRes,
                isEditor,
            }),
        },
        breakpoints: {},
    };

    Object.entries(bps).forEach(([bpKey, bpEntry]) => {
        const bpProps = bpEntry?.props || {};
        const bpType = bpProps.type || base.type;
        const bpRes = (bpProps.resolution || base.resolution || "large").toUpperCase();

        resolved.breakpoints[bpKey] = {
            props: {
                ...bpProps,
                media: resolveFeaturedMedia({
                    type: bpType,
                    media: bpProps.media || base.media,
                    resolution: bpRes,
                    isEditor,
                }),
            },
        };
    });

    return resolved;
}

function deepMergeAllowUndefined(base = {}, patch = {}) {
    const result = {...base};

    for (const key in patch) {
        const value = patch[key];

        if (isPlainObject(value)) {
            // recurse
            result[key] = deepMergeAllowUndefined(base[key] || {}, value);
        } else {
            // allow clearing: undefined, null, empty string
            result[key] = value;
        }
    }

    return result;
}

function mergeEntryProps(entry = {}, patch = {}, reset = false) {
    const currentProps = entry.props || {};
    const baseProps = reset ? {} : currentProps;

    return {
        ...entry,
        props: deepMergeAllowUndefined(baseProps, patch),
    };
}

function makeEntryHandlers(entry = {}, update) {
    const currentEntry = entry || {};
    const settings = currentEntry.props || {};

    const updateFn = (patch = {}, reset = false) => {
        const nextEntry = mergeEntryProps(currentEntry, patch, reset);
        update(nextEntry);
    };

    return {settings, updateFn};
}

export const BackgroundControls = function BackgroundControls({
                                                                  settings = {},
                                                                  callback,
                                                              }) {
    const value = {
        props: settings?.props || {},
        breakpoints: settings?.breakpoints || {},
    };

    const handleChange = useCallback(
        (next = {}) => {
            callback({
                props: next.props ?? value.props,
                breakpoints: next.breakpoints ?? value.breakpoints,
            });

        },
        [callback]
    );

    return (
        <PanelBody
            title="Background"
            initialOpen={false}
            className="wpbs-background-controls is-style-unstyled"
        >
            <BreakpointPanels
                label="Background"
                value={value}
                onChange={handleChange}
                render={{
                    base: ({entry, update}) => {
                        const {settings, updateFn} = makeEntryHandlers(
                            entry,
                            update
                        );

                        return (
                            <BackgroundFields
                                settings={settings}
                                updateFn={updateFn}
                                isBreakpoint={false}
                            />
                        );
                    },

                    breakpoints: ({entry, update}) => {
                        const {settings, updateFn} = makeEntryHandlers(
                            entry,
                            update
                        );

                        return (
                            <BackgroundFields
                                settings={settings}
                                updateFn={updateFn}
                                isBreakpoint={true}
                            />
                        );
                    },
                }}
            />
        </PanelBody>
    );
};

export function hasAnyBackground(bgSettings = {}) {
    const {props = {}, breakpoints = {}} = bgSettings || {};

    const check = (obj) => {
        if (!obj) return false;

        if (obj.media?.source) return true;
        if (obj.media?.id) return true;
        if (obj.media?.isPlaceholder) return true;

        if (obj.color) return true;
        if (obj.overlay) return true;
        if (obj.fade) return true;

        return false;
    };

    if (check(props)) return true;

    for (const bp of Object.values(breakpoints)) {
        if (check(bp?.props)) return true;
    }

    return false;
}

export function BackgroundElement({attributes = {}, isSave = false}) {
    const {"wpbs-background": bgSettings = {}} = attributes;

    if (!hasAnyBackground(bgSettings)) return null;

    const bgClass = [
        "wpbs-background",
        "absolute top-0 left-0 w-full h-full z-0 pointer-events-none",
    ]
        .filter(Boolean)
        .join(" ");
    //console.log(bgSettings);
    const resolvedSettings = resolveBackgroundSettings(bgSettings, !isSave);

    return (
        <div className={bgClass}>
            <BackgroundMedia settings={resolvedSettings} isSave={isSave}/>
        </div>
    );
}