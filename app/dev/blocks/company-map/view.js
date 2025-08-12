import {getContext, getElement, store} from '@wordpress/interactivity';


const {state} = store('wpbs/company-map', {
    actions: {
        init: () => {

            const {ref: element} = getElement();

            const {companies = [], marker = false, zoom = false} = getContext();

            const map_key = WPBS?.settings?.places?.maps_key;

            if (!map_key) {
                return false;
            }


            if (!document.querySelector('#wpbs-google-maps')) {

                window.maps_callback = () => {
                    return true;
                };


                const script = document.createElement('script');
                script.src = `https://maps.googleapis.com/maps/api/js?key=${map_key}&libraries=places,marker&callback=maps_callback&loading=async`;
                script.id = 'wpbs-google-maps';
                script.async = true;
                script.defer = true;
                document.head.appendChild(script);
            }


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

            map_observer.observe(element);

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

                    const marker_args = {
                        map: map,
                        position: company_position,
                    };

                    if ('marker' in company && company.marker.length) {
                        marker_args.content = jQuery('<img />', {
                            src: company.marker,
                            height: 80
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

                if (zoom && companies.length > 1) {
                    map.setCenter(latlngbounds.getCenter());
                    map.fitBounds(latlngbounds, {top: 50, right: 50, left: 50, bottom: 50});
                }
            }

        }
    },
});