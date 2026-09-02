// PermissionsModal.jsx
import { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import api from '../axiosapi/api';
import '../styles/permissionsmodal.css';
import { useStore } from '../store';
const GROUPS = ['owner', 'group', 'other'];
const PERMS = ['read', 'write', 'execute'];

const defaultState = (octal) => {
  let str = '755';

  if (octal !== undefined && octal !== null) {
    
    str = octal.toString().trim();
  }

    str = str.padStart(3, '0');

  return GROUPS.reduce((acc, group, i) => {
   
    const digit = parseInt(str[i], 10) || 0;
    acc[group] = {
      read:    !!(digit & 4),
      write:   !!(digit & 2),
      execute: !!(digit & 1),
    };
    return acc;
  }, {});
};

const calcOctal = (perms) => {
  return (
    GROUPS.map(g => {
      const { read, write, execute } = perms[g];
      return (read ? 4 : 0) + (write ? 2 : 0) + (execute ? 1 : 0);
    }).join('')
  );
};

const PermissionsModal = ({ path, currentPermissions, onClose }) => {
  const [perms, setPerms] = useState(defaultState(currentPermissions));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const logError = useStore((state) => state.logError);
  const toggle = (group, perm) => {
    setPerms(prev => ({
      ...prev,
      [group]: {
        ...prev[group],
        [perm]: !prev[group][perm],
      }
    }));
  };

 const handleSave = async () => {
  setLoading(true);
  setError(null);
  try {
    await api.put('/api/v1/ssh/files/permissions', {
      path,
      // Превращаем строку "755" в число 755, как требует документация
      permissions: parseInt(calcOctal(perms), 10), 
    });
    onClose();
    logError({error: `Permissions for ${path} changed successfully to ${calcOctal(perms)} at ${new Date().toLocaleString()}`, type: 'Success'});
  } catch (err) {
    setError(err.response?.data?.message || 'Ошибка при изменении прав');
    logError({error: `Failed to change permissions for ${path}: ${err.response?.data?.message || err.message} at ${new Date().toLocaleString()}`, type: 'Error'});
  } finally {
    setLoading(false);
    logError({error:`Permissions change operation completed for ${path} at ${new Date().toLocaleString()}`, type: 'Success'});
  }
};

  return (
    <div className="modal-overlay"  onMouseDown={(e) => {
      if (e.target === e.currentTarget) onClose(); 
    }}>
      <m.div
        className="permissions-modal"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.15 }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <span>Права доступа</span>
          <span className="modal-path">{path}</span>
        </div>

        <table className="perms-table">
          <thead>
            <tr>
              <th></th>
              <th>Read</th>
              <th>Write</th>
              <th>Execute</th>
              {/* <th className="octal-col">Octal</th> */}
            </tr>
          </thead>
          <tbody>
            {GROUPS.map((group, i) => {
              const digit =
                (perms[group].read ? 4 : 0) +
                (perms[group].write ? 2 : 0) +
                (perms[group].execute ? 1 : 0);
              return (
                <tr key={group}>
                  <td className="group-label">{group}</td>
                  {PERMS.map(perm => (
                    <td key={perm}>
                      <input
                        type="checkbox"
                        checked={perms[group][perm]}
                        onChange={() => toggle(group, perm)}
                      />
                    </td>
                  ))}
                  <td className="octal-col digit">{digit}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="modal-footer">
          <span className="octal-result">{calcOctal(perms)}</span>
          {error && <span className="modal-error">{error}</span>}
          <div className="modal-buttons">
            <button className="btn-cancel" onClick={onClose}>Отмена</button>
            <button className="btn-save" onClick={handleSave} disabled={loading}>
              {loading ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </div>
      </m.div>
    </div>
  );
};

export default PermissionsModal;