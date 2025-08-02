import {WPBS_Google_Places} from "Modules/google-places";

console.log('Admin scripts');

WPBS_Google_Places.init();

jQuery(() => {

    const code_fields = document.querySelectorAll('.divlabs-script-field textarea');

    if (!code_fields.length) {
        return;
    }

    const settings = wp.codeEditor.defaultSettings
        ? _.clone(wp.codeEditor.defaultSettings)
        : {};

    settings.codemirror = Object.assign({}, settings.codemirror, {
        mode: 'text/javascript',
        lineNumbers: true,
        indentUnit: 2,
        tabSize: 2,
    });

    jQuery('body').on('focus', '.divlabs-script-field textarea', function () {
        if (jQuery(this).siblings('.CodeMirror').length) {
            return;
        }
        wp.codeEditor.initialize(jQuery(this).get(0), settings);
    });

})