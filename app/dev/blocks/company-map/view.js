import {getContext, getElement, store} from '@wordpress/interactivity';


const {state} = store('wpbs/company-map', {
    actions: {
        init: () => {

            const {ref: element} = getElement();

            const {companies = [], marker = false, zoom = false} = getContext();

            const map_key = WPBS?.settings?.places?.maps_key;

            document.addEventListener('wpbs_maps_loaded', () => {
                map_observer.observe(element);
            })

            const map_observer = new IntersectionObserver((entry) => {

                const map = entry[0];

                if (map.isIntersecting) {

                    if (typeof google === 'object' && typeof google.maps === 'object') {
                        init_maps();
                    }

                    map_observer.unobserve(element);
                }
            }, {
                threshold: 1.0,
            });


            function init_maps() {

                const position = {
                    lat: parseFloat(companies[0].lat),
                    lng: parseFloat(companies[0].lng)
                };

                const map = new google.maps.Map(element, {
                    center: position,
                    zoom: 15,
                    disableDefaultUI: true,
                    zoomControl: true,
                    //scrollwheel: true,
                    tilt: 0.0,
                    mapId: map_key
                });

                const latlngbounds = new google.maps.LatLngBounds();

                companies.forEach((company, index) => {

                    const company_position = {
                        lat: parseFloat(company.lat),
                        lng: parseFloat(company.lng)
                    };

                    if ('marker' in company && company.marker.length) {

                        const marker_args = {
                            map: map,
                            position: company_position,
                        };

                        marker_args.content = jQuery('<img />', {
                            src: company.marker,
                            height: 80
                        }).get(0);

                        const marker = new google.maps.marker.AdvancedMarkerElement(marker_args);

                        if (!!company?.map_url) {
                            marker.addListener("gmp-click", () => {
                                window.open(company.map_url);
                            }, {
                                passive: true
                            });
                        }

                    }


                    latlngbounds.extend(new google.maps.LatLng(company.latitude, company.longitude));
                });

                if (!!zoom) {

                    const mapMargin = companies.length > 1 ? 50 : 100;

                    map.setCenter(latlngbounds.getCenter());
                    map.fitBounds(latlngbounds, {top: mapMargin, right: mapMargin, left: mapMargin, bottom: mapMargin});
                }
            }

        }
    },
});