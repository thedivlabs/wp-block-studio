export default function ResponsiveMedia({ref = false}) {

    function parseMedia(media) {
        if (media.dataset.media && !window.matchMedia(media.dataset.media).matches) {
            return;
        }

        if (media.dataset.src) {
            media.setAttribute('src', media.dataset.src);
        }
        if (media.dataset.srcset) {
            media.setAttribute('srcset', media.dataset.srcset);
        }
    }

    let timer;

    const observerSize = new ResizeObserver((entries) => {

        clearTimeout(timer);
        timer = setTimeout(() => {
            entries.forEach((entry) => {
                parseMedia(entry.target);
            });
        }, 500);


    });

    const observer = new IntersectionObserver(
        (entries) => {
            for (let entry of entries) {
                if (entry.isIntersecting) {

                    parseMedia(entry.target);

                    if (entry.target.tagName === 'VIDEO' && !ref) {
                        observerSize.observe(entry.target);
                    }

                    observer.unobserve(entry.target);

                }
            }
        },
        {

            threshold: 0.2
        });

    const selector = '[data-src],[data-srcset]';

    if (ref) {
        [...ref.querySelectorAll(selector)].forEach(media => {


            observer.observe(media)
        })
    } else {


        [...document.querySelectorAll(selector)].forEach(media => {


            observer.observe(media)
        })

    }

}