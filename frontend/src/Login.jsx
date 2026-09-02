import React, { useState } from 'react'; 
import { m } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom'; 
import './styles/Register.css';
import api from './axiosapi/api';
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
const LoginForm = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
   const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handlelogin = async (e) =>{
     e.preventDefault();
   try {
    const { data } = await api.post('/api/v1/auth/login', formData);
    if (data.token) { 
      localStorage.setItem('access_token', data.token)
      navigate('/dashboard');
    }
     else{
        console.log('не пришел токен от серввера')
      }
    }catch(err){
      console.log('Ошибка логина:', err.response?.data?.message || err.message);
      //обработка ошибок по статусу 
      if (err.response?.status) {
                const status = err.response.status; 
                switch (status) {
                    case 401:
                        setError('Неверные учетные данные');
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
              Вход
            </m.h2>
            
            <m.form 
              onSubmit={handlelogin} 
              initial="hidden"
              animate="visible"
              transition={{ staggerChildren: 0.1, delayChildren: 0.5 }}
            >
              <m.div className="input-group" variants={itemVariants}>
                <label htmlFor="login-username">Имя пользователя</label>
                <input 
                  type="text" 
                  id="login-username"
                  placeholder="Введите никнейм"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})} 
                  required
                  autoComplete="username"
                />
              </m.div>
              
              <m.div className="input-group" variants={itemVariants}>
                <label htmlFor="login-password">Пароль</label>
                <input 
                  type="password" 
                  id="login-password"
                  placeholder="••••••••" 
                  value={formData.password} 
                  onChange={(e) => setFormData({...formData, password: e.target.value})} // Исправлено
                  required
                  autoComplete="current-password"
                />
              </m.div>
              {error && <m.div className="error-message" initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} transition={{ delay: 0.4 }}>{error}</m.div>}
              <m.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit" 
                className="register-btn"
              >
                Войти
              </m.button>
            </m.form>
            
            <m.div className="footer-text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
              Нет аккаунта? 
              <Link to="/" style={{ margin: '0 0 0 5px' }}>Создать профиль</Link>
            </m.div>
          </div>
        </div>

        <m.div className="info-section" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
          <div className="overlay"></div>
          <div className="info-content">
            <h1>С возвращением!</h1>
            <p>Рады видеть вас снова.</p>
          </div>
        </m.div>
      </m.div>
    </div>
  );
};

export default LoginForm;