'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Coin {
    id: number;
    x: string;
    rotate: number;
    duration: number;
    delay: number;
}

export const FallingCoins = () => {
    const [mounted, setMounted] = useState(false);
    const [coins, setCoins] = useState<Coin[]>([]);

    useEffect(() => {
        Promise.resolve().then(() => setMounted(true));
    }, []);

    useEffect(() => {
        if (!mounted) return;

        const newCoins = Array.from({ length: 12 }).map((_, i) => ({
            id: i,
            x: `${Math.random() * 100}%`,
            rotate: 360 * Math.random(),
            duration: 2 + Math.random() * 3,
            delay: Math.random() * 5,
        }));
        Promise.resolve().then(() => setCoins(newCoins));
    }, [mounted]);

    if (!mounted || coins.length === 0) return null;

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
            {coins.map((coin) => (
                <motion.div
                    key={coin.id}
                    initial={{ y: -50, x: coin.x, opacity: 0 }}
                    animate={{
                        y: 500,
                        opacity: [0, 1, 1, 0],
                        rotate: coin.rotate,
                    }}
                    transition={{
                        duration: coin.duration,
                        repeat: Infinity,
                        delay: coin.delay,
                        ease: "linear",
                    }}
                    className="absolute w-6 h-6"
                >
                    <div className="w-full h-full rounded-full bg-linear-to-br from-yellow-300 to-yellow-600 shadow-lg border border-yellow-200/50 flex items-center justify-center text-[10px] font-bold text-yellow-900 leading-none">
                        $
                    </div>
                </motion.div>
            ))}
        </div>
    );
};
