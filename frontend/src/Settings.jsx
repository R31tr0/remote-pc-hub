import React, { useState,useEffect } from 'react';
import { m } from 'framer-motion';
import { Link } from 'react-router-dom';
import './styles/settings.css'
import { Settings, Monitor, RefreshCw, Upload, List, Bug } from 'lucide-react';
import { useStore, DEFAULT_COLOR } from './store';

const colors = ['#8b5cf6', '#3b82f6', '#ec4899', '#10b981'];

const Settingspage = () => {
  const [activeTab, setActiveTab] = useState('connection');
  const [status,setstatus] = useState(false)
  const { accentColor, applyAccentColor, resetAccentColor,saveConnectionSettings,files } = useStore();

  
  const [draft, setDraft] = useState({
    host: '',
    port: '',
    username: '',
    sshKeyPath: '',
    autoConnect: true,
    accentColor,
    pollInterval: 2000,
  });

  
    useEffect(() => {
  if (files.length > 0) {
    setstatus(true);
  } else {
    setstatus(false);
  }
}, [files]); // Зависимость обязательна!
  

  const updateDraft = (field, value) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  // Живое превью цвета сразу при клике, но без сохранения в стор
  const previewColor = (color) => {
    updateDraft('accentColor', color);
    document.documentElement.style.setProperty('--accent-purple', color);
  };

  const handleSave = () => {
    applyAccentColor(draft.accentColor);
    saveConnectionSettings({
    host: draft.host,
    port: draft.port,
    username: draft.username,
    sshKeyPath: draft.sshKeyPath,
    autoConnect: draft.autoConnect,
  });
  };

  const handleReset = () => {
    setDraft((prev) => ({ ...prev, accentColor: DEFAULT_COLOR }));
    resetAccentColor();
    saveConnectionSettings({
    host: '',
    port: '',
    username: '',
    sshKeyPath: draft.sshKeyPath,
    autoConnect: draft.autoConnect,
  });
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
            <m.span className="label" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
              Dashboard
            </m.span>
          </Link>
          <Link to="/list" className="nav-item">
            <span className="icon"><List size={32} color="gray" /></span>
            <m.span className="label" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }}>
              List
            </m.span>
          </Link>
          <Link to="/logs" className="nav-item">
            <span className="icon"><RefreshCw size={32} color="gray" /></span>
            <m.span className="label" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }}>
              Logs
            </m.span>
          </Link>
          <Link to="/settings" className="nav-item active">
            <span className="icon"><Settings size={32} color="gray" /></span>
            <m.span className="label" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.9 }}>
              Settings
            </m.span>
          </Link>
        </nav>
      </m.aside>

      <main className="main-content" style={{ padding: '40px' }}>
        <header className="top-bar" style={{ justifyContent: 'space-between' }}>
          <div>
            <span className="separator">/ </span>
            <span className="root">settings</span>
          </div>
        </header>

        <div className="options-wrapper">
          <div className="options-containeer nav-panel">
            <h2 className="panel-title">Настройки</h2>

            <nav className="settings-nav">
              <button className={`nav-item ${activeTab === 'connection' ? 'active' : ''}`} onClick={() => setActiveTab('connection')}>
                <span className="nav-icon"></span>
                <span>conection</span>
              </button>
              <button className={`nav-item ${activeTab === 'visual' ? 'active' : ''}`} onClick={() => setActiveTab('visual')}>
                <span className="nav-icon"></span>
                <span>visual</span>
              </button>
              <button className={`nav-item ${activeTab === 'monitoring' ? 'active' : ''}`} onClick={() => setActiveTab('monitoring')}>
                <span className="nav-icon"></span>
                <span>metrics</span>
              </button>
            </nav>

           <div className={`status-badge ${status ? 'connected' : 'disconnected'}`}>
  <span className={`status-dot ${status ? 'active' : 'inactive'}`}></span>
  SSH: {status ? 'Подключено' : 'Не подключено'}
</div>

          </div>

          <div className="options-containeer options-containeer--wide content-panel">

            {activeTab === 'connection' && (
              <section className="settings-section">
                <h3 className="section-title">Параметры SSH</h3>

                <div className="form-row">
                  <div className="form-group flex-3">
                    <label>Хост / IP-адрес</label>
                    <input
                      type="text"
                      className="input-field"
                      value={draft.host}
                      onChange={(e) => updateDraft('host', e.target.value)}
                      placeholder="127.0.0.1"
                    />
                  </div>
                  <div className="form-group flex-1">
                    <label>Порт</label>
                    <input
                      type="text"
                      className="input-field"
                      value={draft.port}
                      onChange={(e) => updateDraft('port', e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Пользователь</label>
                  <input
                    type="text"
                    className="input-field"
                    value={draft.username}
                    onChange={(e) => updateDraft('username', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Путь к SSH-ключу</label>
                  <input
                    type="text"
                    className="input-field"
                    value={draft.sshKeyPath}
                    onChange={(e) => updateDraft('sshKeyPath', e.target.value)}
                    placeholder="скоро"
                  />
                </div>

                <div className="toggle-row">
                  <div>
                    <div className="toggle-title">Автоматическое подключение</div>
                    <div className="toggle-desc">Подключаться к серверу сразу при запуске hub</div>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={draft.autoConnect}
                      onChange={(e) => updateDraft('autoConnect', e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </section>
            )}

            {activeTab === 'visual' && (
              <section className="settings-section">
                <h3 className="section-title">Внешний вид</h3>

                <div className="form-group">
                  <label>Акцентный цвет</label>
                  <div className="color-picker">
                    {colors.map((color) => (
                      <button
                        key={color}
                        className={`color-btn ${draft.accentColor === color ? 'active' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => previewColor(color)}
                      />
                    ))}
                  </div>
                </div>
              </section>
            )}

            {activeTab === 'monitoring' && (
              <section className="settings-section">
                <h3 className="section-title">Интервалы опроса</h3>
                <div className="form-group">
                  <label>Частота обновления метрик (мс)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={draft.pollInterval}
                    onChange={(e) => updateDraft('pollInterval', Number(e.target.value))}
                  />
                </div>
              </section>
            )}

            <div className="actions-bar">
              <button className="btn btn-secondary" onClick={handleReset}>Сбросить</button>
              <button className="btn btn-primary" onClick={handleSave}>Сохранить изменения</button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default Settingspage;