import React from 'react';
import { useState } from 'react';
import api from './axiosapi/api';
import './styles/Register.css';
import { m } from 'framer-motion'; 
import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom'; 
import LoginForm from './Login'
import Dashboard from './Dashboard'
import PcList from './PcList'
import Errorpage from './Errorpage'
import Settings from './Settings'
import Logs from './Logs'

//защита маршрутов от неавторизованных пользователей добавлена
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

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

const RegisterForm = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    

 const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try{
      await api.post('/api/v1/auth/register',{ username, password });
      navigate('/login');
    }catch(err){
      console.error('Ошибка при регистрации:', err);
    // оброботка ошибок по статусу 
      if (err.response?.status) {
                const status = err.response.status;

                switch (status) {
                    case 400:
                        setError('username is already registered');
                        break;
                        default:
                        setError(`Произошла ошибка. Статус: ${status}`);
                }
            } else {
              setError('🔌 Нет связи с сервером');

            }
    }
  }
  



 

  return (
    <div className="page-wrapper">
      <m.div 
        className="main-container"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="form-section">
          <div className="form-content">
            <m.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
              Регистрация
            </m.h2>
            <m.p className="subtitle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
              Создайте новый аккаунт
            </m.p>
            
            <m.form  
              onSubmit={handleSubmit}
              initial="hidden"
              animate="visible"
              transition={{ staggerChildren: 0.1, delayChildren: 0.5 }}
            >
              <m.div className="input-group" variants={itemVariants}>
                <label htmlFor="register-username">Имя пользователя</label>
                <input 
                type="text" 
                value={username}
                id="register-username"
                placeholder="Введите никнейм" 
                onChange={(e) => setUsername(e.target.value)}// при нажатии записываем никнейм в состояние
                />
                              
              </m.div>
              
              <m.div className="input-group" variants={itemVariants}>
                <label htmlFor="register-confirm-password">Пароль</label>
                <input type="password" 
                value={password}
                id="register-confirm-password"
                onChange={(e) => setPassword(e.target.value)} // Связываем с сост.
                placeholder="••••••••" />
              </m.div>
              {error && <m.div className="error-message" initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} transition={{ delay: 0.4 }}>{error}</m.div>}
              <m.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit" 
                className="register-btn"
                variants={itemVariants}
              >
                Продолжить
              </m.button>
            </m.form>
            
            <m.div 
              className="footer-text"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              Уже есть профиль? <Link to="/login">Войти</Link> {/* Используем Link вместо <a> */}
            </m.div>
          </div>
        </div>

        <m.div 
          className="info-section"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="overlay"></div>
          <div className="info-content">
            <m.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              Добро пожаловать
            </m.h1>
            <m.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
              Станьте частью нашего сообщества и начните работу в удобной и современной среде.<br/>
              всего в пару кликов
            </m.p>
          </div>
        </m.div>
      </m.div>
    </div>
  );
};

// 2. Основной компонент Register, который управляет путями
const Register = () => {
  return (
    <Routes>
      <Route path="/" element={<RegisterForm />} />
      <Route path="/Login" element={<LoginForm />}/>
      <Route path="/logs" element={<ProtectedRoute><Logs /></ProtectedRoute>}/>
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>}/>
      <Route path="/list" element={<ProtectedRoute><PcList /></ProtectedRoute>}/>
      <Route path='/dashboard' element={<ProtectedRoute><Dashboard /></ProtectedRoute>}/>
      <Route path="*" element={<Errorpage/>}/>
      {/* роуты с защитой для прода */}
    </Routes>
    //  <Routes>
    //   <Route path="/" element={<RegisterForm />} />
    //   <Route path="/Login" element={<LoginForm />}/>
    //   <Route path="/logs" element={<Logs />}/>
    //   <Route path="/settings" element={<Settings />}/>
    //   <Route path="/list" element={<PcList />}/>
    //   <Route path='/dashboard' element={<Dashboard />}/>
    //   <Route path="*" element={<Errorpage/>}/>
    //   {/*роуты без для тестов */}
    // </Routes>
    
  );
};

export default Register;