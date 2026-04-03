import React, { useEffect, useRef, useState } from 'react';

const BOT_SIZE = 72;
const EDGE_PADDING = 16;
const STORAGE_KEY = 'companyBotPosition';
const CLICK_DRAG_THRESHOLD = 6;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const getDefaultPosition = () => {
    if (typeof window === 'undefined') {
        return { x: 20, y: 120 };
    }

    return {
        x: Math.max(EDGE_PADDING, window.innerWidth - BOT_SIZE - EDGE_PADDING),
        y: Math.max(120, window.innerHeight - BOT_SIZE - 140)
    };
};

const getStoredPosition = () => {
    const fallback = getDefaultPosition();

    if (typeof window === 'undefined') {
        return fallback;
    }

    try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        const x = Number(stored?.x);
        const y = Number(stored?.y);

        if (Number.isFinite(x) && Number.isFinite(y)) {
            return { x, y };
        }
    } catch (error) {
        // Ignore invalid localStorage data and use fallback.
    }

    return fallback;
};

const C_DraggableBotAssistant = ({ onOpenJobPostBot }) => {
    const [position, setPosition] = useState(getStoredPosition);
    const [isDragging, setIsDragging] = useState(false);
    const dragOffsetRef = useRef({ x: 0, y: 0 });
    const dragStartPointRef = useRef({ x: 0, y: 0 });
    const movedDistanceRef = useRef(0);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(position));
    }, [position]);

    useEffect(() => {
        const handleResize = () => {
            const maxX = Math.max(EDGE_PADDING, window.innerWidth - BOT_SIZE - EDGE_PADDING);
            const maxY = Math.max(120, window.innerHeight - BOT_SIZE - EDGE_PADDING);

            setPosition((current) => ({
                x: clamp(current.x, EDGE_PADDING, maxX),
                y: clamp(current.y, 120, maxY)
            }));
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const startDrag = (clientX, clientY) => {
        dragStartPointRef.current = { x: clientX, y: clientY };
        movedDistanceRef.current = 0;
        dragOffsetRef.current = {
            x: clientX - position.x,
            y: clientY - position.y
        };
        setIsDragging(true);
    };

    const moveDrag = (clientX, clientY) => {
        if (!isDragging) {
            return;
        }

        const maxX = Math.max(EDGE_PADDING, window.innerWidth - BOT_SIZE - EDGE_PADDING);
        const maxY = Math.max(120, window.innerHeight - BOT_SIZE - EDGE_PADDING);

        const nextX = clamp(clientX - dragOffsetRef.current.x, EDGE_PADDING, maxX);
        const nextY = clamp(clientY - dragOffsetRef.current.y, 120, maxY);

        movedDistanceRef.current = Math.max(
            movedDistanceRef.current,
            Math.abs(clientX - dragStartPointRef.current.x) + Math.abs(clientY - dragStartPointRef.current.y)
        );

        setPosition({ x: nextX, y: nextY });
    };

    const handleClick = () => {
        if (movedDistanceRef.current <= CLICK_DRAG_THRESHOLD && typeof onOpenJobPostBot === 'function') {
            onOpenJobPostBot();
        }
    };

    useEffect(() => {
        const handleMouseMove = (event) => {
            moveDrag(event.clientX, event.clientY);
        };

        const handleTouchMove = (event) => {
            const touch = event.touches[0];
            if (!touch) {
                return;
            }
            moveDrag(touch.clientX, touch.clientY);
        };

        const handleMouseUp = () => setIsDragging(false);
        const handleTouchEnd = () => setIsDragging(false);

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            window.addEventListener('touchmove', handleTouchMove, { passive: false });
            window.addEventListener('touchend', handleTouchEnd);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, [isDragging]);

    return (
        <div
            className="fixed z-[60]"
            style={{ left: position.x, top: position.y }}
            aria-label="INTERNIX assistant bot"
        >
            <div className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-sky-600 px-3 py-1 text-xs font-semibold text-white shadow-lg">
                Hii 👋 Click ME Create JoB POST
            </div>

            <button
                type="button"
                onClick={handleClick}
                onMouseDown={(event) => startDrag(event.clientX, event.clientY)}
                onTouchStart={(event) => {
                    const touch = event.touches[0];
                    if (!touch) {
                        return;
                    }
                    startDrag(touch.clientX, touch.clientY);
                }}
                className={`flex h-[72px] w-[72px] cursor-grab select-none items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-sky-500 to-indigo-600 text-3xl shadow-2xl transition-transform ${isDragging ? 'scale-95 cursor-grabbing' : 'hover:scale-105'}`}
                title="Drag me anywhere"
            >
                <span role="img" aria-label="bot">
                    🤖
                </span>
            </button>
        </div>
    );
};

export default C_DraggableBotAssistant;
