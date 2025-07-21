export default class Modals {

    static init() {

        this.modal = document.createElement('div');
        this.modal.className = 'wpbs-modal fixed top-0 left-0 flex h-full w-full justify-center items-start overflow-hidden opacity-0 transition-opacity duration-300 pointer-events-none z-modal';

        const container = document.createElement('div');
        container.className = 'wpbs-modal__container px-4 pt-8 pb-12 items-center justify-start max-w-full';

        const button = document.createElement('button');
        button.className = 'wpbs-modal__close wpbs-modal-toggle fixed top-3 right-3 z-50 flex aspect-square h-8 cursor-pointer items-center justify-center text-center text-2xl leading-none text-white transform-opacity duration-300 ease-in-out bg-black/50 rounded-sm hover:bg-primary-hover';
        button.innerHTML = '<i class="fa-light fa-xmark"></i>';

        this.modal.append(button);
        this.modal.append(container);

        this.toggle_class = 'wpbs-modal-toggle';
        this.toggle_selector = '.' + this.toggle_class;


        document.addEventListener('click', (e) => {

            const button = e.target.closest(this.toggle_selector);

            if (
                button !== null &&
                button.classList.contains(this.toggle_class)
            ) {
                e.preventDefault();
                const selector = button.dataset.popup ? '#wpbs-popup-' + button.dataset.popup : false;
                this.toggle_modal(selector)
            }

            if (
                e.target.classList.contains('wpbs-modal') ||
                e.target.classList.contains('wpbs-modal__container') ||
                e.target.classList.contains('wpbs-modal-close')
            ) {
                e.preventDefault();
                this.close_modal(false, {
                    remove: true
                });
            }

        });


    }

    static close_modal(selector, args = {}) {
        document.body.classList.remove('wpbs-body-lock');
        document.removeEventListener('keydown', this.keypress_handler);

        WPBS.loader.toggle({
            remove: true
        });

        const modals = document.querySelectorAll('.wpbs-modal');

        if (!modals.length && (selector || args)) {
            this.show_modal(selector, args);
            return;
        }

        [...modals].forEach((modal) => {

            if (modal.classList.contains('closing')) {
                return false;
            }

            modal.addEventListener('transitionend', (e) => {
                const placeholder = document.querySelector('#wpbs-modal-placeholder');
                if (placeholder !== null) {
                    const template = modal.querySelector(':scope > div');
                    placeholder.before(template);
                    placeholder.remove();
                }

                modal.remove();

                if (
                    selector ||
                    'template' in args
                ) {
                    this.toggle_modal(selector, args);
                }

            }, {
                once: true,
                passive: true,
            });

            modal.classList.remove('active');
            modal.classList.add('closing');

        })


    }

    static keypress_handler(e) {
        if (e.keyCode === 27) {
            this.modal(false, {
                remove: true
            });
        }
    }

    static show_modal(selector, args = {}) {

        WPBS.loader.toggle({
            remove: true
        });

        document.addEventListener('keydown', this.keypress_handler);

        let target = false;

        if (typeof selector === 'string') {
            target = document.querySelector(selector);
            if (target === null) {
                return false;
            }
            const placeholder = document.createElement('div');
            placeholder.classList.add('hidden');
            placeholder.id = 'wpbs-modal-placeholder';
            target.after(placeholder);
        }

        if (!selector && 'template' in args) {
            target = args.template;
        }

        const modal = this.modal.cloneNode(true);

        if ('full' in args && args.full) {
            modal.classList.add('wpbs-modal--full')
        }

        if ('dark' in args) {
            modal.classList.add('wpbs-modal--dark');
        }

        modal.querySelector('.wpbs-modal__container').append(target);

        const delay = 'delay' in args ? args.delay * 1000 : 0;

        document.body.append(modal);

        if ('callback' in args && typeof args.callback === 'function') {
            args.callback(modal);
        }

        setTimeout(() => {

            document.body.classList.add('wpbs-body-lock');

            setTimeout(() => {
                modal.classList.add('active');
            }, 50);

            WPBS.observeMedia(modal);


        }, delay);

    }

    static toggle_modal(selector, args = {}) {
        this.close_modal(selector, args);
    }


}