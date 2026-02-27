import React, { createContext, useContext, useState, useEffect } from 'react';

const GameModeContext = createContext();

export const useGameMode = () => {
    return useContext(GameModeContext);
};

export const GameModeProvider = ({ children }) => {
    const [isGamified, setIsGamified] = useState(() => {
        const saved = localStorage.getItem('isGamified');
        return saved !== null ? JSON.parse(saved) : true;
    });

    useEffect(() => {
        localStorage.setItem('isGamified', JSON.stringify(isGamified));
    }, [isGamified]);

    const toggleGamified = () => {
        setIsGamified(prev => !prev);
    };

    return (
        <GameModeContext.Provider value={{ isGamified, toggleGamified }}>
            {children}
        </GameModeContext.Provider>
    );
};
