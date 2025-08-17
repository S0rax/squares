export function waitForElement(selector: string, timeoutMs = 5000, intervalMs = 100): Promise<Element> {
    return new Promise((resolve, reject) => {
        const root = document;
        const found = root.querySelector(selector);
        if (found) {
            resolve(found);
            return;
        }

        let timedOut = false;
        const timeout = setTimeout(() => {
            timedOut = true;
            cleanup();
            reject(new Error(`Timed out after ${timeoutMs}ms waiting for element: ${selector}`));
        }, timeoutMs);

        let observer: MutationObserver | null = null;
        let intervalId: number | null = null;

        function cleanup() {
            clearTimeout(timeout);
            if (observer) {
                observer.disconnect();
                observer = null;
            }
            if (intervalId !== null) {
                window.clearInterval(intervalId);
                intervalId = null;
            }
        }

        function foundHandler(el: Element) {
            if (timedOut) return;
            cleanup();
            resolve(el);
        }

        if (typeof MutationObserver !== 'undefined') {
            observer = new MutationObserver(() => {
                const el = root.querySelector(selector);
                if (el) foundHandler(el);
            });
            try {
                observer.observe(root as Node, { childList: true, subtree: true });
            } catch (e) {
                observer.disconnect();
                observer = null;
            }
        }

        if (!observer) {
            intervalId = window.setInterval(() => {
                const el = root.querySelector(selector);
                if (el) foundHandler(el);
            }, intervalMs);
        }
    });
}
