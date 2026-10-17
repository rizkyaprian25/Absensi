"use client";

import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  LogOut,
  Trash2,
  HelpCircle,
} from "lucide-react";

export type DialogVariant = "danger" | "warning" | "info" | "success" | "primary";
export type DialogIconType = "logout" | "trash" | "warning" | "info" | "success" | "help";

export interface ConfirmDialogOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: DialogVariant;
  icon?: DialogIconType;
}

export interface AlertDialogOptions {
  title?: string;
  message: string;
  confirmText?: string;
  variant?: DialogVariant;
  icon?: DialogIconType;
}

interface DialogState extends ConfirmDialogOptions {
  isOpen: boolean;
  isAlert: boolean; // Jika true, hanya tombol konfirmasi (tanpa tombol batal)
}

interface ConfirmContextType {
  confirm: (options: ConfirmDialogOptions | string) => Promise<boolean>;
  alert: (options: AlertDialogOptions | string) => Promise<void>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [dialog, setDialog] = useState<DialogState>({
    isOpen: false,
    isAlert: false,
    title: "",
    message: "",
    confirmText: "Ya, Lanjutkan",
    cancelText: "Batal",
    variant: "primary",
    icon: "help",
  });

  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((options: ConfirmDialogOptions | string): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;

      if (typeof options === "string") {
        setDialog({
          isOpen: true,
          isAlert: false,
          title: "Konfirmasi Tindakan",
          message: options,
          confirmText: "Lanjutkan",
          cancelText: "Batal",
          variant: "primary",
          icon: "help",
        });
      } else {
        setDialog({
          isOpen: true,
          isAlert: false,
          title: options.title || "Konfirmasi Tindakan",
          message: options.message,
          confirmText: options.confirmText || "Lanjutkan",
          cancelText: options.cancelText || "Batal",
          variant: options.variant || "primary",
          icon: options.icon || (options.variant === "danger" ? "warning" : "help"),
        });
      }
    });
  }, []);

  const alert = useCallback((options: AlertDialogOptions | string): Promise<void> => {
    return new Promise<void>((resolve) => {
      resolverRef.current = () => resolve();

      if (typeof options === "string") {
        setDialog({
          isOpen: true,
          isAlert: true,
          title: "Informasi",
          message: options,
          confirmText: "Mengerti",
          cancelText: "",
          variant: "info",
          icon: "info",
        });
      } else {
        setDialog({
          isOpen: true,
          isAlert: true,
          title: options.title || "Pemberitahuan",
          message: options.message,
          confirmText: options.confirmText || "Mengerti",
          cancelText: "",
          variant: options.variant || "info",
          icon: options.icon || (options.variant === "danger" ? "warning" : "info"),
        });
      }
    });
  }, []);

  const handleConfirm = () => {
    setDialog((prev) => ({ ...prev, isOpen: false }));
    if (resolverRef.current) {
      resolverRef.current(true);
      resolverRef.current = null;
    }
  };

  const handleCancel = () => {
    setDialog((prev) => ({ ...prev, isOpen: false }));
    if (resolverRef.current) {
      resolverRef.current(false);
      resolverRef.current = null;
    }
  };

  // Penentuan ikon & tema visual dialog
  const renderIcon = () => {
    const iconType = dialog.icon;
    const variant = dialog.variant;

    if (iconType === "logout") {
      return (
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto mb-4 shadow-sm">
          <LogOut className="w-6 h-6" />
        </div>
      );
    }

    if (iconType === "trash") {
      return (
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto mb-4 shadow-sm">
          <Trash2 className="w-6 h-6" />
        </div>
      );
    }

    if (variant === "danger" || iconType === "warning") {
      return (
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto mb-4 shadow-sm">
          <AlertCircle className="w-6 h-6" />
        </div>
      );
    }

    if (variant === "warning") {
      return (
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto mb-4 shadow-sm">
          <AlertTriangle className="w-6 h-6" />
        </div>
      );
    }

    if (variant === "success" || iconType === "success") {
      return (
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto mb-4 shadow-sm">
          <CheckCircle2 className="w-6 h-6" />
        </div>
      );
    }

    return (
      <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center mx-auto mb-4 shadow-sm">
        <Info className="w-6 h-6" />
      </div>
    );
  };

  // Gaya tombol aksi konfirmasi berdasarkan varian
  const getConfirmButtonClass = () => {
    switch (dialog.variant) {
      case "danger":
        return "bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20 focus:ring-rose-500/40";
      case "warning":
        return "bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-600/20 focus:ring-amber-500/40";
      case "success":
        return "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 focus:ring-emerald-500/40";
      default:
        return "bg-[var(--color-accent)] hover:opacity-90 text-[var(--color-on-accent)] shadow-md shadow-[var(--color-accent)]/20 focus:ring-[var(--color-accent)]/40";
    }
  };

  return (
    <ConfirmContext.Provider value={{ confirm, alert }}>
      {children}

      {/* Modal Dialog Konfirmasi / Peringatan Apple HIG */}
      {dialog.isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget && !dialog.isAlert) {
              handleCancel();
            }
          }}
        >
          <div className="relative w-full max-w-sm rounded-[22px] bg-[var(--surface-card)] border border-[var(--border-hairline)] p-6 shadow-2xl text-center animate-in zoom-in-95 duration-150 select-none">
            {/* Ikon Dinamis */}
            {renderIcon()}

            {/* Judul Dialog */}
            <h3 className="text-base font-bold text-[var(--text-primary)] mb-2 tracking-tight">
              {dialog.title}
            </h3>

            {/* Pesan Keterangan */}
            <p className="text-xs md:text-sm text-[var(--text-secondary)] leading-relaxed mb-6 font-normal break-words">
              {dialog.message}
            </p>

            {/* Baris Tombol Aksi */}
            <div className="flex items-center gap-2.5">
              {!dialog.isAlert && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--border-hairline)] bg-[var(--surface-recessed)] hover:bg-[var(--surface-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-semibold text-xs md:text-sm transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--border-hairline)]"
                >
                  {dialog.cancelText || "Batal"}
                </button>
              )}

              <button
                type="button"
                autoFocus
                onClick={handleConfirm}
                className={`flex-1 px-4 py-2.5 rounded-xl font-semibold text-xs md:text-sm transition-all cursor-pointer focus:outline-none focus:ring-2 ${getConfirmButtonClass()}`}
              >
                {dialog.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

/**
 * Hook kustom untuk memanggil dialog konfirmasi & alert modern Apple HIG
 */
export function useConfirm(): ConfirmContextType {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm harus digunakan di dalam ConfirmProvider");
  }
  return context;
}
