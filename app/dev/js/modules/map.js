export default class DIVLABS_Map {

    static init() {

        this.map_elements = document.querySelectorAll('.divlabs-map, .divlabs-google-map');

        const settings = 'google_places' in DIVLABS.settings ? DIVLABS.settings.google_places : {};

        this.map_key = settings.key;
        this.style_id = settings.style_id;

        if (!this.map_elements.length || !this.map_key) {
            return false;
        }

        this.map_observer = new IntersectionObserver(this.observer_callback, {
            threshold: 1.0,
        });

        [...this.map_elements].forEach((map_el) => {
            this.map_observer.observe(map_el);
        })
    }

    static observer_callback(entries) {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                let entry_target = entry.target;


                if (entry.intersectionRatio >= 0.75) {
                    if (typeof google === 'object' && typeof google.maps === 'object') {
                        DIVLABS_Map.init_maps();
                    } else {
                        window.maps_callback = () => {
                            DIVLABS_Map.init_maps();
                        };

                        //AIzaSyAAmgjTHpzYiW_KyTVH2nwhZvTYgpoe4hw

                        $.getScript({
                            url: 'https://maps.googleapis.com/maps/api/js?key=' + DIVLABS_Map.map_key + '&libraries=places,marker&callback=maps_callback&loading=async',
                            cache: true
                        });
                    }

                    entries.forEach((entry) => {
                        DIVLABS_Map.map_observer.unobserve(entry.target);
                    })
                }
            }
        });
    }

    static init_maps() {

        [...this.map_elements].forEach((map_el) => {

            const {companies, options} = JSON.parse(map_el.dataset.map || '');

            if (!companies) {
                return false;
            }

            const primary_index = Math.max(0, companies.findIndex((company) => {
                return 'is_primary' in company && company.is_primary
            }));

            const position = {
                lat: parseFloat(companies[primary_index].latitude),
                lng: parseFloat(companies[primary_index].longitude)
            };

            const map = new google.maps.Map(map_el, {
                center: position,
                zoom: 15,
                disableDefaultUI: true,
                zoomControl: true,
                //scrollwheel: true,
                tilt: 0.0,
                mapId: this.style_id || this.map_key
            });

            const latlngbounds = new google.maps.LatLngBounds();

            companies.forEach((company) => {

                const company_position = {
                    lat: parseFloat(company.latitude),
                    lng: parseFloat(company.longitude)
                };

                const marker_args = {
                    map: map
                };

                const icon_size = 'is_primary' in company && company.is_primary ? 80 : 70;

                marker_args.position = company_position;

                if ('marker_url' in company && company.marker_url !== '') {
                    marker_args.content = $('<img />', {
                        src: company.marker_url,
                        height: 100
                    }).get(0);
                }

                const marker = new google.maps.marker.AdvancedMarkerElement(marker_args);


                if ('map_url' in company) {
                    marker.addListener("gmp-click", () => {
                        window.open(company.map_url);
                    }, {
                        passive: true
                    });
                }

                latlngbounds.extend(new google.maps.LatLng(company.latitude, company.longitude));
            });

            if ('zoom_to_fit' in options && companies.length > 1) {
                map.setCenter(latlngbounds.getCenter());
                map.fitBounds(latlngbounds, {top: 50, right: 50, left: 50, bottom: 50});
            }


        });
    }


}
