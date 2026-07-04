"use client";

import { useEffect } from "react";
import ScrollTrigger from "gsap/ScrollTrigger";

export function HashScrollHandler() {
    useEffect(() => {
        if (typeof window === "undefined" || !window.location.hash) return;

        const handleInitialHashScroll = () => {
            const hash = window.location.hash.replace("#", "");
            const element = document.getElementById(hash);

            if (element) {
                setTimeout(() => {
                    let targetY = 0;
                    const isHorizontalPanel = ["analytics", "insights", "reports"].includes(hash);

                    if (isHorizontalPanel) {
                        let trigger = null;
                        try {
                            trigger = ScrollTrigger.getById("horizontal");
                        } catch (err) {
                            console.warn("GSAP não inicializado no tempo esperado:", err);
                        }

                        if (trigger) {
                            let progress = 0;
                            if (hash === "insights") progress = 0.5;
                            if (hash === "reports") progress = 1.0; // Ajustado de 0.93 para 0.98

                            targetY = trigger.start + (trigger.end - trigger.start) * progress;
                        } else {
                            const parent = document.getElementById("horizontal-feature");
                            if (parent) {
                                const parentTop = parent.offsetTop;
                                let progress = 0;
                                if (hash === "insights") progress = 0.5;
                                if (hash === "reports") progress = 1.0; // Ajustado de 0.93 para 0.98

                                const pinDuration = 3 * window.innerWidth;
                                targetY = parentTop + pinDuration * progress;
                            } else {
                                targetY = element.getBoundingClientRect().top + window.pageYOffset;
                            }
                        }
                    } else {
                        targetY = element.getBoundingClientRect().top + window.pageYOffset;
                    }

                    window.scrollTo({
                        top: targetY,
                        behavior: "smooth",
                    });
                }, 600);
            }
        };

        if (document.readyState === "complete") {
            handleInitialHashScroll();
        } else {
            window.addEventListener("load", handleInitialHashScroll);
            return () => window.removeEventListener("load", handleInitialHashScroll);
        }
    }, []);

    return null;
}