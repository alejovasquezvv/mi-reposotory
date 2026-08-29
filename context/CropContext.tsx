import React, { createContext, useContext, useState } from 'react';
import { CropType } from '@/lib/supabase';

interface CropContextValue {
  selectedCrop: CropType;
  setSelectedCrop: (crop: CropType) => void;
}

const CropContext = createContext<CropContextValue>({
  selectedCrop: 'cafe',
  setSelectedCrop: () => {},
});

export function CropProvider({ children }: { children: React.ReactNode }) {
  const [selectedCrop, setSelectedCrop] = useState<CropType>('cafe');
  return (
    <CropContext.Provider value={{ selectedCrop, setSelectedCrop }}>
      {children}
    </CropContext.Provider>
  );
}

export function useCrop() {
  return useContext(CropContext);
}
