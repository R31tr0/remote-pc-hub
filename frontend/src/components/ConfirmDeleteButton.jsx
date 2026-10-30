import { useEffect, useId, useState } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import { Trash2, TriangleAlert, X } from 'lucide-react';
import { createPortal } from 'react-dom';

const ConfirmDeleteButton = ({
  onConfirm,
  title,
  description,
  ariaLabel,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const dialogId = useId();

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !isDeleting) {
        setIsOpen(false);
        setError('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isDeleting]);

  const confirmDelete = async () => {
    setIsDeleting(true);
    setError('');
    try {
      const result = await onConfirm();
      if (result?.success) {
        setIsOpen(false);
      } else {
        setError(result?.error || 'Не удалось выполнить удаление. Попробуйте ещё раз.');
      }
    } catch (deleteError) {
      console.error('Failed to confirm deletion:', deleteError);
      setError('Не удалось выполнить удаление. Попробуйте ещё раз.');
    } finally {
      setIsDeleting(false);
    }
  };

  const closeDialog = () => {
    if (!isDeleting) {
      setIsOpen(false);
      setError('');
    }
  };

  return (
    <>
      <m.button
        type="button"
        className="delete-connection-button"
        onClick={() => {
          setError('');
          setIsOpen(true);
        }}
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.98 }}
        aria-label={ariaLabel}
        aria-haspopup="dialog"
      >
        <Trash2 size={16} />
      </m.button>
      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <m.div
              className="delete-confirm-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) closeDialog();
              }}
            >
              <m.section
                className="delete-confirm-dialog"
                role="alertdialog"
                aria-modal="true"
                aria-labelledby={`${dialogId}-title`}
                aria-describedby={`${dialogId}-description`}
                initial={{ opacity: 0, scale: 0.95, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 8 }}
                transition={{ duration: 0.18 }}
              >
                <button
                  type="button"
                  className="delete-confirm-close"
                  onClick={closeDialog}
                  disabled={isDeleting}
                  aria-label="Закрыть окно подтверждения"
                >
                  <X size={18} />
                </button>
                <div className="delete-confirm-icon">
                  <TriangleAlert size={24} />
                </div>
                <h2 id={`${dialogId}-title`}>{title}</h2>
                <p id={`${dialogId}-description`}>{description}</p>
                {error && <p className="delete-confirm-error" role="alert">{error}</p>}
                <div className="delete-confirm-actions">
                  <button
                    type="button"
                    className="delete-confirm-cancel"
                    onClick={closeDialog}
                    disabled={isDeleting}
                  >
                    Отмена
                  </button>
                  <button
                    type="button"
                    className="delete-confirm-submit"
                    onClick={confirmDelete}
                    disabled={isDeleting}
                  >
                    <Trash2 size={16} />
                    {isDeleting ? 'Удаление...' : 'Удалить'}
                  </button>
                </div>
              </m.section>
            </m.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

export default ConfirmDeleteButton;
