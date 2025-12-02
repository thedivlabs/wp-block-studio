import Modals from './modules/modals'
import Loader from './modules/loader'
import Popup from './modules/popup'
import Lightbox from './modules/Lightbox'
import Video from './modules/video'
import Slider from './modules/slider'
import Reveal from './modules/reveal'
import Team from './modules/team'


class WPBS_Theme {

    static modals;
    static loader;
    static popup;
    static settings;
    static lightbox;
    static video;
    static slider;
    static reveal;

    constructor() {

        this.modals = Modals;
        this.loader = Loader;
        this.popup = Popup;
        this.lightbox = Lightbox;
        this.video = Video;
        this.slider = Slider;
        this.reveal = Reveal;
        this.team = Team;

        this.settings = window?.WPBS?.settings ?? {};
        this.modals.init();
        this.loader.init();
        this.lightbox.init();
        this.video.init();
        this.slider.init();
        this.reveal.init();
        this.team.init();

        window.WPBS = this;

        this.init();

        if (document.querySelector('.wpbs-map')) {

            window.maps_callback = () => {
                const maps_loaded_event = new CustomEvent('wpbs_maps_loaded');
                document.dispatchEvent(maps_loaded_event)
            }

            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${this?.settings?.places?.maps_key}&libraries=places,marker&callback=maps_callback&loading=async`;
            script.id = 'wpbs-google-maps';
            script.async = true;
            script.defer = true;
            document.head.appendChild(script);
        }


    }

    gridDividers(element, args = {}, uniqueId = false) {
        if (!element || !uniqueId) {
            return;
        }

        console.log(args);

        const {divider} = args;
        if (!divider) {
            return;
        }

        const settings = WPBS?.settings ?? {};
        const themeBreakpoints = settings.breakpoints ?? {};

        // Expect something like:
        // args.columns = { xs: 1, sm: 2, md: 3, lg: 4 }
        // args.breakpointMap (optional) = { mobile: 'xs', tablet: 'md' } etc.
        const columnsConfig = args.columns ?? {};

        // No columns = nothing to do
        const columnKeys = Object.keys(columnsConfig);
        if (!columnKeys.length) {
            return;
        }

        const container = element.querySelector(':scope > .loop-container');
        if (!container) {
            return;
        }

        const cards = container.querySelectorAll('.loop-card');
        const total = cards.length;

        if (!total) {
            return;
        }

        const selector = '.' + uniqueId;

        // Build an array of breakpoint configs, sorted by min width
        const breakpointConfigs = columnKeys
            .map((key) => {
                // Allow a mapping layer if needed, otherwise use the key directly
                const bpKey = (args.breakpointMap && args.breakpointMap[key]) || key;
                const rawValue = themeBreakpoints[bpKey];

                // If this breakpoint doesn't exist in theme.json, skip it
                if (!rawValue) {
                    return null;
                }

                const cols = parseInt(columnsConfig[key], 10) || 1;

                // Extract numeric value for sorting (e.g. "768px" -> 768)
                const numeric = parseFloat(String(rawValue)) || 0;

                return {
                    key,          // original key
                    bpKey,        // theme.json key
                    value: rawValue,
                    numeric,
                    cols,
                };
            })
            .filter(Boolean)
            .sort((a, b) => a.numeric - b.numeric);

        if (!breakpointConfigs.length) {
            return;
        }

        // Helper to compute how many items are in the last row for a given col count
        const getLastRowCount = (cols) => {
            if (cols <= 0) return 0;
            const fullRows = Math.floor(total / cols);
            const remainder = total - fullRows * cols;
            return remainder || cols;
        };

        // Helper to create the media query wrapper
        const wrapWithMedia = (rules, min, max) => {
            if (min && max) {
                return [
                    '@media screen and (min-width: ' + min + ') and (max-width: calc(' + max + ' - 1px)) {',
                    rules,
                    '}',
                ].join('\n');
            }
            if (!min && max) {
                // Smallest range: only max
                return [
                    '@media screen and (max-width: calc(' + max + ' - 1px)) {',
                    rules,
                    '}',
                ].join('\n');
            }
            // Largest range: only min
            return [
                '@media screen and (min-width: ' + min + ') {',
                rules,
                '}',
            ].join('\n');
        };

        // Helper to generate the divider CSS rules for a given column count
        const buildRulesForCols = (cols, lastCount) => {
            const n = cols;
            const last = lastCount;

            return [
                // Remove vertical divider on first column
                selector + ' .loop-container > .loop-card:nth-of-type(' + n + 'n+1):after { content: none !important; }',

                // General vertical divider height for items not in first row
                selector + ' .loop-container > .loop-card:nth-of-type(n+' + (n + 1) + '):after {' +
                ' height: calc(100% + (var(--grid-row-gap, var(--grid-col-gap)) / 2));' +
                ' top: calc(0px - (var(--grid-row-gap, var(--grid-col-gap, 0px)) / 2));' +
                ' }',

                // Enable horizontal dividers when we have more than one row
                selector + ' .loop-container:has(> .loop-card:nth-of-type(' + (n + 1) + ')) > .loop-card:before { content:""; }',

                // First row: top alignment
                selector + ' .loop-container:has(> .loop-card:nth-of-type(' + (n + 1) + ')) > .loop-card:nth-of-type(-n+' + (n + 1) + '):after {' +
                ' height: calc(100% + (var(--grid-row-gap, var(--grid-col-gap)) / 2));' +
                ' top: 0;' +
                ' }',

                // Middle rows: full height dividers
                selector + ' .loop-container:has(> .loop-card:nth-of-type(' + (n + 1) + ')) > .loop-card:nth-of-type(n+' + (n + 2) + '):after {' +
                ' height: calc(100% + var(--grid-row-gap, var(--grid-col-gap, 0px)));' +
                ' top: calc(0px - (var(--grid-row-gap, var(--grid-col-gap, 0px)) / 2));' +
                ' }',

                // Horizontal divider width on last column of each row
                selector + ' .loop-container > .loop-card:nth-of-type(' + n + 'n):before {' +
                ' width: calc(100% + calc(var(--grid-col-gap) / 2));' +
                ' }',

                // Horizontal divider width on first column of each row
                selector + ' .loop-container > .loop-card:nth-of-type(' + n + 'n+1):before {' +
                ' width: ' + (n > 1 ? 'calc(100% + calc(var(--grid-col-gap) / 2))' : '100%') + ';' +
                ' left: 0;' +
                ' }',

                // Last row: clamp vertical dividers and remove horizontal bottom dividers
                selector + ' .loop-container:has(> .loop-card:nth-of-type(' + (n + 1) + ')) > .loop-card:nth-last-of-type(-n+' + last + '):after {' +
                ' height: calc(100% + calc(var(--grid-row-gap, var(--grid-col-gap)) / 2)) !important;' +
                ' top: calc(0px - (var(--grid-row-gap, var(--grid-col-gap, 0px)) / 2));' +
                ' }',

                selector + ' .loop-container > .loop-card:nth-last-of-type(-n+' + last + '):before {' +
                ' content: none !important;' +
                ' }',
            ].join('\n');
        };

        const styleChunks = [];

        breakpointConfigs.forEach((config, index) => {
            const {value, cols} = config;
            const lastCount = getLastRowCount(cols);

            if (cols <= 0 || lastCount <= 0) {
                return;
            }

            const isFirst = index === 0;
            const isLast = index === breakpointConfigs.length - 1;

            const min = isFirst ? null : breakpointConfigs[index].value;
            const max = isLast ? null : breakpointConfigs[index + 1]?.value;

            // small correction: for middle tiers, min is current, max is next
            const mediaMin = isFirst ? null : value;
            const mediaMax = isLast ? null : breakpointConfigs[index + 1]?.value;

            const rules = buildRulesForCols(cols, lastCount);
            styleChunks.push(wrapWithMedia(rules, mediaMin, mediaMax));
        });

        if (!styleChunks.length) {
            return;
        }

        const styleCss = styleChunks.join('\n\n');

        const styleTag = document.createElement('style');
        const styleSelector = [uniqueId, 'divider-styles'].join('-');

        // Remove any existing tag for this instance
        document.querySelectorAll('.' + styleSelector).forEach(tag => tag.remove());

        styleTag.classList.add(styleSelector);
        styleTag.textContent = styleCss;

        document.head.appendChild(styleTag);

        element.classList.add('--divider');
    }

    setMasonry(container) {

        if (!('Masonry' in window)) {
            return;
        }

        if (container.classList.contains('masonry')) {

            const masonryData = Masonry.data(container) || false;
            const gutterSizer = container.querySelector(':scope > .gutter-sizer');

            const total = container.querySelectorAll(':scope > .loop-card').length;
            const cols = parseInt(getComputedStyle(container).getPropertyValue('--columns'))

            if (masonryData) {
                masonryData.destroy();
            }

            if (cols < 2) {
                return false;
            }

            container.classList.add('masonry');

            const masonry = new Masonry(container, {
                itemSelector: '.loop-card',
                //columnWidth: '.loop-card',
                gutter: gutterSizer,
                percentPosition: true,
                horizontalOrder: true,
            });
            masonry.layout();

        }
    }

    set_cookie(cname, cvalue, exdays = false) {
        const d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        const expires = exdays === false ? null : "expires=" + d.toUTCString();
        const args = [
            JSON.stringify(cvalue),
            expires,
            'path=/'
        ].filter((arg) => arg).join(';');
        document.cookie = cname + "=" + args;
    }

    get_cookie(cname) {
        let name = cname + "=";
        let decodedCookie = decodeURIComponent(document.cookie);
        let ca = decodedCookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) === 0) {
                return JSON.parse(c.substring(name.length, c.length));
            }
        }
        return '';
    }

    slideToggle(element, duration, callback, display) {
        jQuery(element).slideToggle(duration, function () {
            if (typeof callback === 'function') {
                callback();
            }

        });
    }

    slideUp(element, duration, callback) {
        jQuery(element).slideUp(duration, callback);
    }

    slideDown(element, duration, callback) {
        jQuery(element).slideDown(duration, callback);
    }

    init() {

        document.addEventListener('DOMContentLoaded', () => {

            this.popup.init();



        });


    }
}

new WPBS_Theme();



