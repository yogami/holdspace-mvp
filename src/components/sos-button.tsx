"use client";

import { useState } from "react";

interface SOSButtonProps {
    onTrigger: () => void;
    disabled?: boolean;
}

export function SOSButton({ onTrigger, disabled = false }: SOSButtonProps) {
    const [confirming, setConfirming] = useState(false);
    const [triggered, setTriggered] = useState(false);

    const handleClick = () => {
        if (triggered) return;

        if (!confirming) {
            setConfirming(true);
            // Auto-reset after 5 seconds if not confirmed
            setTimeout(() => setConfirming(false), 5000);
            return;
        }

        // Second click = confirmed
        setTriggered(true);
        onTrigger();
    };

    if (triggered) {
        return (
            <div className="sos-triggered">
                <span className="sos-triggered__icon">🛡️</span>
                <span>Help is on the way. Session ended.</span>
            </div>
        );
    }

    return (
        <button
            className={`sos-button ${confirming ? 'sos-button--confirming' : ''}`}
            onClick={handleClick}
            disabled={disabled}
            aria-label={confirming ? 'Confirm SOS — tap again to end session' : 'SOS — End session immediately'}
        >
            {confirming ? (
                <>
                    <span className="sos-button__icon">⚠️</span>
                    <span>Tap again to confirm</span>
                </>
            ) : (
                <>
                    <span className="sos-button__icon">🆘</span>
                    <span>SOS</span>
                </>
            )}
        </button>
    );
}
