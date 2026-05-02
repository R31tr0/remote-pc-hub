import { motion } from 'framer-motion';
import React from "react";
import "../styles/addmodal.css"
import api from '../axiosapi/api';
import { useState } from 'react';
import { useStore } from '../store'
const NewConectionModal = ({onClose}) =>{
//     const [pcinfo, setpcinfo] = useState({
//          ping: '',
//         storage: '',
//         files: '',
// });
//библиотка цуштанд делает общую память
//----------------------------------------------------
const setPcInfo = useStore((state) => state.setPcInfo);
//----------------------------------------------------
//данные----------------------------------------------
   const [pcdata, setpcdata] = useState({
       ssh: '',
       key: '',
       optional:''
     });
   const addConnection = async () => {
  try {
    const { data } = await api.post('/api/v1/addpc', pcdata);

    if (data.success || data.accessToken) {
      console.log('Авторизация успешна...');

      const pcId = data.pcId || pcdata.id; 
      const response = await api.get(`/api/v1/pc/${pcId}`);

      if (response.data) {
        // Обновляем состояние объекта целиком
        setPcInfo({
          ping: response.data.ping,
          storage: response.data.storage,
          files: response.data.files,
        });
        console.log('Данные инхронизированы');
        onClose();  
      }
    }
  } catch (err) {
    console.error('Ошибка:', err.response?.data?.message || err.message);
  }
};
//данные----------------------------------------------
//конфиги анимаций------------------------------------
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
        opacity: 1,
        transition: { staggerChildren: 0.1 } 
    }
};

const fieldVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: { 
        x: 0, 
        opacity: 1,
        transition: { duration: 0.4, ease: "easeOut" }
    }
};
//конфиги анимаций------------------------------------
    return (
         <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        >
        <>
    <div className="ModalMain">
        <div className="close-button">
            <span className="closebutton" onClick={onClose}>X</span> 
        </div>
        
        <div className="input-fields">
            
            <motion.input type="text" variants={fieldVariants} placeholder="ssh" className="custom-select" value={pcdata.ssh} onChange={(e) => setpcdata({...pcdata, ssh: e.target.value})} style={{width: '100%', border: '1px solid rgba(139, 92, 246, 0.3)'}} />
             <motion.input type="text" variants={fieldVariants} placeholder="key" className="custom-select"value={pcdata.key}  onChange={(e) => setpcdata({...pcdata, key: e.target.value})} style={{width: '100%', border: '1px solid rgba(139, 92, 246, 0.3)'}} />
             <motion.input type="text" variants={fieldVariants} placeholder="optional" className="custom-select"value={pcdata.optional}   onChange={(e) => setpcdata({...pcdata, optional: e.target.value})}style={{width: '100%', border: '1px solid rgba(139, 92, 246, 0.3)'}} />
            
            <div className="Button">
                <span className="addbutton" onClick={addConnection}>add</span> 
            </div>
        </div>
    </div>
    </>
    </motion.div>
);
}
export default NewConectionModal