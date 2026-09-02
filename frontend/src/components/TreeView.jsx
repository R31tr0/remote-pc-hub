import React, { useState, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Folder, FolderTree, FolderOpen, File, ChevronRight, ChevronDown, ListTree } from 'lucide-react';
import api from '../axiosapi/api';
import { useStore } from '../store';
import '../styles/treeview.css';
import RightClickMenu from './RightClickMenu';

const TreeNode = ({ item, parentPath = '', onFileSelect, setActivePath, onContextMenu, parentRefresh }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(false);
  const logError = useStore((state) => state.logError);

  const currentPath = parentPath
    ? `${parentPath.replace(/\/$/, '')}/${item.name}`
    : `/${item.name}`;

  // refresh обновляет ТОЛЬКО СВОИХ детей (список содержимого этой папки)
  const refresh = async () => {
    if (!item?.isDirectory) {
      console.log('Refresh ignored: item is not a directory');
      return;
    }

    try {
      const res = await api.get(`/api/v1/ssh/files?path=${encodeURIComponent(currentPath)}`);
      const sorted = res.data.sort((a, b) => b.isDirectory - a.isDirectory);
      setChildren(sorted);
      setIsOpen(true);
      console.log('Self refresh successful for', currentPath, 'updated', sorted.length, 'files');
    } catch (error) {
      logError({
        error: `Ошибка обновления директории: ${error.response?.data?.message || error.message} time: ${new Date().toLocaleString()}`,
        type: 'Error'
      });
    }
  };

  const handleToggle = async () => {
    if (!item.isDirectory) {
      onFileSelect(currentPath);
      setActivePath(currentPath);
      return;
    }

    const nextOpenState = !isOpen;
    setIsOpen(nextOpenState);
    setActivePath(currentPath);

    if (nextOpenState && children.length === 0) {
      setLoading(true);
      try {
        const res = await api.get(`/api/v1/ssh/files?path=${encodeURIComponent(currentPath)}`);
        const sorted = res.data.sort((a, b) => b.isDirectory - a.isDirectory);
        setChildren(sorted);
      } catch (err) {
        logError({
          error: `Error fetching directory contents: ${err.response?.data?.message || err.message} time: ${new Date().toLocaleString()}`,
          type: 'Error'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const handleForceRefresh = (e) => {
      if (e.detail?.path === currentPath) {
        refresh();
      }
    };
    window.addEventListener('fs-refresh', handleForceRefresh);
    return () => window.removeEventListener('fs-refresh', handleForceRefresh);
  }, [currentPath]);

  const handleContextMenuWrapper = (e) => {
    // Клик по САМОЙ строке = действие над этим элементом (удалить/переименовать)
    // => нужно обновлять РОДИТЕЛЯ, а не себя
    onContextMenu(e, item, currentPath, parentRefresh);
  };

  return (
    <div className="tree-node">
      <div
        className={`tree-row ${item.isDirectory ? 'is-dir' : 'is-file'} ${isOpen ? 'is-open' : ''}`}
        onClick={handleToggle}
        onContextMenu={handleContextMenuWrapper}
      >
        <div className="arrow-box">
          {item.isDirectory && (isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}
        </div>

        <div className="icon-box">
          {item.isDirectory ? (
            isOpen
              ? <FolderOpen size={16} className="tree-icon-folder" />
              : <Folder size={16} className="tree-icon-folder" />
          ) : (
            <File size={16} className="tree-icon-file" />
          )}
        </div>

        <span className="tree-node-name">{item.name}</span>
      </div>

      <AnimatePresence>
        {isOpen && item.isDirectory && (
          <m.div
            className="tree-children"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onContextMenu={(e) => {
              e.stopPropagation();
              // Клик по пустой области ВНУТРИ папки = "создать файл/папку здесь"
              // => нужно обновлять себя (эту же папку)
              onContextMenu(e, item, currentPath, refresh);
            }}
          >
            {loading ? (
              <div className="tree-loading">Загрузка...</div>
            ) : children.length === 0 ? (
              <div
                className="tree-empty"
                onContextMenu={(e) => {
                  e.stopPropagation();
                  onContextMenu(e, item, currentPath, refresh);
                }}
              >
                Пусто
              </div>
            ) : (
              children.map((child) => (
                <TreeNode
                  key={child.name}
                  item={child}
                  parentPath={currentPath}
                  onFileSelect={onFileSelect}
                  setActivePath={setActivePath}
                  parentRefresh={refresh}
                  onContextMenu={onContextMenu}
                />
              ))
            )}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FileTree = ({ onFileSelect, currentPath, fetchFiles, onPathChange }) => {
  const logError = useStore((state) => state.logError);
  const [rootFiles, setRootFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nofiles, setNofiles] = useState(false);
  const [activePath, setActivePath] = useState(currentPath || '/');
  const pcinfo = useStore((state) => state.pcinfo);
  const [menuConfig, setMenuConfig] = useState({ isOpen: false, x: 0, y: 0, item: null });

  const fetchRootFiles = async () => {
    setLoading(true);
    setNofiles(false);
    try {
      const response = await api.get('/api/v1/ssh/files?path=/');
      const sorted = response.data.sort((a, b) => b.isDirectory - a.isDirectory);
      setRootFiles(sorted);
    } catch (err) {
      logError({
        error: `Error fetching root directory contents: ${err.response?.data?.message || err.message} time: ${new Date().toLocaleString()}`,
        type: 'Error'
      });
      setNofiles(true);
    } finally {
      setLoading(false);
    }
  };

  // item: элемент, по которому кликнули (или null, если клик по пустому месту)
  // computedPath: путь этого элемента
  // refreshFn: правильная функция обновления, уже выбранная в TreeNode
  //   - для клика по строке элемента = parentRefresh (родитель)
  //   - для клика по пустой области открытой папки = refresh (сама папка)
  const handleContextMenu = (event, item, computedPath, refreshFn) => {
    event.preventDefault();
    event.stopPropagation();
    if (!pcinfo.pc || loading || nofiles) return;

    let targetPath = computedPath || '/';

    if (item && !item.isDirectory) {
      const parts = targetPath.split('/').filter(Boolean);
      parts.pop();
      targetPath = '/' + parts.join('/');
    }

    targetPath = targetPath.replace(/\/+/g, '/');

    setMenuConfig({
      isOpen: true,
      x: event.clientX,
      y: event.clientY,
      item: item,
      treePath: targetPath,
      refresh: refreshFn || fetchRootFiles,
    });
  };

  const closeMenu = () => setMenuConfig(prev => ({ ...prev, isOpen: false }));

  useEffect(() => {
    if (onPathChange) {
      onPathChange(activePath);
    }
  }, [activePath, onPathChange]);

  useEffect(() => {
    if (pcinfo.pc) {
      fetchRootFiles();
    } else {
      setRootFiles([]);
      setNofiles(false);
      setLoading(false);
    }
  }, [pcinfo.pc, logError]);
//событие на весь браузер с рефрешем драг енд дропа 
  useEffect(() => {
    const handleForceRefresh = (e) => {
      if (e.detail?.path === '/') {
        fetchRootFiles();
      }
    };
    window.addEventListener('fs-refresh', handleForceRefresh);
    return () => window.removeEventListener('fs-refresh', handleForceRefresh);
  }, []);

  return (
    <m.div
      className="file-manager-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
      onContextMenu={(e) => handleContextMenu(e, null, '/', fetchRootFiles)}
    >
      <div className="file-manager-header">
        <div className="path-breadcrumbs">
          <FolderTree size={18} className="drive-icon" />
          <span className="path-text">{activePath}</span>
        </div>
      </div>

      <div className="files-list">
        {menuConfig.isOpen && (
          <RightClickMenu
            x={menuConfig.x}
            y={menuConfig.y}
            item={menuConfig.item}
            onClose={closeMenu}
            currentPath={menuConfig.treePath}
            onRefresh={menuConfig.refresh}
          />
        )}

        {loading ? (
          <div className="file-manager-loading">
            <div className="spinner"></div>
            <p>Чтение директории...</p>
          </div>
        ) : nofiles || rootFiles.length === 0 ? (
          <div
            className="empty-folder"
            onContextMenu={(e) => handleContextMenu(e, null, '/', fetchRootFiles)}
          >
            Nothing is here
            <ListTree size={150} color='var(--accent-purple)' className="icon-folder" />
          </div>
        ) : (
          <div className="file-tree-container">
            {rootFiles.map((item) => (
              <TreeNode
                key={item.name}
                item={item}
                parentPath=""
                onFileSelect={onFileSelect}
                setActivePath={setActivePath}
                parentRefresh={fetchRootFiles}
                onContextMenu={handleContextMenu}
              />
            ))}
          </div>
        )}
      </div>
    </m.div>
  );
};

export default FileTree;