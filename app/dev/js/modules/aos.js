export default class DIVLABS_AOS {


    static init() {

        if (document.querySelectorAll('[data-aos]').length < 1) {
            return false;
        }

        $('head').append('<link />', {
            href: 'https://cdn.jsdelivr.net/npm/aos/dist/aos.min.css',
            rel: "stylesheet",
            type: "text/css",
        })

        $.getScript('https://cdn.jsdelivr.net/npm/aos/dist/aos.min.js', () => {
            AOS.init({
                offset: -100,
                duration: 1200,
                once: true,
            });
        });

    }
}
