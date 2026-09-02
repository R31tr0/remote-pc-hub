import React from "react";
import './styles/ErrorPage.css';
import { m } from 'framer-motion'; 
import { Link, useNavigate } from 'react-router-dom'; 
 const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };
const Errorpage = () =>{
  const navigate = useNavigate();
return (
 <div className="background">
  <m.div
className="main-container"
initial="hidden"
animate="visible"
  variants={containerVariants}
  >
      <div className="erroritem">
  <m.h1 
    initial={{ opacity: 0,y:50 }} 
    animate={{ opacity: 1,y:0 }} 
    transition={{ delay: 0.3 }}
    style={{ fontSize: '5rem', margin: 0 }}
  >
    4
  </m.h1>

  <m.h1 
    initial={{ opacity: 0,y:-50 }} 
    animate={{ opacity: 1,y:0 }} 
    transition={{ delay: 0.5 }} // +0.2 сек
    style={{ fontSize: '5rem', margin: 0 }}
  >
    0
  </m.h1>

  <m.h1 
    initial={{ opacity: 0,y:50 }} 
    animate={{ opacity: 1,y:0 }} 
    transition={{ delay: 0.7 }} // +0.2 сек
    style={{ fontSize: '5rem', margin: 0 }}
  >
    4
  </m.h1>
  </div>
    <m.p className="text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
      Кажется, этой страницы не существует
     </m.p>
      <button 
      type="button"
      className="button"
        onClick={(e) => {
          e.preventDefault();
          navigate('/Login');
        }}
        style={{ color: '#ffffff', marginTop: '20px', textDecoration: 'none', zIndex: 10 }}
      >
        Вернуться на главную
      </button>
      </m.div>
    </div>
  );
}
export default  Errorpage