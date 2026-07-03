"use client";

import { useEffect } from "react";

export default function DevIndicatorRemover() {
    useEffect(() => {
        if (process.env.NODE_ENV !== "development") return;

        const observer = new MutationObserver(() => {
            document.querySelectorAll("nextjs-portal").forEach((el) => el.remove());
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });

        return () => observer.disconnect();
    }, []);

    return null;
}