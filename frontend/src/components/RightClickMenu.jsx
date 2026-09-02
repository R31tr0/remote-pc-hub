  import '../styles/rightclickmenu.css';
  import { useEffect,useRef,useState } from 'react';
  import { m, AnimatePresence } from 'framer-motion';
  import PermissionsModal from './PermissionsModal';
  import api from '../axiosapi/api';
    import { useStore } from '../store';
    const RightClickMenu = ({ x, y, item, onClose, currentPath,onRefresh }) => {
    const logError = useStore((state) => state.logError);
    const menuRef = useRef(null);
    const [showPermissions, setShowPermissions] = useState(false);
    const [permPath, setPermPath] = useState('');
    
    useEffect(() => {
      const handleOutsideClick = (event) => {
        if (showPermissions) return;
          if (menuRef.current && !menuRef.current.contains(event.target)) {
          onClose();
        }
      };

      document.addEventListener('click', handleOutsideClick,{ capture: true });
      document.addEventListener('contextmenu', handleOutsideClick,{ capture: true });
      
      return () => {
        
        document.removeEventListener('click', handleOutsideClick, { capture: true });
        document.removeEventListener('contextmenu', handleOutsideClick, { capture: true });
      
      }

    }, [onClose,showPermissions]);

      const handleaddfile = async() => {
      
        const fileName = prompt("Введите имя нового файла:");
        
        if (!fileName || fileName.trim() === "") {
        onClose();
        logError({error: `File creation canceled or invalid name provided at ${new Date().toLocaleString()}`, type: 'error'});
        return;
      }

      const targetPath = currentPath === '/' ? `/${fileName}` : `${currentPath}/${fileName}`;
      
      try {
        
        await api.post('/api/v1/ssh/files/create-file', { path: targetPath });
        console.log(`Файл ${fileName} успешно создан в ${currentPath}`);
        console.log('Calling onRefresh with path:', currentPath);
        logError({error:'file created successfully: ' + targetPath + ' at ' + new Date().toLocaleString(), type: 'Success'});
        
        if (onRefresh) {
          await onRefresh(currentPath);
        } else {
          console.log('onRefresh is not defined!');
        }
      
      }
      catch (error) {
        console.error("Ошибка при создании файла:", error);
        logError({error: `Failed to create file ${fileName} at ${currentPath}: ${error.response?.data?.message || error.message} at ${new Date().toLocaleString()}`, type: 'Error'});
      }
      finally {
        onClose(); 
      }
    }
    const handleaddfolder = async () => {
      
      const folderName = prompt("Введите имя новой папки:");
      
        if (!folderName || folderName.trim() === "") {
        onClose();
        logError({error:'Folder creation canceled or invalid name provided at ${new Date().toLocaleString()}', type: 'error'});
        return;
      }

      const targetPath = currentPath === '/' ? `/${folderName}` : `${currentPath}/${folderName}`;
      
      try{
       
        await api.post('/api/v1/ssh/files/create-directory', { path: targetPath });
        
        console.log(`папка ${folderName} успешно создан в ${currentPath}`);
        console.log('Calling onRefresh with path:', currentPath);
        logError({error:'directory created successfully: ' + targetPath + ' at ' + new Date().toLocaleString(), type: 'Success'});
        
        if(onRefresh){
          await onRefresh(currentPath);
        } else {
          console.log('onRefresh is not defined!');
        }
      }
      catch(error){
        console.error("Ошибка при создании папки:", error);
        logError({error:`error occurred while creating directory ${folderName} at ${currentPath}: ${error.response?.data?.message || error.message} at ${new Date().toLocaleString()}`, type: 'Error'});
      }
      finally{
      onClose();
      }
    }
    const handledeletefile = async () => {
    
    const targetfile = item.name;
    const targetPath = currentPath === '/' ? `/${targetfile}` : `${currentPath}/${targetfile}`;
    const targetpath2 = currentPath;

 try {
  try {
    
    // Первая попытка удаления
    
    const res = await api.delete(`/api/v1/ssh/files?path=${encodeURIComponent(targetPath)}`);
    
    console.log(`Файл ${targetfile} успешно удален по пути ${targetPath}`);
    logError({error: `File ${targetfile} deleted successfully at ${new Date().toLocaleString()}`, type: 'Success'});
    
      if (res && onRefresh) {
      await onRefresh(currentPath);
    }
  } 
    
  catch (firstError) {
    console.warn("Первая попытка не удалась, пробуем targetpath2:", firstError);
    logError({error: `First deletion attempt failed for ${targetfile} at ${new Date().toLocaleString()}: ${firstError.response?.data?.message || firstError.message}`, type: 'Bug'});
    // Вторая попытка с альтернативным путем
    const res = await api.delete(`/api/v1/ssh/files?path=${encodeURIComponent(targetpath2)}`); 
    console.log(`Файл ${targetfile} успешно удален по пути ${targetpath2}`);
    logError({error: `File ${targetfile} deleted successfully on second attempt at ${new Date().toLocaleString()}`, type: 'Success'});
    if (res && onRefresh) {
      // Безопасно убираем слэш на конце, если он есть (например, "/folder/subfolder/" -> "/folder/subfolder")
      const cleanPath = currentPath.endsWith('/') && currentPath !== '/' 
        ? currentPath.slice(0, -1) 
        : currentPath;

      // Находим индекс последнего слэша для перехода на уровень выше
      const lastSlashIndex = cleanPath.lastIndexOf('/');
      const treepath = lastSlashIndex > 0 ? cleanPath.substring(0, lastSlashIndex) : '/';
      
      console.log('Вызываем onRefresh для родительского пути:', treepath);
      await onRefresh(treepath);
    }
  }
} catch (error) {
  console.error("Ошибка при удалении файла в обеих файловых системах или при обновлении:", error);
  logError({error: `Failed to delete file ${targetfile} in both attempts at ${new Date().toLocaleString()}: ${error.response?.data?.message || error.message}`, type: 'Error'});
} finally {
  onClose();
}
};
    const handledeletefolder = async () => {
  
      // для папки targetPath это уже сам currentPath, имя дублировать не надо
  
  const targetPath = currentPath;
  
  try {
    await api.delete(`/api/v1/ssh/files?path=${encodeURIComponent(targetPath)}`);
    console.log(`папка успешно удалена: ${targetPath}`);
      logError({error: `Directory deleted successfully at ${new Date().toLocaleString()}`, type: 'Success'});
    if (onRefresh) {
      await onRefresh(currentPath);
    }
  
  } catch (error) {
    console.error("Ошибка при удалении папки:", error);
    logError({error: `Failed to delete directory at ${new Date().toLocaleString()}: ${error.response?.data?.message || error.message}`, type: 'Error'});
  } finally {
    onClose();
  }
};
    const handledownloadfile = async () => {
    
    const targetfile = item.name;    
    const targetPath = currentPath === '/' ? `/${targetfile}` : `${currentPath}/${targetfile}`;

    console.log(`Скачивание файла: ${targetfile}`);
      logError({error: `Downloading file: ${targetfile} from path: ${targetPath} at ${new Date().toLocaleString()}`, type: 'Success'});
    try {
      //скачивание блоб
      const response = await api.get(`/api/v1/ssh/files/download?path=${encodeURIComponent(targetPath)}`, {
        responseType: 'blob' 
      });

      
      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', targetfile); 
      
      document.body.appendChild(link);
      link.click(); 
      
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

    } catch (error) {
      console.error("Ошибка при скачивании файла:", error);
      logError({error:'error occured while downloading the file',type: 'Error'});
    } finally {
      onClose();
    }
  };
  const handleuploadfile = async () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.multiple = false;

    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      console.log(`Подготовка к загрузке файла: ${file.name} в директорию ${currentPath}`);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('path', currentPath+'/'+file.name); 

      try {
        await api.post('/api/v1/ssh/files/upload', formData);
        console.log(`Файл ${file.name} успешно загружен!`);
        logError({error: `File ${file.name} uploaded successfully at ${new Date().toLocaleString()}`, type: 'Success'});
        if (onRefresh) {
          await onRefresh(currentPath);
        }
      } catch (error) {
        console.error("Ошибка при загрузке файла на сервер:", error);
        logError({error: `an error occured while uploading the file: ${error} time: ${new Date().toLocaleString()}`, type: 'Error'});
      } finally {
        onClose(); 
      }
    };

    fileInput.click();
  }
  const handlepremissions = async () =>{
    const filePath = item && !item.isDirectory
    ? `${currentPath}/${item.name}`
    : currentPath;
    
  console.log('item:', item);
  console.log('currentPath:', currentPath);
  console.log('итоговый путь:', filePath);
  setShowPermissions(true);
  setPermPath(filePath);
  }
   const handlePermissionsClose = () => {
    setShowPermissions(false);
    onClose();
  };
    return (
      <>
      <div 
        ref={menuRef}
        className="right-click-menu"
        style={{top: `${y}px`, left: `${x}px`,position:'fixed' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="menu-header" >выберите действие</div>
        <button onClick={handleaddfile}>Добавить файл</button>
        <button onClick={handleaddfolder}>Добавить папку</button>
        <button onClick={handledeletefile}>Удалить файл</button>
        <button onClick={handledeletefile}>Удалить папку</button>
        <button onClick={handledownloadfile}>Скачать файл</button>
        <button onClick={handleuploadfile}>загрузить файл</button>
        <button onClick={handlepremissions}>Изменение прав</button>
      
      </div>
       <AnimatePresence>
        {showPermissions && (
          <PermissionsModal
            path={permPath}
            onClose={handlePermissionsClose} 
            onClose={handlePermissionsClose}
          />
        )}
      </AnimatePresence>
      </>
    );
  };
  export default RightClickMenu;