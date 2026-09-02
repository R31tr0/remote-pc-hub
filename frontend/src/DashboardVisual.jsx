import React, { useState,useEffect } from 'react';
import './styles/Dashboard.css'
import { Settings, Monitor, RefreshCw, Upload, List } from 'lucide-react';
import { m } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useStore } from './store';
import NewConectionModal from './components/NewConectionModal';
import api from './axiosapi/api';
import { useSshFiles } from './hooks/useSshFiles';
import FileManager from './components/FileManager';
import FileTree from './components/TreeView';
import FileDragAndDrop from './components/FileDragAndDrop'


const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

   const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

const DashboardVisual = ({ 

  pcinfo,
  addsubmit,
  files,
  currentPath,
  loading,
  error,
  goInto,
  goBack,
  fetchFiles,
  treeView,
  setTreeView,
  treeActivePath,
  setTreeActivePath,
  open,
  handleClose,
  handledelete,
 })  => {


return (

    
    <div className="dashboard-container">
      {/* ЛЕВАЯ ПАНЕЛЬ (NAV) */}
      <m.aside 
      className="sidebar"
      initial={{ opacity: 0, x: -20 }} 
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="logo">
        <div className="logo-icon"></div>
        <span className="logo-text">remote</span>
      </div>

      <nav className="nav-menu">
        <div className="nav-item active">
          <span className="icon"><Monitor size={32} color="gray" /></span>
          <m.span className="label"
          initial={{ opacity: 0, x: -20 }} 
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6}}
          >Dashboard</m.span>
        </div>
        <Link to="/list" className="nav-item">
          <span className="icon"><List size={32} color="gray" /></span>
          <m.span className="label"
           initial={{ opacity: 0, x: -20 }} 
           animate={{ opacity: 1, x: 0 }}
           transition={{ delay: 0.7}}
           >list</m.span>
        </Link>
        <Link to="/logs" className="nav-item">
          <span className="icon"><RefreshCw size={32} color="gray" /></span>
          <m.span className="label"
           initial={{ opacity: 0, x: -20 }} 
           animate={{ opacity: 1, x: 0 }}
           transition={{ delay: 0.8}}
           >Logs</m.span>
        </Link>
        <Link to="/settings" className="nav-item">
          <span className="icon"><Settings size={32} color="gray" /></span>
          <m.span className="label"
           initial={{ opacity: 0, x: -20 }} 
           animate={{ opacity: 1, x: 0 }}
           transition={{ delay: 0.8}}
          >Settings</m.span>
        </Link>
      </nav>

      
    </m.aside>
      {/* ОСНОВНОЙ КОНТЕНТ */}
      <main className="main-content">
        
        {/* ВЕРХНЯЯ ПАНЕЛЬ */}
        <header className="top-bar">
          <div className="path-display">
            <span className="separator">/</span>
            <span className="root">{pcinfo.pc}</span>
           
            
          </div>
          <m.div className="header-actions"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5, ease: 'easeOut' }}
          >
            <m.button
              className="btn-primary"
              onClick={addsubmit}
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            >New Connection</m.button>
         </m.div>
        </header>
        {open && <NewConectionModal 
        onClose={handleClose} 
        filesonadd={fetchFiles}
        />}

        {/* РАБОЧАЯ ОБЛАСТЬ */}
        <div className="scroll-area">
          
          {/* СЕКЦИЯ С ВИДЖЕТАМИ (BENTO) */}
          <m.section className="stats-grid"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.12,
                }
              }
            }}
          >
            {/* можно анимки вынести в отдельный варик типо верх в низ но лень */}
            <m.div className="card stat-card" 
            initial={{ opacity: 0,y:-100 }} 
            animate={{ opacity: 1,y:0 }} 
            transition={{ delay: 0.1 }}
            >
              <span className="card-label">Latency</span>
              <div className="card-value">{pcinfo.ping}</div>
            </m.div>
            <m.div className="card stat-card" 
            initial={{ opacity: 0,y:100 }} 
            animate={{ opacity: 1,y:0 }} 
            transition={{ delay: 0.4 }}
            >
              <span className="card-label">storage</span>
              <div className="card-value">{pcinfo.storage}</div>
            </m.div>
            {/* <m.div className="card drop-zone" 
            initial={{ opacity: 0,y:-100 }} 
            animate={{ opacity: 1,y:0 }} 
            transition={{ delay: 0.7 }}
            >
              <Upload size={48} className="upload-icon" />
            </m.div> */}
          <FileDragAndDrop
          currentPath={treeView ? treeActivePath : currentPath} 
          fetchFiles={fetchFiles}
          />
          </m.section>

          {/* ФАЙЛОВЫЙ МЕНЕДЖЕР */}
         <section className="file-section">
 <h2 className="section-title">Your Files:</h2>

  <div className="options-container">
    <label htmlFor="choices" className="options-label">display:</label>
    <div className="select-wrapper">
      {/* ВСЕ свойства управления (value и onChange) переносим СЮДА, на сам select */}
      <select 
        id="choices" 
        name="options" 
        className="custom-select"
        value={treeView ? "2" : "1"} 
        onChange={(e) => {
          if (e.target.value === "2") {
            setTreeView(true);  // Включаем дерево
            setTreeActivePath('/'); // Сбрасываем путь на корневую директорию
            console.log('tree view enabled');
          } else {
            setTreeView(false); // Включаем проводник (folders)
            console.log('file manager view enabled');
          }
        }}
      >
        {/* Внутри опций оставляем только их законные значения */}
        <option value="1">folders</option>
        <option value="2">tree</option>
      </select>
    </div>
  </div>
  <div>
    <m.button
      className="deletebutton"
      onClick={handledelete}
    >delete current conection</m.button>
  </div>
  
</section>

         {treeView ? (

  <FileTree 
    currentPath={currentPath}
    fetchFiles={fetchFiles}
    onPathChange={setTreeActivePath}
    onFileSelect={(filePath) => {
    }} 
  />
) : (
  
  <FileManager 
    files={files} 
    currentPath={currentPath} 
    loading={loading} 
    error={error} 
    goInto={goInto} 
    goBack={goBack} 
    fetchFiles={fetchFiles}
  />
)}
        </div>
      </main>
    </div>
  );


}
export default DashboardVisual;