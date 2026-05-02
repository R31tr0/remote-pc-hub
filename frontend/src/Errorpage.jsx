import React from "react";
import './styles/ErrorPage.css';
import { motion } from 'framer-motion'; 
const Errorpage = () =>{
    const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };
return (
 <div className="background">
  <motion.div
className="main-container"
initial="hidden"
animate="visible"
  variants={containerVariants}
  >
      <div className="erroritem">
  <motion.h1 
    initial={{ opacity: 0,y:50 }} 
    animate={{ opacity: 1,y:0 }} 
    transition={{ delay: 0.3 }}
    style={{ fontSize: '5rem', margin: 0 }}
  >
    4
  </motion.h1>

  <motion.h1 
    initial={{ opacity: 0,y:-50 }} 
    animate={{ opacity: 1,y:0 }} 
    transition={{ delay: 0.5 }} // +0.2 сек
    style={{ fontSize: '5rem', margin: 0 }}
  >
    0
  </motion.h1>

  <motion.h1 
    initial={{ opacity: 0,y:50 }} 
    animate={{ opacity: 1,y:0 }} 
    transition={{ delay: 0.7 }} // +0.2 сек
    style={{ fontSize: '5rem', margin: 0 }}
  >
    4
  </motion.h1>
  </div>
    <motion.p className="text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
      Кажется, этой страницы не существует
     </motion.p>
      <a 
      className="button"
        href="/" 
        onClick={(e) => {
          e.preventDefault();
          window.history.pushState({}, '', '/');
          window.dispatchEvent(new PopStateEvent('popstate'));
        }}
        style={{ color: '#000000', marginTop: '20px', textDecoration: 'none'}}
      >
        Вернуться на главную
      </a>
      </motion.div>
    </div>
  );
}
export default  Errorpage