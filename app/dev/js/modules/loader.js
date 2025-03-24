export default class Loader {

    static class_name = 'wpbs-loader';
    static anim_div_count = 4;

    static init() {

        this.loader = document.createElement('div');
        this.loader.classList.add(this.class_name);

        const anim_container = document.createElement('div');
        anim_container.classList.add('wpbs-loader__anim');
        this.loader.append(anim_container);

        for (let step = 0; step < this.anim_div_count; step++) {
            anim_container.append(document.createElement('div'));
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
                this.show(args.target);
            }
        }

    }


    static show(target = false) {

        if (document.querySelectorAll('.wpbs-loader').length > 0) {
            return false;
        }

        const loader = this.loader.cloneNode(true);

        if (target && typeof target === 'object') {
            target.append(loader);
        } else {
            document.body.append(loader);
        }
    }

    static remove(el = false) {
        el = typeof el === 'object' ? $(el) : $('.' + this.class_name)
        el.fadeOut('fast', function () {
            $(this).remove();
        })
    }

}