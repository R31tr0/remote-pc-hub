import React, { useState } from 'react';
import '../styles/Dashboard.css'
import { m } from 'framer-motion';
import {Upload} from 'lucide-react';
import useSshFiles from '../hooks/useSshFiles';
import api from '../axiosapi/api.jsx'
import FileManager from './FileManager';
import { useStore } from '../store';
export default function FileDragAndDrop({currentPath, fetchFiles, onClose}) {

const logError = useStore((state) => state.logError);

const handleDrop = async (e) => {
  e.preventDefault();
  e.stopPropagation();

  // 2. Проверяем, что файлы действительно были сброшены
  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
    
    // 3. Забираем самый первый файл из списка (так как multiple = false)
    const file = e.dataTransfer.files[0];
    
    // 4. Передаем этот файл 
    console.log(`Подготовка к загрузке файла: ${file.name} в директорию ${currentPath}`);
    logError({error: `Preparing to upload file: ${file.name} to directory ${currentPath} at ${new Date().toLocaleString()}`, type: 'Success'});
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('path', currentPath+'/'+file.name); 
 
      try {
        await api.post('/api/v1/ssh/files/upload', formData);
        console.log(`Файл ${file.name} успешно загружен!`);
        logError({error: `File ${file.name} uploaded successfully at ${new Date().toLocaleString()}`, type: 'Success'});
        if (fetchFiles) {
          await fetchFiles(currentPath);
        }
 
        // Принудительно обновляем нужный узел дерева, если он открыт,
        // либо корень, если файл загружен в '/'
        //тригерим событие фс рефреш
        window.dispatchEvent(new CustomEvent('fs-refresh', { detail: { path: currentPath } }));
      } catch (error) {
        console.error("Ошибка при загрузке файла на сервер:", error);
         logError({
        error: `drag and drop error : ${error} time: ${new Date().toLocaleString()}`,
        type: 'Error'
      })
      } finally {
        if (onClose) {
          onClose();
        }
      }
  

 
  }
};


return( 
<m.div className="card drop-zone" 
    initial={{ opacity: 0,y:-100 }} 
    animate={{ opacity: 1,y:0 }} 
    transition={{ delay: 0.7 }}
    onDragOver={(e) => e.preventDefault()} // Разрешаем сброс
      onDrop={handleDrop} 
>
 <Upload size={48} className="upload-icon" />
</m.div>
)
}