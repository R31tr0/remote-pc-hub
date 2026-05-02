import React from 'react';
import { useState } from 'react';
import api from './axiosapi/api';
import './styles/Register.css';
import { motion } from 'framer-motion'; 
import { Routes, Route, Link } from 'react-router-dom'; 
import LoginForm from './Login'
import Dashboard from './Dashboard'
import Errorpage from './Errorpage'
const RegisterForm = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    
    const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

 const handleSubmit = async (e) => {
    e.preventDefault();
    try{
      const response = await api.post('localhost/api/v1/auth',{ username, password })
        if (response.data.accessToken) {
          localStorage.setItem('access_token',data.accessToke)
          navigate('/dashboard'); 
    }
    }catch(err){
      console.error('Ошибка при регистрации:', err);

    }
  }
  



  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <div className="page-wrapper">
      <motion.div 
        className="main-container"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="form-section">
          <div className="form-content">
            <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
              Регистрация
            </motion.h2>
            <motion.p className="subtitle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
              Создайте новый аккаунт
            </motion.p>
            
            <motion.form  
              onSubmit={handleSubmit}
              initial="hidden"
              animate="visible"
              transition={{ staggerChildren: 0.1, delayChildren: 0.5 }}
            >
              <motion.div className="input-group" variants={itemVariants}>
                <label>Имя пользователя</label>
                <input 
                type="text" 
                value={username}
                placeholder="Введите никнейм" 
                onChange={(e) => setUsername(e.target.value)}// при нажатии записываем никнейм в состояние
                />
                              
              </motion.div>
              
              <motion.div className="input-group" variants={itemVariants}>
                <label>Пароль</label>
                <input type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)} // Связываем с сост.
                placeholder="••••••••" />
              </motion.div>
              
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit" 
                className="register-btn"
              >
                Продолжить
              </motion.button>
            </motion.form>
            
            <motion.div 
              className="footer-text"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              Уже есть профиль? <Link to="/login">Войти</Link> {/* Используем Link вместо <a> */}
            </motion.div>
          </div>
        </div>

        <motion.div 
          className="info-section"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="overlay"></div>
          <div className="info-content">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              Добро пожаловать
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
              Станьте частью нашего сообщества и начните работу в удобной и современной среде.<br/>
              всего в пару кликов
            </motion.p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

// 2. Основной компонент Register, который управляет путями
const Register = () => {
  return (
    <Routes>
      <Route path="/" element={<RegisterForm />} />
      <Route path="/Login" element={<LoginForm />}/>
      <Route path='/dashboard' element={<Dashboard />}/>
      <Route path="*" element={<Errorpage/>}/>
      {/* Здесь можно будет добавить Route для /login */}
    </Routes>
  );
};

export default Register;