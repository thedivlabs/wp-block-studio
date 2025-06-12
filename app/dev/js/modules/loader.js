export default class Loader {

    static class_name = 'wpbs-loader';
    static anim_div_count = 1;

    static init() {

        this.loader = document.createElement('div');
        this.loader.classList.add(this.class_name);

        const anim_container = document.createElement('div');
        anim_container.classList.add('wpbs-loader__anim');
        this.loader.append(anim_container);

        if (this.anim_div_count > 1) {
            for (let step = 0; step < this.anim_div_count; step++) {
                anim_container.append(document.createElement('div'));
            }
        }

    }

    static toggle(args = {}) {

        const loader = typeof args.target === 'object' ? args.target.querySelectorAll('.wpbs-loader') : document.querySelectorAll('.wpbs-loader');

        if (loader.length) {

            loader.forEach((el) => {
                this.remove(el);
            })

        } else {
            if (args.remove !== true) {
                this.show(args);
            }
        }

    }


    static show(args = false) {

        const {target = false, reverse = false} = args;

        if (document.querySelectorAll('.wpbs-loader').length > 0) {
            return false;
        }

        const loader = this.loader.cloneNode(true);

        loader.querySelector(':scope > div').addEventListener('click', () => {
            this.remove(loader);
        });

        if (reverse) {
            loader.classList.add('reverse');
        }

        if (target && typeof target === 'object') {
            loader.classList.add('target');
            target.append(loader);
        } else {
            document.body.append(loader);
        }
    }

    static remove(el = false) {
        const elements = (typeof el === 'object' && el instanceof Element)
            ? [el]
            : document.querySelectorAll('.' + this.class_name);

        elements.forEach((element) => {
            // Add a class to trigger fade-out via CSS
            element.classList.add('fade-out');

            // Listen for the end of the transition
            element.addEventListener('transitionend', () => {
                element.remove();
            }, {once: true});
        });
    }

}