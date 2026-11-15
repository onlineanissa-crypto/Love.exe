import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { loveConfig } from '../config/loveConfig';

export function Modal({ children, onClose, label }: { children: ReactNode; onClose: () => void; label: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  const opener = useRef(document.activeElement as HTMLElement);
  useEffect(() => {
    ref.current?.showModal();
    ref.current?.querySelector<HTMLInputElement>('input')?.focus();
    const overflow = document.body.style.overflow; document.body.style.overflow = 'hidden';
    const dialog = ref.current;
    return () => { dialog?.close(); document.body.style.overflow = overflow; opener.current?.focus(); };
  }, []);
  return <dialog ref={ref} className="modal" aria-label={label} onCancel={onClose} onClick={e => { if (e.target === ref.current) onClose(); }}><div className="modal-content"><button className="icon-button modal-close" onClick={onClose} aria-label={loveConfig.ui.close}><X size={20}/></button>{children}</div></dialog>;
}
