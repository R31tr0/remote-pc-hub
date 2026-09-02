import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from './axiosapi/api.jsx'

export const DEFAULT_COLOR = '#8b5cf6';

export const useStore = create(
  persist(
    (set, get) => ({

      // --- Цвет ---
      accentColor: DEFAULT_COLOR,
      applyAccentColor: (color) => {
        set({ accentColor: color });
        document.documentElement.style.setProperty('--accent-purple', color);
      },
      resetAccentColor: () => {
        set({ accentColor: DEFAULT_COLOR });
        document.documentElement.style.setProperty('--accent-purple', DEFAULT_COLOR);
      },

      // --- Подключение 
      host: '192.168.1.100',
      port: '22',
      username: 'admin',
      sshKeyPath: '',
      autoConnect: true,
      saveConnectionSettings: (data) => set({
        host: data.host,
        port: data.port,
        username: data.username,
        sshKeyPath: data.sshKeyPath,
        autoConnect: data.autoConnect,
      }),

      pcinfo: { ping: '', storage: '', pc: '', id: null }, 
      setPcInfo: (newData) => set((state) => ({ 
        pcinfo: { ...state.pcinfo, ...newData } 
      })), 
      pcPasswords: (() => {
        try {
          const saved = localStorage.getItem('pc_passwords');
          return saved ? JSON.parse(saved) : {};
        } catch (e) {
          return {};
        }
      })(), 
      
      setPcPassword: (id, password) => set((state) => {
        const updatedPasswords = { ...state.pcPasswords, [id]: password };
        try {
          localStorage.setItem('pc_passwords', JSON.stringify(updatedPasswords));
        } catch (e) {
          console.error('Не удалось сохранить пароль в localStorage', e);
        }
        return { pcPasswords: updatedPasswords };
      }),
      errorLog: [],
      logError: ({ error: error, type: type }) => set((state) => ({
        errorLog: [...state.errorLog, { error, type }]
      })),
      disconnectAndClearPc: async () => {
        const { pcinfo, logError } = get(); 

        try {
          if (pcinfo.id) {
            await api.delete(`/api/v1/pcs/${pcinfo.id}`);
          }

          await api.post('/api/v1/ssh/disconnect');

          set({ 
            pcinfo: { pc: '', id: null, ping: '', storage: '' },
            files: [],
            currentPath: '/'
          });

          logError({
            error: `Connection closed/deleted for PC: ${pcinfo.pc || 'Direct'} at ${new Date().toLocaleString()}`,
            type: 'Success'
          });

          return { success: true }; 
        } catch (err) {
          console.error('Error deleting connection:', err.response?.data?.message || err.message);
          
          logError({
            error: `Error deleting connection: ${err.response?.data?.message || err.message} время: ${new Date().toLocaleString()}`,
            type: 'Error'
          });

          return { success: false }; 
        }
      },
      files: [],
      currentPath: '/',
      setFiles: (files) => set({ files }),
      setCurrentPath: (currentPath) => set({ currentPath }),
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({
        accentColor: state.accentColor,
        host: state.host,
        port: state.port,
        username: state.username,
        sshKeyPath: state.sshKeyPath,
        autoConnect: state.autoConnect,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.accentColor) {
          document.documentElement.style.setProperty('--accent-purple', state.accentColor);
        }
      },
    }
  )
)