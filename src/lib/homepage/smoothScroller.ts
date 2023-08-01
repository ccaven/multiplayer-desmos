
export function startSmoothScroll(increments: number) {

    let scrollVelocity = 0;
    let targetScrollVelocity = 0;

    window.onscroll = event => {
        
    };

    let previousY = 0;
    let then = performance.now();
    function loop() {
        requestAnimationFrame(loop);

        let now = performance.now();
        let dt = (now - then) * 0.001;
        then = now;

        // Check current scroll position
        let pos = window.scrollY;
        let delta = pos - previousY;
        previousY = pos;

        let relative = pos % increments;

        if (Math.abs(delta) < 5) return;

        if (delta > 0) {
            // help by scrolling down
            window.scrollBy(0, (increments - 5 - relative) * dt * 2);
        } else {
            // help by scrolling up
            window.scrollBy(0, -(relative + 5) * dt * 2);
        }

    }

    requestAnimationFrame(loop);

}
