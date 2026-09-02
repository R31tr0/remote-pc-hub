import React from 'react';
import { m } from 'framer-motion';
import { Settings, Monitor, RefreshCw, Upload, List, Bug } from 'lucide-react';
import { Link } from 'react-router-dom';
import '../src/styles/logs.css';
import { useStore } from './store';





const Logs = () => {
  const errorLog = useStore((state) => state.errorLog);
  const type = useStore((state) => state.type);
  const currentType = type || 'all';
  const filteredLogs = errorLog.filter(item => {
  if (currentType === 'all') return true; 

  const itemType = item.type?.toLowerCase();
  //если выбранная категория совпадает с типом лога, то показываем его
  if (currentType === 'bugs' && itemType === 'bug') return true;
  if (currentType === 'errors' && itemType === 'error') return true;
  if (currentType === 'success' && itemType === 'success') return true;
  
  return itemType === currentType;
});
  return (
    <div className="dashboard-container" style={{ gap: 0 }}>
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
          <Link to="/dashboard" className="nav-item">
            <span className="icon"><Monitor size={32} color="gray" /></span>
            <m.span className="label"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              Dashboard
            </m.span>
          </Link>
          <Link to="/list" className="nav-item">
            <span className="icon"><List size={32} color="gray" /></span>
            <m.span className="label"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              List
            </m.span>
          </Link>
          <Link to="/logs" className="nav-item active">
            <span className="icon"><RefreshCw size={32} color="gray" /></span>
            <m.span className="label"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
            >
              Logs
            </m.span>
          </Link>
          <Link to="/settings" className="nav-item">
            <span className="icon"><Settings size={32} color="gray" /></span>
            <m.span className="label"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
            >
              Settings
            </m.span>
          </Link>
        </nav>

        
      </m.aside>

      <main className="main-content" style={{ padding: '40px' }}>
        <header className="top-bar" style={{ justifyContent: 'space-between' }}>
          <div>
            <span className="separator">/ </span>
            <span className="root">Logs</span>
          </div>
          {/* <m.button
            className="btn-primary"
            onClick={insertMockPc}
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            style={{ marginRight: 8, background: '#6B21A8' }}
          >
            Insert Mock
          </m.button> */}
        </header>
       
            <m.div
              className="logs-placeholder-container"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              style={{ maxHeight: '650px',       // Жестко ограничиваем высоту контейнера
              overflowY: 'scroll',      // Принудительно показываем скроллбар
              overflowX: 'hidden',      // Прячем горизонтальный скролл
              position: 'relative',
              scrollbarWidth: 'thin',
              scrollbarColor: 'black',      
              }}
            >
              <header className="logs-placeholder-header">
                <div className="path-breadcrumbs">
                  <Bug size={18} className="drive-icon" />
                  {/* <span className="path-text">logs</span> */}
                   
    <label htmlFor="choices" className="options-label"></label>
    <div className="select-wrapper">
      <select 
        id="choices" 
        name="options" 
        className="custom-select"
        onChange={(e) => {
  const value = Number(e.target.value);

  if (value === 1) {
    useStore.setState({ type: 'all' }); 
  }
  else if (value === 4) {
    useStore.setState({ type: 'bugs' });
  }
  else if (value === 2) {
    useStore.setState({ type: 'errors' });
  }
  else if (value === 3 )  {
    useStore.setState({ type: 'success' });
  }
}
      }
      >
        <option value="1">All</option>
        <option value="2">Errors</option>
        <option value="3">Success</option>
        <option value="4">Bugs</option>
      </select>
    </div>
  </div>
              
              </header>



              <div className="logs-placeholder-content">
               {filteredLogs.map((item, index) => (
              <div key={index} style={{ 
              borderBottom: '1px solid #333',
              padding: '5px 0',
               display: 'block',
              }}>
              <pre style={{
                margin: 0,
                color: item.type === 'Bug' ? '#dda10b' : item.type === 'Success' ? '#52c41a' : item.type === 'Error' ? '#df5557' : '#ffffff',
                fontSize: '12px',
                overflow: 'hidden'
                 }}>
              <strong>[{item.type}]</strong> {item.error}
            </pre>
         </div>
      ))}
  </div>



            </m.div>
       
      </main>
    </div>
  );
}

export default Logs;
