import React, { useState,useEffect } from 'react';
import './styles/Dashboard.css'
import { Settings, Monitor, RefreshCw ,Upload} from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from './store';
import NewConectionModal from './components/NewConectionModal';
const Dashboard = () => {

//память о текущем пк
  const pcinfo = useStore((state) => state.pcinfo);
//память о текущем пк


  // Состояние для чего либо
const [activeMachine, setActiveMachine] = useState(null);
const [ping, setPing] = useState(null);
const [storage, setStorage] = useState(null);
const [Files,setfiles] = useState(null);
const [open, setOpen] = useState(false);
const handleClose = () => setOpen(false);
//
//анимации
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



//функции кнопок 

const addsubmit = () =>{
setOpen(true);
}



//ПЛКА ЧТО КАЖДАЯ ИНФОРМАЦИЯ ЬЕРЕТССЯ С ОТДЕЛЬНОГО ЕНДПОИНТА ЭТО НЕ ЕСТЬ ХОРОШО НО Я НЕ ЗНАЮ КАК У НАС БУДЕТ РАБОТАТЬ ЛОГИКА 
// ВОЗМОЖНО ТАК КАК ЩАС А ВОЗМОЖНО БУДУТ ПРИХОДИТЬ ДАННЫЕ О ПК В 1 ЕНДПОИНТЕ КОТОРЫЙ Я БУДУ ПОЛУЧАТЬ ПОСЛЕ УСПЕШНОГО ДОБАВЛЕНИЯ МАШИНЫ 
//В NEW CONECTION MODAL

//исправил теперь все данные летт из памти которая подтягивается по одному ендпоинту с данными о всем пк с модалки 
//использую бибилиотеку цуштанд для глобальной памяти 


//блок работы с сервером
//все файлы системы 
const allfiles = async () =>{
      setfiles(pcinfo.files);
}

// 1. Функция выбора ПК
const selectMachine = async () => {
      setActiveMachine(pcinfo.pc); // Вызываем функцию и передаем данные
};

// 2. Функция замера пинга
const fetchPing = async () => {
      setPing(pcinfo.ping); // Обновляем состояние пинга
};
//3. функция памяти 

const pcstorage = async()=>{
  setStorage(pcinfo.storage)
}
//блок работы с сервером (все это + все функции запросы к серверу планируется вынести в хук)

  return (

    
    <div className="dashboard-container">
      {/* ЛЕВАЯ ПАНЕЛЬ (NAV) */}
      <motion.aside 
      className="sidebar"
      initial={{ opacity: 0, x: -20 }} 
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="logo">
        <div className="logo-icon"></div>
        <span className="logo-text">zalupa228</span>
      </div>

      <nav className="nav-menu">
        <div className="nav-item active">
          <span className="icon"><Monitor size={32} color="gray" /></span>
          <motion.span className="label"
          initial={{ opacity: 0, x: -20 }} 
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6}}
          >Machines</motion.span>
        </div>
        <div className="nav-item">
          <span className="icon"><RefreshCw size={32} color="gray" /></span>
          <motion.span className="label"
           initial={{ opacity: 0, x: -20 }} 
           animate={{ opacity: 1, x: 0 }}
           transition={{ delay: 0.7}}
           >logs</motion.span>
        </div>
        <div className="nav-item">
          <span className="icon"><Settings size={32} color="gray" /></span>
          <motion.span className="label"
           initial={{ opacity: 0, x: -20 }} 
           animate={{ opacity: 1, x: 0 }}
           transition={{ delay: 0.8}}
          >Settings</motion.span>
        </div>
      </nav>

      <div className="connection-status">
        <span className="status-dot"></span>
        Connected
      </div>
    </motion.aside>
      {/* ОСНОВНОЙ КОНТЕНТ */}
      <main className="main-content">
        
        {/* ВЕРХНЯЯ ПАНЕЛЬ */}
        <header className="top-bar">
          <div className="path-display">
            <span className="root">{activeMachine}</span>
            <span className="separator">/</span>
            
          </div>
          <div className="header-actions">
          
            <button className="btn-primary" onClick={addsubmit} >New Connection</button>
              {open && <NewConectionModal onClose={handleClose}/>}
         </div>
        </header>

        {/* РАБОЧАЯ ОБЛАСТЬ */}
        <div className="scroll-area">
          
          {/* СЕКЦИЯ С ВИДЖЕТАМИ (BENTO) */}
          <section className="stats-grid">
            <div className="card stat-card">
              <span className="card-label">Latency</span>
              <div className="card-value">{ping}</div>
            </div>
            <div className="card stat-card">
              <span className="card-label">storage</span>
              <div className="card-value">{storage}</div>
            </div>
            <div className="card drop-zone">
              <Upload size={48} className="upload-icon" />
            </div>
          </section>

          {/* ФАЙЛОВЫЙ МЕНЕДЖЕР */}
         <section className="file-section">
  <h2 className="section-title">Your Files:</h2>

  <div className="options-container">
    <label htmlFor="choices" className="options-label">display:</label>
    <div className="select-wrapper">
      <select id="choices" name="options" className="custom-select">
        <option value="1">folders</option>
        <option value="2">tree</option>
      </select>
    </div>
  </div>
</section>

        </div>
      </main>
    </div>
  );
   <Routes>
      <Route path="/" element={<RegisterForm />} />
      <Route path="/Login" element={<LoginForm />}/>
      <Route path='/dashboard' element={<Dashboard />}/>
      <Route path="*" element={<Errorpage/>}/>
      <Route path="/settings" element= {<Settings/>}/>
      <Route path="/Machines" element= {<Machines/>}/>
      
      {/* Здесь можно будет добавить Route для /login */}
    </Routes>
};

export default Dashboard;