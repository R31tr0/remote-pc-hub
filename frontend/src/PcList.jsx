import React, { useEffect, useState, useRef } from 'react';
import { Settings, Monitor, RefreshCw, Upload, List, ArrowRight, Trash2 } from 'lucide-react';
import { m } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from './axiosapi/api';
import { useStore } from './store';
import NewConectionModal from './components/NewConectionModal';
import './styles/Dashboard.css';


const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.9, ease: "easeOut" }
    }
  };

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.88, ease: 'easeOut' } }
  };

const PcList = () => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [pcs, setPcs] = useState([]);
  const [selectedPc, setSelectedPc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState('');
  const files = useStore((state) => state.files);
  const setPcPassword = useStore((state) => state.setPcPassword);
  const pcPasswords = useStore((state) => state.pcPasswords);
  const pcinfo = useStore((state) => state.pcinfo);
  const setPcInfo = useStore((state) => state.setPcInfo);
  const logError = useStore((state) => state.logError);
  const location = useLocation();
  const navigate = useNavigate();

  // Синхронный замок — не зависит от React рендера, меняется мгновенно,
  // в отличие от isInitializing (state), который применяется только после ре-рендера.
  const isConnectingRef = useRef(false);

  const loadPcs = React.useCallback(async () => {
    setLoading(true);
    setError('');
    setStatus('');
    try {
      const response = await api.get('/api/v1/pcs');
      setPcs(response.data || []);
      setLoading(false);
      logError({
        error: `Loaded PC list successfully at ${new Date().toLocaleString()}`,
        type: 'Success'
});
    } catch (err) {
      console.error('Ошибка загрузки списка ПК:', err.response?.data?.message || err.message);
      setError('Error loading PC list.');
      logError({
      error: 'failed to load  PC list: ' + (err.response?.data?.message || err.message) + ' время: ' + new Date().toLocaleString(),
      type: 'Error' 
});
      setLoading(false);
    }
  },[logError]);
// doctor-disable-next-line react-doctor/no-initialize-state
  useEffect(() => {
    loadPcs();
  }, []);
 useEffect(() => {
    if (pcinfo !== undefined) { 
      setIsInitializing(false); 
    }
  }, [pcinfo]);
  
  useEffect(() => {
    if (location.pathname === '/list') {
      setStatus('');
      
      const fetchPcs = async () => {
        setLoading(true);
        setError('');
        try {
          const response = await api.get('/api/v1/pcs');
          setPcs(response.data || []);
        } catch (err) {
          console.error('Ошибка загрузки списка ПК:', err.response?.data?.message || err.message);
          setError('Error loading PC list.');
          logError({
          error: 'failed to load  PC list: ' + (err.response?.data?.message || err.message) + ' время: ' + new Date().toLocaleString(),
          type: 'Error' 
    });
        } finally {
          setLoading(false);
        }
      };
      fetchPcs();
    }
  }, [location.pathname]);

  const handleSelectPc = (pc) => {
    setSelectedPc(pc);
    setStatus('');
  };

  const handleConnect = async () => {
    console.log('[connect] handleConnect CALLED, ref=', isConnectingRef.current, 'selectedPc=', selectedPc?.id, 'isInitializing=', isInitializing);

    if (isConnectingRef.current) {
      console.log('[connect] BLOCKED by ref lock');
      logError({error: 'Connection attempt blocked' + new Date().toLocaleString(), type: 'Error'});
      return;
    }
    if (!selectedPc) {
      setStatus('Выбери ПК');
      logError({error: 'No PC selected for connection' + new Date().toLocaleString(), type: 'Error'});
      return;
    }
    if (isInitializing){
      setStatus('подождите немного')
      logError({error: 'Connection attempt blocked, still initializing' + new Date().toLocaleString(), type: 'Error'});
      return; 
    }

    isConnectingRef.current = true;
    console.log('[connect] STARTING flow for', selectedPc.id);
    setStatus('Подключаем...');
    logError({error: 'Attempting to connect to PC ID ' + selectedPc.id + ' at ' + new Date().toLocaleString(), type: 'Success'});
    setIsInitializing(true); 
    try {
      if (pcinfo?.pc) {
        console.log('[connect] disconnecting previous pc:', pcinfo.pc);
        await api.post('/api/v1/ssh/disconnect');
        await new Promise(r => setTimeout(r, 500));
        console.log('[connect] disconnect done');
        logError({error: 'Disconnected from PC after deletion:' + selectedPc.id + ' at ' + new Date().toLocaleString(), type: 'Success'});
      }
      const authPayload = {};
      const savedPassword = pcPasswords[selectedPc.id];
      if (savedPassword) {
        authPayload.password = savedPassword;
        console.log('[connect] using saved password');
      }
      await new Promise(r => setTimeout(r, 500));
      console.log('[connect] sending connect request...');
      logError({error: 'Sending connect request to PC ID ' + selectedPc.id + ' at ' + new Date().toLocaleString(), type: 'Success'});
      const response = await api.post(`/api/v1/ssh/connect/${selectedPc.id}`, authPayload);
      console.log('[connect] response status:', response.status, response.data);
      logError({error: 'Received response from connect request to PC ID ' + selectedPc.id + ' at ' + new Date().toLocaleString() + ', status: ' + response.status, type: 'Success'});
      if (response.status === 200) {
        setStatus('Подключение успешно');
        console.log('[connect] setPcInfo with', selectedPc.id);
        logError({error: 'Connection successful to PC ID ' + selectedPc.id + ' at ' + new Date().toLocaleString(), type: 'Success'});
        setPcInfo({ pc: selectedPc.alias || selectedPc.host, id: selectedPc.id, ...response.data });
        await new Promise(r => setTimeout(r, 500));
        console.log('[connect] navigating to /dashboard');
        logError({error: 'Navigating to /dashboard after successful connection to PC ID ' + selectedPc.id + ' at ' + new Date().toLocaleString(), type: 'Success'});
        navigate('/dashboard');
      }
    } catch (err) {
      console.log('[connect] ERROR CAUGHT:', err);
      setStatus(err.response?.data?.message || 'Ошибка при подключении');
      logError({
      error: 'failed to load  PC : ' + (err.response?.data?.message || err.message) + ' время: ' + new Date().toLocaleString()+'попробуйте подождать перед резким подключением',
      type: 'Error' 
});
setIsInitializing(false);
    } finally {
      isConnectingRef.current = false;
      console.log('[connect] flow finished, ref released');
      logError({error: 'Connection flow finished for PC ID ' + selectedPc?.id + ' at ' + new Date().toLocaleString(), type: 'Success'});
    }
  };

  const handleDelete = async () => {
    if (!selectedPc) return;
    try {
      if (pcPasswords[selectedPc.id]) {
        setPcPassword(selectedPc.id, undefined);
      }
      files.length = 0; // Очистка файлов при удалении ПК
      await api.delete(`/api/v1/pcs/${selectedPc.id}`);
      if (pcinfo.id === selectedPc.id) {
        await api.post('/api/v1/ssh/disconnect');
        setPcInfo({ pc: '', id: null, ping: '', storage: '' });
       console.log('Disconnected from PC after deletion:', selectedPc.id);
       logError({error: 'Disconnected from PC after deletion:' + selectedPc.id + ' at ' + new Date().toLocaleString(), type: 'Success'});
      }
      setSelectedPc(null);
      setStatus('ПК удалён');
      logError({error: 'PC deleted successfully: ' + selectedPc.id + ' at ' + new Date().toLocaleString(), type: 'Success'});
      await loadPcs();
    } catch (err) {
      console.error('Ошибка удаления ПК:', err.response?.data?.message || err.message);
      setStatus('Не удалось удалить ПК');
      logError({error: 'Failed to delete PC: ' + (err.response?.data?.message || err.message) + ' at ' + new Date().toLocaleString(), type: 'Error'});
    }
  };


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
          <Link to="/list" className="nav-item active">
            <span className="icon"><List size={32} color="gray" /></span>
            <m.span className="label"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              List
            </m.span>
          </Link>
          <Link to="/logs" className="nav-item">
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
            <span className="root">Added PCs</span>
          </div>
          <m.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6, ease: 'easeOut' }}>
            <m.button
              className="btn-primary"
              onClick={() => setOpen(true)}
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            >
              New Conection
            </m.button>
          </m.div>
        </header>
        {open && <NewConectionModal onClose={() => setOpen(false)} onAdd={loadPcs} />}

        <section className="file-section" style={{ margin: '40px', padding: '0' }}>
          <div className="file-section-header">
            <h2 className="section-title">Added PCs</h2>
          </div>

          {error && <div className="error-message">{error}</div>}

          {loading ? (
            <div className="empty-state">Loading...</div>
          ) : pcs.length === 0 ? (
            <div className="empty-state">No added PCs yet. Click "New Connection" to add one.</div>
          ) : (
            <m.div className="file-grid" variants={containerVariants} initial="hidden" animate="visible">
              {pcs.map((pc) => (
                <m.div
                  key={pc.id}
                  className={`file-item pc-card ${selectedPc?.id === pc.id ? 'active' : ''}`}
                  onClick={() => handleSelectPc(pc)}
                  variants={itemVariants}
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <h3>{pc.alias}</h3>
                  <p>{pc.host}:{pc.port}</p>
                  <p>{pc.username}</p>
                </m.div>
              ))}
            </m.div>
          )}

          {selectedPc && (
            <m.div
              className="card pc-detail-card"
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.1 }}
              style={{ marginTop: '24px' }}
            >
              <h2>Данные ПК</h2>
              <p><strong>Alias:</strong> {selectedPc.alias}</p>
              <p><strong>Host:</strong> {selectedPc.host}</p>
              <p><strong>Port:</strong> {selectedPc.port}</p>
              <p><strong>Username:</strong> {selectedPc.username}</p>

              <div className="detail-actions">
                <m.button className="btn-primary" onClick={handleConnect} disabled={isInitializing || !selectedPc}  whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} style={{ marginRight: '20px' }}>
                  <ArrowRight size={16} style={{ marginRight: '8px' }} />
                  connect
                </m.button>
                <m.button className="deletebutton" 
                onClick={handleDelete}
                initial={{ opacity: 0 ,x:50 ,pointerEvents: 'none'  }} 
                animate={{ opacity: 1 ,x:-50, pointerEvents: 'auto'}}
                transition={{ delay: 2 }}
               >
                  <Trash2 size={16} style={{ marginRight: '8px' }} />
                  delete
                </m.button>
              </div>
              {status && <div style={{ marginTop: '16px', color: '#cbd5e1' }}>{status}</div>}
            </m.div>
          )}
        </section>
      </main>
    </div>
  );
};

export default PcList;