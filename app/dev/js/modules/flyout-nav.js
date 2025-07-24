export default class Flyout {


    static init() {

        this.nav = document.querySelector('.wpbs-flyout');

        console.log(this.nav);

        if (this.nav == null) {
            return false;
        }

        document.querySelectorAll('.wpbs-flyout-toggle').forEach((el) => {
            el.addEventListener('click', (e) => {
                this.toggle();
            }, {
                passive: true
            });
        })

        document.querySelector('.wpbs-flyout').addEventListener('click', (e) => {
            if (
                e.target !== e.currentTarget ||
                !this.nav.classList.contains('active')
            ) {
                return;
            }
            this.toggle();
        }, {
            passive: true
        })

    }

    static toggle() {

        if (this.nav.classList.contains('active')) {
            this.hide();
        } else {
            this.show();
        }

    }

    static hide() {

        this.nav.classList.remove('active');
        document.body.classList.remove('wpbs-body-lock');
    }

    static show() {

        this.nav.classList.add('active');
        document.body.classList.add('wpbs-body-lock');
    }


}