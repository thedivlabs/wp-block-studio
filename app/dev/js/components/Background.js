import { memo, useCallback } from "@wordpress/element";
import { PanelBody } from "@wordpress/components";
import { BreakpointPanels } from "Components/BreakpointPanels";
import { merge } from "lodash";
import { BackgroundFields } from "./BackgroundFields";
import { BackgroundMedia } from "./BackgroundMedia";

function mergeEntryProps(entry = {}, patch = {}, reset = false) {
    const currentProps = entry.props || {};
    const baseProps = reset ? {} : currentProps;
    const nextProps = merge({}, baseProps, patch || {});

    return {
        ...entry,
        props: nextProps,
    };
}

function makeEntryHandlers(entry = {}, update) {
    const currentEntry = entry || {};
    const settings = currentEntry.props || {};

    const updateFn = (patch = {}, reset = false) => {
        const nextEntry = mergeEntryProps(currentEntry, patch, reset);
        update(nextEntry);
    };

    return { settings, updateFn };
}

export const BackgroundControls = memo(function BackgroundControls({
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
                props: next.props || {},
                breakpoints: next.breakpoints || {},
            });
        },
        [callback]
    );

    return (
        <PanelBody
            title="Background"
            initialOpen={hasAnyBackground(value)}
            className="wpbs-background-controls is-style-unstyled"
        >
            <BreakpointPanels
                label="Background"
                value={value}
                onChange={handleChange}
                render={{
                    base: ({ entry, update }) => {
                        const { settings, updateFn } = makeEntryHandlers(
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

                    breakpoints: ({ entry, update }) => {
                        const { settings, updateFn } = makeEntryHandlers(
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
});

export function hasAnyBackground(bgSettings = {}) {
    const { props = {}, breakpoints = {} } = bgSettings || {};

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

export function BackgroundElement({ attributes = {}, isSave = false }) {
    const { "wpbs-background": bgSettings = {} } = attributes;

    if (!hasAnyBackground(bgSettings)) return null;

    const bgClass = [
        "wpbs-background",
        "absolute top-0 left-0 w-full h-full z-0 pointer-events-none",
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <div className={bgClass}>
            <BackgroundMedia settings={bgSettings} isSave={isSave} />
        </div>
    );
}