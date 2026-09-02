import React, { useState } from 'react';
import {m} from 'framer-motion';
import { useStore } from '../store';
import RightClickMenu from './RightClickMenu';
import { 
  Folder, 
  File, 
  FileText, 
  FileCode, 
  ChevronLeft, 
  HardDrive,
  Image
} from 'lucide-react';
import '../styles/filemanager.css'; 
// Хелпер для динамических иконок Lucide в зависимости от расширения
  const getFileIcon = (item) => {
    if (item.isDirectory) {
      return <Folder size={20} className="icon-folder" />;
    }

    const extension = item.name.split('.').pop().toLowerCase();
    switch (extension) {
      case 'txt':
      case 'md':
        return <FileText size={20} className="icon-text" />;
      case 'log':
        return <FileText size={20} className="icon-log" />;
      case 'jpg':
      case 'png':
        return <Image size={20} className="icon-log" />;
      case 'json':
      case 'js':
      case 'ts':
      case 'jar':  
      case 'sh':
      case 'yml':
      case 'yaml':
        return <FileCode size={20} className="icon-code" />;
      default:
        return <File size={20} className="icon-file" />;
    }
  };

//  форматирование размера файлов
  const formatSize = (bytes) => {
    if (!bytes || bytes === 0) return '—';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

const FileManager = ({ files, currentPath, loading, error, goInto, goBack, fetchFiles }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const logError = useStore((state) => state.logError);
  const [menuConfig, setMenuConfig] = useState({ isOpen: false, x: 0, y: 0, item: null });
  const handleContextMenu = (event, item) => {
    event.preventDefault();
    event.stopPropagation();
    if (loading) return;
    setMenuConfig({ 
      isOpen: true, 
      x: event.clientX, 
      y: event.clientY, 
      item: item
    });
  };
  const closeMenu = () => setMenuConfig(prev => ({ ...prev, isOpen: false }));
  if (error) {
    return (
      logError({
        error: `no directory deeper available : ${error} time: ${new Date().toLocaleString()}`,
        type: 'Error'
      }),
      <div className="file-manager-error">
        <p>что то пошло не так: {error}</p>
        <button onClick={goBack} 
          className="file-back-btn"
          type="button"
          >
            <ChevronLeft size={16} />
            <span>Назад</span>
          </button>
      </div>
    );
  }

  return (
    <m.div className="file-manager-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }}>
      {/* Шапка */}
      <div className="file-manager-header">
        <div className="path-breadcrumbs">
          <HardDrive size={18} className="drive-icon" />
          <span className="path-text">{currentPath}</span>
        </div>
        
        {currentPath !== '/' && (
          <button onClick={goBack} 
          className="file-back-btn"
          type="button"
          >
            <ChevronLeft size={16} />
            <span>Назад</span>
          </button>
        )}
      </div>

      {/* Основной список / Таблица файлов */}
      <div className="files-list" onContextMenu={(e) => handleContextMenu(e, null)}>
        {loading ? (
          <div className="file-manager-loading">
            <div className="spinner"></div>
            <p>Чтение директории...</p>
          </div>
        ) : files.length === 0 ? (
          <div className="empty-folder">Nothing is here<Folder size={150} color='var(--accent-purple)' className="icon-folder" /> </div> 
        ) : (
          <div className="files-table">
            {/* Заголовки колонок для закоса под полноценную таблицу */}
            <div className="table-header">
              <span className="col-name">Имя</span>
              <span className="col-size">Размер</span>
            </div>

            {/* Сортируем: сначала папки, потом файлы */}
            {files
              .toSorted((a, b) => b.isDirectory - a.isDirectory)
              .map((item) => {
              const isSelected = selectedItem === item.name;

                return (
                  <div
                    key={item.name}
                    className={`file-row ${item.isDirectory ? 'is-dir' : 'is-file'} ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedItem(item.name)}
                    onContextMenu={(e) => handleContextMenu(e, item)}
                    onDoubleClick={() => {
                      if (item.isDirectory) {
                        goInto(item.name);
                        setSelectedItem(null); 
                      } else {
                        console.log(`Открытие файла: ${item.name}`);
                      }
                    }}
                  >
                    <div className="file-name-cell">
                      {getFileIcon(item)}
                      <span className="file-name-text">{item.name}</span>
                    </div>
                    <div className="file-size-cell">
                      {item.isDirectory ? '—' : formatSize(item.size)}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
        {menuConfig.isOpen && (
          <RightClickMenu 
            x={menuConfig.x}
            y={menuConfig.y}
            item={menuConfig.item}
            onClose={closeMenu}
            currentPath={currentPath}
            onRefresh={fetchFiles}
          />
        )}
      </div>
    </m.div>
  );
};

export default FileManager;