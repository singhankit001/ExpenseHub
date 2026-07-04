import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from './button';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const Modal = ({ isOpen, onClose, title, children, footer }: ModalProps) => {
  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const contentVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 15 },
    visible: { opacity: 1, scale: 1, y: 0 },
  };

  if (typeof window === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Overlay */}
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={overlayVariants}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-surface-950/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={contentVariants}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative z-10 w-full max-w-lg overflow-hidden bg-white border border-surface-200 shadow-modal rounded-xl flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100">
              <h2 className="text-base font-semibold text-surface-900">{title}</h2>
              <Button variant="ghost" size="sm" onClick={onClose} className="!p-1 text-surface-600 hover:text-surface-900">
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 px-5 py-5 overflow-y-auto text-sm text-surface-800">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="px-5 py-4 border-t border-surface-100 bg-surface-50 flex items-center justify-end gap-2.5">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
