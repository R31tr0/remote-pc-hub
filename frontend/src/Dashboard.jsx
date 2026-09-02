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
import DashboardVisual from './DashboardVisual';



const Dashboard = () => {

//память о текущем пк
const pcinfo = useStore((state) => state.pcinfo);
const setPcInfo = useStore((state) => state.setPcInfo);
//память о текущем пк
// файлы 
const { files, currentPath, loading, error, goInto, goBack, fetchFiles } = useSshFiles();
// файлы 
const [open, setOpen] = useState(false);
const [treeView, setTreeView] = useState(false); // для переключения отображения файлов
const [treeActivePath, setTreeActivePath] = useState('/'); // текущий путь в древовидном виде
const logError = useStore((state) => state.logError);
const disconnectAndClearPc = useStore((state) => state.disconnectAndClearPc);

useEffect(() => {
    if (pcinfo.id) {
      console.log(`сессия (ID: ${pcinfo.id}), запрос файлов`);
      fetchFiles('/home'); // Читаем корневую директорию SSH сессии
      if(fetchFiles){
        logError({
          error: `Fetched files for PC ID ${pcinfo.id} at ${new Date().toLocaleString()}`,
          type: 'Success'
        });
      }else{
        logError({
          error: `Failed to fetch files for PC ID ${pcinfo.id} at ${new Date().toLocaleString()}`,
          type: 'Error'
        });
      }
    }
  }, [pcinfo.id,fetchFiles]);

//удаление
const handledelete = async () => {
  const isDeleted = await disconnectAndClearPc();
  
  if (isDeleted.success) {
    alert('заебись удалилось');
    logError({ error: 'Files deleted successfully', type: 'Success' });
  } else {
    alert('чота ни удаляеца проверь консоль');
    logError({ error: `Failed to delete files: ${isDeleted.error}`, type: 'Error' });
  }
};
// модалка
const handleClose = () => setOpen(false);
const addsubmit = () =>{
setOpen(true);
}


  return (

    
    <DashboardVisual
  
  pcinfo={pcinfo}
  addsubmit={addsubmit}

  files={files}
  currentPath={currentPath}
  loading={loading}
  error={error}
  goInto={goInto}
  goBack={goBack}
  fetchFiles={fetchFiles}

  treeView={treeView}
  setTreeView={setTreeView}
  treeActivePath={treeActivePath}
  setTreeActivePath={setTreeActivePath}

  open={open}
  handleClose={handleClose}
  handledelete={handledelete}
    />
    
  );
};

export default Dashboard;