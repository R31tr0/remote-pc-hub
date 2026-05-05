import { create } from 'zustand'

export const useStore = create((set) => ({
  pcinfo: { ping: '1', storage: '300mb/15gb', pc: 'dummypc', id: null }, 
  setPcInfo: (newData) => set((state) => ({ 
    pcinfo: { ...state.pcinfo, ...newData } 
  })), 
}))