import { useState, useEffect } from "react";

/**
 * Returns true when the viewport width is at or below the given breakpoint.
 * Updates live on resize (debounced) so layouts react without a reload.
 *
 * Usage:
 *   const isMobile = useIsMobile();        // breakpoint: 768px
 *   const isMobile = useIsMobile(1024);     // custom breakpoint
 */
export function useIsMobile(breakpoint = 768) {
    const getMatch = () =>
        typeof window !== "undefined" ? window.innerWidth <= breakpoint : false;

    const [isMobile, setIsMobile] = useState(getMatch);

    useEffect(() => {
        if (typeof window === "undefined") return;

        let frame;
        const handleResize = () => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() => setIsMobile(getMatch()));
        };

        window.addEventListener("resize", handleResize);
        // catch orientation changes on mobile devices too
        window.addEventListener("orientationchange", handleResize);

        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener("resize", handleResize);
            window.removeEventListener("orientationchange", handleResize);
        };
    }, [breakpoint]);

    return isMobile;
}

export default useIsMobile;