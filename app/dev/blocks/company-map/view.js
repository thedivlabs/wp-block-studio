import {getContext, getElement, store} from '@wordpress/interactivity';



const {state} = store('wpbs/company-map', {
    actions: {
        init: () => {

            const {ref: element} = getElement();

            console.log(element);

            const settings = getContext();

            const map_key = WPBS?.settings?.map?.key;

            if (map_key) {
                return false;
            }

            const map_observer = new IntersectionObserver((entry)=>{
                if (entry.isIntersecting) {
                    let entry_target = entry.target;


                    if (entry.intersectionRatio >= 0.75) {
                        if (typeof google === 'object' && typeof google.maps === 'object') {
                            init_maps(element);
                        } else {
                            window.maps_callback = () => {
                                init_maps(element);
                            };

                            //AIzaSyAAmgjTHpzYiW_KyTVH2nwhZvTYgpoe4hw

                            $.getScript({
                                url: 'https://maps.googleapis.com/maps/api/js?key=' + map_key + '&libraries=places,marker&callback=maps_callback&loading=async',
                                cache: true
                            });
                        }

                        map_observer.unobserve(entry.target);
                    }
                }
            }, {
                threshold: 1.0,
            });

            map_observer.observe(element);

            function init_maps() {

                const position = {
                    lat: parseFloat(companies[0].latitude),
                    lng: parseFloat(companies[0].longitude)
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
            }

        }
    },
});