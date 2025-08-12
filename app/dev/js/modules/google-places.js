export class WPBS_Google_Places {


    static init() {
        this.endpoint = new URL(window.location.origin + '/wp-json/wpbs/v1/place-details');
        this.init_location_details();

    }

    static init_location_details() {

        const buttons = document.querySelectorAll('.wpbs-location-button--map .acf-button-group > label');

        if (!buttons.length) {
            return false;
        }

        [...buttons].forEach((btn) => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();

                const place_id_field = document.querySelector('.wpbs-location--pid input[type=text]');
                const place_id = place_id_field !== null ? place_id_field.value : false;

                if (!place_id) {
                    return false;
                }

                this.fetch_details(place_id).then((response) => {
                    console.log(response);

                    this.populate_fields(response);
                });
            });
        })

    }

    static async fetch_details(place_id) {

        if (typeof place_id === 'undefined') {
            return false;
        }

        const post_id = document.getElementById('post_ID')?.value;

        this.endpoint.searchParams.set('post_id', post_id);
        this.endpoint.searchParams.set('place_id', place_id);
        this.endpoint.searchParams.set('token', WPBS.settings?.places?.token);

        const response = await fetch(this.endpoint.href, {
            method: 'GET',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return await response.json();
    }

    static populate_fields(data) {

        if (!data) {
            return false;
        }

        const fields = {
            lng: jQuery('.wpbs-location--longitude input[type=text]'),
            lat: jQuery('.wpbs-location--latitude input[type=text]'),
            map: jQuery('.wpbs-location--map-url input[type=text]'),
            dir: jQuery('.wpbs-location--dir-url input[type=text]'),
            new_review: jQuery('.wpbs-location--new-review-url input[type=text]'),
            reviews: jQuery('.wpbs-location--reviews-url input[type=text]'),
            address_1: jQuery('.wpbs-location--address input[type=text]'),
            address_2: jQuery('.wpbs-location--address2 input[type=text]'),
            city: jQuery('.wpbs-location--city input[type=text]'),
            state: jQuery('.wpbs-location--state input[type=text]'),
            zip: jQuery('.wpbs-location--zip input[type=text]'),
            phone: jQuery('.wpbs-location--phone input[type=text]'),
        }

        const hours = {
            monday_open: jQuery('.wpbs-location--monday_open .hasDatepicker'),
            monday_close: jQuery('.wpbs-location--monday_close .hasDatepicker'),
            tuesday_open: jQuery('.wpbs-location--tuesday_open .hasDatepicker'),
            tuesday_close: jQuery('.wpbs-location--tuesday_close .hasDatepicker'),
            wednesday_open: jQuery('.wpbs-location--wednesday_open .hasDatepicker'),
            wednesday_close: jQuery('.wpbs-location--wednesday_close .hasDatepicker'),
            thursday_open: jQuery('.wpbs-location--thursday_open .hasDatepicker'),
            thursday_close: jQuery('.wpbs-location--thursday_close .hasDatepicker'),
            friday_open: jQuery('.wpbs-location--friday_open .hasDatepicker'),
            friday_close: jQuery('.wpbs-location--friday_close .hasDatepicker'),
            saturday_open: jQuery('.wpbs-location--saturday_open .hasDatepicker'),
            saturday_close: jQuery('.wpbs-location--saturday_close .hasDatepicker'),
            sunday_open: jQuery('.wpbs-location--sunday_open .hasDatepicker'),
            sunday_close: jQuery('.wpbs-location--sunday_close .hasDatepicker'),
        }

        if (
            !fields.lng.val() &&
            data.hasOwnProperty('lng')
        ) {
            fields.lng.val(data.lng);
        }

        if (
            !fields.lat.val() &&
            data.hasOwnProperty('lat')
        ) {
            fields.lat.val(data.lat);
        }

        if (
            !fields.dir.val() &&
            data.hasOwnProperty('url_directions')
        ) {
            fields.dir.val(data.url_directions);
        }

        if (
            !fields.map.val() &&
            data.hasOwnProperty('url_map')
        ) {
            fields.map.val(data.url_map);
        }

        if (
            !fields.address_1.val() &&
            data.hasOwnProperty('location') &&
            data.location.hasOwnProperty('address_1')
        ) {
            fields.address_1.val(data.location.address_1);
        }

        if (
            !fields.address_2.val() &&
            data.hasOwnProperty('location') &&
            data.location.hasOwnProperty('address_2')
        ) {
            fields.address_2.val(data.location.address_2);
        }

        if (
            !fields.city.val() &&
            data.hasOwnProperty('location') &&
            data.location.hasOwnProperty('city')
        ) {
            fields.city.val(data.location.city);
        }

        if (
            !fields.state.val() &&
            data.hasOwnProperty('location') &&
            data.location.hasOwnProperty('state')
        ) {
            fields.state.val(data.location.state);
        }

        if (
            !fields.zip.val() &&
            data.hasOwnProperty('location') &&
            data.location.hasOwnProperty('zip')
        ) {
            fields.zip.val(data.location.zip);
        }

        if (
            !fields.phone.val() &&
            data.hasOwnProperty('phone')
        ) {
            fields.phone.val(data.phone);
        }

        if (data.hasOwnProperty('hours')) {
            if (!hours.monday_open.val() && data.hours.hasOwnProperty('monday')) {
                hours.monday_open.datetimepicker('setTime', data?.hours?.monday.open);
            }

            if (!hours.monday_close.val() && data.hours.hasOwnProperty('monday')) {
                hours.monday_close.datetimepicker('setTime', data?.hours?.monday.close);
            }

            if (!hours.tuesday_open.val() && data.hours.hasOwnProperty('tuesday')) {
                hours.tuesday_open.datetimepicker('setTime', data?.hours?.tuesday.open);
            }

            if (!hours.tuesday_close.val() && data.hours.hasOwnProperty('tuesday')) {
                hours.tuesday_close.datetimepicker('setTime', data?.hours?.tuesday.close);
            }

            if (!hours.wednesday_open.val() && data.hours.hasOwnProperty('wednesday')) {
                hours.wednesday_open.datetimepicker('setTime', data?.hours?.wednesday.open);
            }

            if (!hours.wednesday_close.val() && data.hours.hasOwnProperty('wednesday')) {
                hours.wednesday_close.datetimepicker('setTime', data?.hours?.wednesday.close);
            }

            if (!hours.thursday_open.val() && data.hours.hasOwnProperty('thursday')) {
                hours.thursday_open.datetimepicker('setTime', data?.hours?.thursday.open);
            }

            if (!hours.thursday_close.val() && data.hours.hasOwnProperty('thursday')) {
                hours.thursday_close.datetimepicker('setTime', data?.hours?.thursday.close);
            }

            if (!hours.friday_open.val() && data.hours.hasOwnProperty('friday')) {
                hours.friday_open.datetimepicker('setTime', data?.hours?.friday.open);
            }

            if (!hours.friday_close.val() && data.hours.hasOwnProperty('friday')) {
                hours.friday_close.datetimepicker('setTime', data?.hours?.friday.close);
            }

            if (!hours.saturday_open.val() && data.hours.hasOwnProperty('saturday')) {
                hours.saturday_open.datetimepicker('setTime', data?.hours?.saturday.open);
            }

            if (!hours.saturday_close.val() && data.hours.hasOwnProperty('saturday')) {
                hours.saturday_close.datetimepicker('setTime', data?.hours?.saturday.close);
            }

            if (!hours.sunday_open.val() && data.hours.hasOwnProperty('sunday')) {
                hours.sunday_open.datetimepicker('setTime', data?.hours?.sunday.open);
            }

            if (!hours.sunday_close.val() && data.hours.hasOwnProperty('sunday')) {
                hours.sunday_close.datetimepicker('setTime', data?.hours?.sunday.close);
            }
        }

    }


}

export class WPBS_Google {

    static init() {

        const settings = 'google_places' in WPBS.settings ? WPBS.settings.google_places : {};

        this.google_id = settings.key;

        this.elements = {
            autocomplete: document.querySelectorAll('input[type=text].wpbs-autocomplete, .wpbs-autocomplete input[type=text]'),
            map: document.querySelectorAll('.wpbs-map')
        }

        if (!this.elements.autocomplete && !this.elements.map) {
            return false;
        }

        this.observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.load_lib();
                    observer.disconnect();
                }
            });
        }, {
            threshold: 0.5
        });

        [...this.elements.autocomplete].forEach((el) => {
            this.observer.observe(el);
        });

        [...this.elements.map].forEach((el) => {
            this.observer.observe(el);
        });

        jQuery('body').on('focus', 'input[type=text].wpbs-autocomplete, .wpbs-autocomplete input[type=text]', (e) => {
            this.init_autocomplete(e.target);
        });

        window.wpbs_google = this.init_components;
    }

    static load_lib() {

        if (typeof google === 'object' && typeof google.maps === 'object') {
            this.init_components();
        } else {
            jQuery.getScript({
                //url: 'https://maps.googleapis.com/maps/api/js?key=' + this.google_id + '&libraries=places,marker&callback=wpbs_google&loading=async',
                url: 'https://maps.googleapis.com/maps/api/js?key=' + this.google_id + '&libraries=places,marker&callback=wpbs_google&loading=async',
                cache: true
            });
        }
    }

    static init_components() {

        [...WPBS_Google.elements.autocomplete].forEach((el) => {
            //WPBS_Google.init_autocomplete(el);
        });

        [...WPBS_Google.elements.map].forEach((el) => {
            WPBS_Google.init_map(el);
        });

    }

    static init_autocomplete(input) {

        const options = {
            fields: ["address_components"],
        };

        const autocomplete = new google.maps.places.Autocomplete(input, options);
        autocomplete.setComponentRestrictions({
            country: ["us"],
        });

        autocomplete.addListener('place_changed', () => {
            input.dataset.place = autocomplete.getPlace();
        });

    }

    static init_map(input) {
        //console.log('map loaded');
    }

}