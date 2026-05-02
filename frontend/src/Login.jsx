import React, { useState } from 'react'; 
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom'; 
import './styles/Register.css';
import api from './axiosapi/api';

const LoginForm = () => {
  const navigate = useNavigate();

   const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handlelogin = async (e) =>{
     e.preventDefault();
   try {
    const { data } = await api.post('/api/v1/login', formData);
    if (data.success || data.accessToken) { 
      localStorage.setItem('access_token',data.accessToken)
      navigate('/dashboard');
    }
     else{
        console.log('не пришел токен от серввера')
      }
    }catch(err){
      console.log('Ошибка логина:', err.response?.data?.message || err.message);
    }
  }

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
              Вход
            </motion.h2>
            
            <motion.form 
              onSubmit={handlelogin} 
              initial="hidden"
              animate="visible"
              transition={{ staggerChildren: 0.1, delayChildren: 0.5 }}
            >
              <motion.div className="input-group" variants={itemVariants}>
                <label>Имя пользователя</label>
                <input 
                  type="text" 
                  placeholder="Введите никнейм"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})} 
                  required
                />
              </motion.div>
              
              <motion.div className="input-group" variants={itemVariants}>
                <label>Пароль</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={formData.password} 
                  onChange={(e) => setFormData({...formData, password: e.target.value})} // Исправлено
                  required
                />
              </motion.div>
              
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit" 
                className="register-btn"
              >
                Войти
              </motion.button>
            </motion.form>
            
            <motion.div className="footer-text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
              Нет аккаунта? 
              <Link to="/">Создать профиль</Link>
            </motion.div>
          </div>
        </div>

        <motion.div className="info-section" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
          <div className="overlay"></div>
          <div className="info-content">
            <h1>С возвращением!</h1>
            <p>Рады видеть вас снова.</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginForm;