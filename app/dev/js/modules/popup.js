export default class Popup {

    static cookie_base = 'wpbs-popup-';

    static init() {


        const settings = 'popups' in WPBS.settings ? WPBS.settings.popups : false;

        if (!settings) {
            return false;
        }

        const cta_popups = settings.filter((popup) => {
            return popup.trigger === 'cta';
        });

        const click_popups = settings.filter((popup) => {
            return popup.trigger === 'click';
        });

        const enter_popups = settings.filter((popup) => {
            return popup.trigger === 'enter' && !this.has_cookie(popup.id);
        });

        this.cta_popups(cta_popups);
        this.click_popups(click_popups);
        this.enter_popups(enter_popups);

    }

    static set_cookie = (popup) => {
        if (popup.frequency === '') {
            return false;
        }
        let days;
        switch (popup.frequency) {
            case 'daily':
                days = 1;
                break;
            case 'weekly':
                days = 7;
                break;
            default:
                days = false;
        }

        WPBS.set_cookie(this.cookie_base + popup.id, 1, days);
    }

    static click_popups = (click_popups = []) => {
        [...click_popups].forEach((popup) => {
            if (!('click_selector' in popup)) {
                return;
            }
            const click_trigger = document.querySelectorAll(popup.click_selector);
            [...click_trigger].forEach((el) => {
                el.addEventListener('click', (e) => {
                    e.preventDefault();
                    WPBS.modals.toggle_modal('#wpbs-popup-' + popup.id, {
                        delay: 'delay' in click_popups[0] ? click_popups[0].delay || false : false
                    });
                })
            })
        })
    }

    static cta_popups = (cta_popups = []) => {
        [...cta_popups].forEach((popup) => {

            document.body.addEventListener('click', (e) => {

                const el = e.target.closest('[data-popup]');

                if (!el || !'popup' in el.dataset) {
                    return false;
                }

                e.preventDefault();

                const popupId = el.dataset.popup;

                WPBS.modals.toggle_modal('#wpbs-popup-' + popupId, {
                    delay: 'delay' in popup ? popup.delay || false : false
                });

                WPBS.observeMedia(document.querySelector('#wpbs-popup-' + popupId));

            });


        })
    }

    static enter_popups = (enter_popups = []) => {
        if (enter_popups.length < 1) {
            return false;
        }
        this.set_cookie(enter_popups[0]);

        WPBS.modals.toggle_modal('#wpbs-popup-' + enter_popups[0].id, {
            delay: 'delay' in enter_popups[0] ? enter_popups[0].delay || false : false
        });
    }

    static has_cookie = (id) => {
        return id !== 'undefined' ? WPBS.get_cookie(this.cookie_base + id) : false;
    }


}