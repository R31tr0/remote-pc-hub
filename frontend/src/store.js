import { create } from 'zustand'

export const useStore = create((set) => ({
  pcinfo: { ping: '', storage: '', files: '', pc:''  }, 
  setPcInfo: (newData) => set({ pcinfo: newData }), 
}))