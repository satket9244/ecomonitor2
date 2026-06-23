import React, { createContext, useState, useCallback } from 'react';

export const DrawingContext = createContext();

export function DrawingProvider({ children }) {
    const [drawnPolygons, setDrawnPolygons] = useState({
        downtown: null,
        greenspace: null,
    });

    const setDowntown = useCallback((polygon) => {
        setDrawnPolygons(prev => ({ ...prev, downtown: polygon }));
    }, []);

    const setGreenspace = useCallback((polygon) => {
        setDrawnPolygons(prev => ({ ...prev, greenspace: polygon }));
    }, []);

    const clearAll = useCallback(() => {
        setDrawnPolygons({ downtown: null, greenspace: null });
    }, []);

    return (
        <DrawingContext.Provider value={{
            drawnPolygons,
            setDowntown,
            setGreenspace,
            clearAll,
        }}>
            {children}
        </DrawingContext.Provider>
    );
}
