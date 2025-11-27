import {useEffect, useCallback, useState} from "@wordpress/element";
import {PanelBody} from "@wordpress/components";
import {BreakpointPanels} from "Components/BreakpointPanels";
import {isEqual, isPlainObject} from "lodash";
import {BackgroundFields} from "./BackgroundFields";
import {BackgroundMedia} from "./BackgroundMedia";
import {resolveFeaturedMedia, mergeEntry, cleanObject} from "Includes/helper";

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

export const BackgroundControls = function BackgroundControls({
                                                                  settings = {},
                                                                  callback,
                                                              }) {
    
    const [localValue, setLocalValue] = useState(settings);

    // Sync UI state when parent settings change
    useEffect(() => {
        const incoming = cleanObject(settings || {}, false);
        const local = cleanObject(localValue || {}, false);

        if (!isEqual(incoming, local)) {
            setLocalValue(settings || {});
        }
    }, [settings, localValue]);

    // Unified object-only output, identical to StyleEditorUI
    const handleChange = useCallback(
        (patch = {}) => {
            setLocalValue(patch);
            callback(patch);
        },
        [callback]
    );

    // Base renderer
    const baseRenderer = ({entry, update}) => {
        const current = entry || {};

        const handlePropsUpdate = (patch) => {
            update({props: patch});
        };


        return (
            <BackgroundFields
                settings={current.props || {}}
                updateFn={handlePropsUpdate}
                isBreakpoint={false}
            />
        );
    };

    // Breakpoint renderer
    const breakpointRenderer = ({entry, update}) => {
        const current = entry || {};

        const handlePropsUpdate = (patch) => {
            update({props: patch});
        };


        return (
            <BackgroundFields
                settings={current.props || {}}
                updateFn={handlePropsUpdate}
                isBreakpoint={true}
            />
        );
    };

    return (
        <PanelBody
            title="Background"
            initialOpen={false}
            className="wpbs-background-controls is-style-unstyled"
        >
            <BreakpointPanels
                label="Background"
                value={localValue}
                onChange={handleChange}
                render={{
                    base: baseRenderer,
                    breakpoints: breakpointRenderer,
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

    const resolvedSettings = resolveBackgroundSettings(bgSettings, !isSave);

    return (
        <div className={bgClass}>
            <BackgroundMedia settings={resolvedSettings} isSave={isSave}/>
        </div>
    );
}
