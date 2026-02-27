import React, { createContext, useContext, useState, useEffect } from 'react';
import { Howl } from 'howler';

const SoundContext = createContext();

export const useSound = () => useContext(SoundContext);

export const SoundProvider = ({ children }) => {
    const [isSoundEnabled, setIsSoundEnabled] = useState(() => {
        const saved = localStorage.getItem('isSoundEnabled');
        return saved !== null ? JSON.parse(saved) : true;
    });

    useEffect(() => {
        localStorage.setItem('isSoundEnabled', JSON.stringify(isSoundEnabled));
    }, [isSoundEnabled]);

    const toggleSound = () => setIsSoundEnabled(prev => !prev);

    // Mock sounds using safe URLs for demo purposes since we don't have local assets
    const sounds = {
        chime: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3'], volume: 0.3 }),
        parchment: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/2569/2569-preview.mp3'], volume: 0.4 }),
        ambient: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/2852/2852-preview.mp3'], volume: 0.1, loop: true })
    };

    const playSound = (soundName) => {
        if (isSoundEnabled && sounds[soundName]) {
            sounds[soundName].play();
        }
    };

    const playAmbient = () => {
        if (isSoundEnabled && !sounds.ambient.playing()) {
            sounds.ambient.play();
        }
    };

    const stopAmbient = () => {
        sounds.ambient.stop();
    };

    return (
        <SoundContext.Provider value={{ isSoundEnabled, toggleSound, playSound, playAmbient, stopAmbient }}>
            {children}
        </SoundContext.Provider>
    );
};
