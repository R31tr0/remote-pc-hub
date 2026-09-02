import { m, AnimatePresence } from 'framer-motion';
import React, { useState } from "react";
import "../styles/addmodal.css";
import api from '../axiosapi/api';
import { useStore } from '../store';

 const containerVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.95 
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        staggerChildren: 0.05, 
        ease: "easeOut", 
        duration: 0.25 
      } 
    }
  };

  const fieldVariants = {
    hidden: { x: -10, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.25 } }
  };


  
const NewConectionModal = ({ onClose, onAdd, filesonadd }) => {
  const setPcInfo = useStore((state) => state.setPcInfo);
  const [error, setError] = useState('');
  const setPcPassword = useStore((state) => state.setPcPassword);
  // Переключатель режима: 'save' (С сохранением) или 'direct' (Напрямую)
  const [mode, setMode] = useState('save'); 

   const savedHost = useStore((state) => state.host);
  const savedPort = useStore((state) => state.port);
  const savedUsername = useStore((state) => state.username);

  const [pcdata, setpcdata] = useState({
    alias: '',
    host: savedHost || '',
    port: savedPort || '',
    username: savedUsername || '',
    password: '',
    privateKey: ''
  });
  const logError = useStore((state) => state.logError);
  const handleConnect = async () => {
    setError('');

    // Общая валидация для обоих режимов
    if (!pcdata.host.trim() || !pcdata.username.trim()) {
      setError('Заполните обязательные поля: Хост и Пользователь');
      logError({
        error: 'Validation error: Host and Username are required. время: ' + new Date().toLocaleString(),
        type: 'Error'
      })
      return;
    }

    //  РЕЖИМ 1: СОХРАНЕНИЕ + ПОДКЛЮЧЕНИЕ
    if (mode === 'save') {
      if (!pcdata.alias.trim()) {
        setError(' Введите название ПК для сохранения в базу');
        logError({
          error: 'Validation error: Alias is required for save mode. время: ' + new Date().toLocaleString(),
          type: 'Error'
        });
        return;
      }

      try {
        const payload = {
          alias: pcdata.alias.trim(),
          host: pcdata.host.trim(),
          port: Number(pcdata.port) || 22,
          username: pcdata.username.trim(),
        };

        if (pcdata.password.trim()) payload.password = pcdata.password;
        if (pcdata.privateKey.trim()) payload.privateKey = pcdata.privateKey.trim();

        const response = await api.post('/api/v1/pcs', payload);
        if (response.status === 201 && response.data?.id) {
          if (pcdata.password.trim()) {
           setPcPassword(response.data.id, pcdata.password.trim());
          }
          console.log('ПК успешно добавлен в базу:', response.data);
          logError({error: 'PC added successfully to database: ' + response.data.id + ' at ' + new Date().toLocaleString(), type: 'Success'});
          setPcInfo({
            pc: response.data.alias || pcdata.alias,
            id: response.data.id,
            ping: '—',
            storage: '—',
          });

          // Сразу дергаем SSH по ID
          try {
            const authPayload = {};
            if (pcdata.password.trim()) authPayload.password = pcdata.password;
            if (pcdata.privateKey.trim()) authPayload.privateKey = pcdata.privateKey.trim();

            const connRes = await api.post(`/api/v1/ssh/connect/${response.data.id}`, authPayload);
            if (connRes.status === 200){ 
              logError({
                error: `SSH connection established for PC ID ${response.data.id} at ${new Date().toLocaleString()}`,
                type: 'Success'
              });
              console.log('SSH подключение успешно');
              if (typeof filesonadd === 'function') {
              await filesonadd('.'); 
        }
            }
            } catch (sshErr) {
            setError(sshErr.response?.data?.message || 'Компьютер сохранен, но SSH-соединение отклонено');
            logError({
              error: `pc was saved but ssh conection losts ${response.data.id}: ${sshErr.response?.data?.message || sshErr.message} время: ${new Date().toLocaleString()}`,
              type: 'Bug'
            });
            return;
          }

          onClose();
          if (typeof onAdd === 'function') await onAdd();
        }
      } catch (err) {
        handleError(err);
      }
    } 
    
    //  ПРЯМОЕ ПОДКЛЮЧЕНИЕ
    else {
      if (!pcdata.password.trim()) {
        setError(' Для прямого подключения требуется ввести пароль');
        logError({
          error: 'Validation error: Password is required for direct mode. время: ' + new Date().toLocaleString(),
          type: 'Error'
        });
        return;
      }

      try {
        const directPayload = {
          host: pcdata.host.trim(),
          port: Number(pcdata.port) || 22,
          username: pcdata.username.trim(),
          password: pcdata.password,
        };

        const response = await api.post('/api/v1/ssh/connect/direct', directPayload);

        if (response.status === 200) {
          console.log('Прямое SSH подключение успешно:', response.data.message);
          logError({error:' Direct SSH connection established at ' + new Date().toLocaleString(), type: 'Success'});
           if (typeof filesonadd === 'function') {
              await filesonadd('.'); 
        }
          // Записываем в стор временные данные, так как ID от базы нет
          setPcInfo({
            pc: `Direct: ${pcdata.host}`,
            id: null, 
            ping: '—',
            storage: '—',
          });

          onClose();
          if (typeof onAdd === 'function') await onAdd();
        }
      } catch (err) {
        handleError(err);
        logError({error: `Direct SSH connection failed: ${err.response?.data?.message || err.message} at ${new Date().toLocaleString()}`, type: 'Error'});
      }
    }
  };

  //  обработчик ошибок
  const handleError = (err) => {
    const message = err.response?.data?.message || err.message || 'Неизвестная ошибка';
    console.error('Ошибка сессии:', message);
    logError({error:'Session error: ' + message + ' at ' + new Date().toLocaleString(), type: 'Error'});

    if (err.response?.status) {
      const status = err.response.status;
      if (status === 400) {
        setError('Не удалось подключиться. Проверьте сетевые данные.');
        logError({
          error: `Ошибка 400: ${message} время: ${new Date().toLocaleString()}`,
          type: 'Error'
        });
      } else if (status === 401) {
        setError('Ошибка авторизации.');
        logError({
          error: `Ошибка 401: ${message} время: ${new Date().toLocaleString()}`,
          type: 'Error'
        });
      } else {
        setError(`Ошибка сервера. Статус: ${status}`);
        logError({
          error: `Ошибка сервера ${status}: ${message} время: ${new Date().toLocaleString()}`,
          type: 'Error'
        });
      }
    } else {
      setError('🔌 Нет связи с сервером');
      logError({
        error: ` Server Network error: ${message} время: ${new Date().toLocaleString()}`,
        type: 'Error'
      });
    }
  };




  return (
    <m.div className="ModalMain" initial="hidden" animate="visible" variants={containerVariants}>
      <div className="close-button">
        <m.span whileHover={{ scale: 1.2, color: '#ff0055' }} className="closebutton" onClick={onClose}>X</m.span> 
      </div>
      
      <div className="input-fields">
        
        {/*  РЕЖИМЫ */}
        <div style={{ display: 'flex', marginBottom: '20px', background: 'rgba(139, 92, 246, 0.1)', padding: '4px', borderRadius: '8px', border: '1px solid var(--accent-purple)' }}>
          <button 
            type="button"
            onClick={() => setMode('save')}
            style={{ flex: 1, padding: '8px', background: mode === 'save' ? 'var(--accent-purple)' : 'transparent', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', transition: '0.2s', fontFamily: 'monospace', fontSize: '12px' }}
          >
            С сохранением
          </button>
          <button 
            type="button"
            onClick={() => setMode('direct')}
            style={{ flex: 1, padding: '8px', background: mode === 'direct' ? 'var(--accent-purple)' : 'transparent', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', transition: '0.2s', fontFamily: 'monospace', fontSize: '12px' }}
          >
            Напрямую (Direct)
          </button>
        </div>

        {/* ДИНАМИЧЕСКИЕ ИНПУТЫ */}
        <AnimatePresence mode="wait">
          {mode === 'save' && (
            <m.input 
              key="alias-input"
              type="text" 
              variants={fieldVariants}
              initial="hidden" animate="visible" exit="hidden"
              placeholder="Название ПК" 
              className="custom-select" 
              value={pcdata.alias} 
              onChange={(e) => setpcdata({...pcdata, alias: e.target.value})} 
              style={{width: '100%', border: '1px solid var(--accent-purple)', marginBottom: '10px'}} 
            />
          )}
        </AnimatePresence>

        <m.input type="text" variants={fieldVariants} placeholder="IP Хоста (192.168.1.100)" className="custom-select" value={pcdata.host} onChange={(e) => setpcdata({...pcdata, host: e.target.value})} style={{width: '100%', border: '1px solid var(--accent-purple)'}} />
        <m.input type="text" variants={fieldVariants} placeholder="Порт (22)" className="custom-select" value={pcdata.port} onChange={(e) => setpcdata({...pcdata, port: e.target.value})} style={{width: '100%', border: '1px solid var(--accent-purple)'}} />
        <m.input type="text" variants={fieldVariants} placeholder="Имя пользователя (user)" className="custom-select" value={pcdata.username} onChange={(e) => setpcdata({...pcdata, username: e.target.value})} style={{width: '100%', border: '1px solid var(--accent-purple)'}} />
          <m.input type="password" variants={fieldVariants} placeholder={mode === 'direct' ? "Пароль (обязательно)" : "Пароль (опционально)"} className="custom-select" value={pcdata.password} onChange={(e) => setpcdata({...pcdata, password: e.target.value})} style={{width: '100%', border: '1px solid var(--accent-purple)'}} />
          
        <AnimatePresence mode="wait">
          {mode === 'save' && (
            <m.textarea 
              key="key-input"
              variants={fieldVariants} 
              initial="hidden" animate="visible" exit="hidden"
              placeholder="--BEGIN RSA PRIVATE KEY-- (опционально)" 
              className="custom-select" 
              value={pcdata.privateKey} 
              onChange={(e) => setpcdata({...pcdata, privateKey: e.target.value})} 
              style={{width: '100%', minHeight: '100px', border: '1px solid var(--accent-purple)', marginBottom: '10px'}} 
            />
          )}
        </AnimatePresence>
        
        {error && (
          <m.div className="error-message" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            {error}
          </m.div>
        )}

        <div className="Button">
          <m.button 
            type="button"
            variants={fieldVariants}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="addbutton" 
            onClick={handleConnect}
            style={{ cursor: 'pointer', border: 'none', background: 'none' }}
          >
            {mode === 'save' ? 'add & connect' : 'direct connect'}
          </m.button> 
        </div>
      </div>
    </m.div>
  );
};

export default NewConectionModal;