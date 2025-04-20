(() => {
    this.cookie_base = 'divlabs-popup-';

    this.init = () => {

        const settings = 'popups' in DIVLABS.settings ? DIVLABS.settings.popups : false;

        if (!settings) {
            return false;
        }

        const click_popups = settings.filter((popup) => {
            return popup.trigger === 'click' && !this.has_cookie(popup.id);
        });

        const enter_popups = settings.filter((popup) => {
            return popup.trigger === 'enter' && !this.has_cookie(popup.id);
        });

        this.click_popups(click_popups);
        this.enter_popups(enter_popups);

    }

    this.set_cookie = (popup) => {
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

        DIVLABS.helpers.set_cookie(this.cookie_base + popup.id, 1, days);
    }

    this.click_popups = (click_popups = []) => {
        [...click_popups].forEach((popup) => {
            if (!('click_selector' in popup)) {
                return;
            }
            const click_trigger = document.querySelectorAll(popup.click_selector);
            [...click_trigger].forEach((el) => {
                el.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.set_cookie(popup);
                    DIVLABS.modal('#divlabs-popup-' + popup.id, {
                        delay: 'delay' in click_popups[0] ? click_popups[0].delay || false : false
                    });
                })
            })
        })
    }

    this.enter_popups = (enter_popups = []) => {
        if (enter_popups.length < 1) {
            return false;
        }
        this.set_cookie(enter_popups[0]);

        DIVLABS.modal('#divlabs-popup-' + enter_popups[0].id, {
            delay: 'delay' in enter_popups[0] ? enter_popups[0].delay || false : false
        });
    }

    this.has_cookie = (id) => {
        return id !== 'undefined' ? DIVLABS.helpers.get_cookie(this.cookie_base + id) : false;
    }


    document.addEventListener(('DIVLABS' in window ? 'DOMContentLoaded' : 'divlabs-init'), () => {
        this.init();
    });

})();