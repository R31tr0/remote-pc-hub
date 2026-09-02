import { useState, useCallback } from 'react';
import api from '../axiosapi/api';
import { useStore } from '../store';

export const useSshFiles = () => {
  const logError = useStore((state) => state.logError);
  
  // Получаем оригинальные переменные и функции напрямую из Zustand стора
  const files = useStore((state) => state.files);
  const setFiles = useStore((state) => state.setFiles);
  const currentPath = useStore((state) => state.currentPath);
  const setCurrentPath = useStore((state) => state.setCurrentPath);

  const [loading, setLoading] = useState(false);   // Крутилка загрузки (остается локальной)
  const [error, setError] = useState(null);       // Ошибки (остается локальной)

  const fetchFiles = useCallback(async (path) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/api/v1/ssh/files?path=${encodeURIComponent(path)}`);
      if (response.status !== 200) {
        logError({
          error: `Error to fetch root directory content: ${response.status} time: ${new Date().toLocaleString()}`,
          type: 'Error'
        });
        throw new Error(`Error to fetch files: ${response.status}`);
      }else{
        logError({
          error: `Fetched files for path ${path} at ${new Date().toLocaleString()}`,
          type: 'Success'
        });
      }
      const data = response.data; 
      setFiles(data);         // Сохраняем в глобальный стор под старым именем
      setCurrentPath(path);   // Фиксируем путь в глобальном сторе под старым именем
    }
    catch (err) {
      logError({
        error: `unusual error: ${err.message} time: ${new Date().toLocaleString()}`,
        type: 'Bug'
      });
      setError(err.message);
    }
    finally {
      setLoading(false);
      logError({
        error: `fetchFiles completed for path ${path} at ${new Date().toLocaleString()}`,
        type: 'Success'
      });
    }
  }, [logError, setFiles, setCurrentPath]);

  // Логика движения во внутрь папки с учетом абсолютных путей
  const goInto = (dirName) => {
    const newPath = currentPath === '/' ? `/${dirName}` : `${currentPath}/${dirName}`;
    fetchFiles(newPath);
  };

  // Логика движения назад для абсолютных путей 
  const goBack = () => {
    if (currentPath === '/') return; 

    const parts = currentPath.split('/');
    parts.pop(); 
    
    const newPath = parts.join('/') || '/'; 
    
    fetchFiles(newPath);
  };

  return { files, currentPath, loading, error, goInto, goBack, fetchFiles };
}

export default useSshFiles;
