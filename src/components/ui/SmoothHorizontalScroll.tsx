"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SmoothHorizontalScrollProps {
  children: React.ReactNode;
  /** Kelas CSS tambahan untuk kontainer pembungkus luar */
  containerClassName?: string;
  /** Kelas CSS tambahan untuk elemen scrollable di dalam */
  className?: string;
  /** Jarak scroll per klik tombol panah dalam pixel (default: 180) */
  scrollStep?: number;
  /** Apakah tombol navigasi panah kiri/kanan diaktifkan (default: true) */
  showArrows?: boolean;
  /** Query selector elemen aktif untuk auto-scroll ke elemen tersebut */
  activeSelector?: string;
  /** Kunci/ID item aktif untuk memicu scroll otomatis saat berpindah */
  activeKey?: any;
  /** Warna gradien pudar pada ujung kiri/kanan kontainer (default: from-[var(--surface-card)]) */
  gradientFromClass?: string;
}

/**
 * Komponen pembungkus scroll horizontal super halus (Smooth Horizontal Scroll).
 * Menyediakan pengalaman UX setara Apple HIG:
 * 1. Konversi putaran roda mouse (wheel) vertikal ke scroll horizontal alami tanpa perlu tahan tombol Shift.
 * 2. Geser dengan mouse (Drag-to-scroll / grab) yang responsif dan intuitif.
 * 3. Tombol navigasi panah kiri (◀) dan kanan (▶) yang otomatis muncul saat konten meluap (overflow).
 * 4. Efek gradien pudar (fade mask) di kedua sisi sehingga visual tidak terpotong kaku.
 * 5. Auto-scroll mulus ke item aktif saat terpilih.
 */
export function SmoothHorizontalScroll({
  children,
  containerClassName = "",
  className = "",
  scrollStep = 180,
  showArrows = true,
  activeSelector,
  activeKey,
  gradientFromClass = "from-[var(--surface-card)]",
}: SmoothHorizontalScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const isMouseDownRef = useRef(false);
  const startXRef = useRef(0);
  const startScrollLeftRef = useRef(0);
  const hasMovedRef = useRef(false);

  // Periksa apakah kontainer dapat di-scroll ke kiri atau kanan
  const checkScrollability = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const maxScroll = scrollWidth - clientWidth;
    setCanScrollLeft(scrollLeft > 3);
    setCanScrollRight(maxScroll - scrollLeft > 3);
  }, []);

  // Pasang listener scroll dan ResizeObserver untuk mendeteksi perubahan ukuran dinamis
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    checkScrollability();
    el.addEventListener("scroll", checkScrollability, { passive: true });

    const resizeObserver = new ResizeObserver(() => {
      checkScrollability();
    });
    resizeObserver.observe(el);

    return () => {
      el.removeEventListener("scroll", checkScrollability);
      resizeObserver.disconnect();
    };
  }, [checkScrollability]);

  // Dukungan Roda Mouse: konversi putaran mouse wheel vertikal menjadi scroll horizontal
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      // Jika terjadi scroll roda mouse dan kontainer memiliki overflow horizontal
      if (e.deltaY !== 0 && el.scrollWidth > el.clientWidth) {
        const atLeft = el.scrollLeft <= 0 && e.deltaY < 0;
        const atRight = el.scrollLeft >= el.scrollWidth - el.clientWidth - 1 && e.deltaY > 0;

        // Cegah lonjakan halaman vertikal hanya jika scroll horizontal masih bisa bergerak
        if (!atLeft && !atRight) {
          e.preventDefault();
          el.scrollLeft += e.deltaY * 1.1;
          checkScrollability();
        }
      }
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [checkScrollability]);

  // Auto-scroll ke elemen yang sedang aktif
  useEffect(() => {
    if (!activeSelector || !containerRef.current) return;
    const activeEl = containerRef.current.querySelector(activeSelector);
    if (activeEl instanceof HTMLElement) {
      activeEl.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
      setTimeout(checkScrollability, 300);
    }
  }, [activeKey, activeSelector, checkScrollability]);

  // Navigasi tombol panah geser
  const handleScrollBy = (amount: number) => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollBy({ left: amount, behavior: "smooth" });
    setTimeout(checkScrollability, 300);
  };

  // Mouse Drag-to-scroll handler
  const handleMouseDown = (e: React.MouseEvent) => {
    const el = containerRef.current;
    if (!el) return;
    isMouseDownRef.current = true;
    hasMovedRef.current = false;
    startXRef.current = e.pageX - el.offsetLeft;
    startScrollLeftRef.current = el.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDownRef.current) return;
    const el = containerRef.current;
    if (!el) return;
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startXRef.current) * 1.3;
    if (Math.abs(walk) > 4) {
      if (!hasMovedRef.current) {
        hasMovedRef.current = true;
        setIsDragging(true);
      }
    }
    el.scrollLeft = startScrollLeftRef.current - walk;
    checkScrollability();
  };

  const handleMouseUpOrLeave = () => {
    isMouseDownRef.current = false;
    setTimeout(() => {
      setIsDragging(false);
      hasMovedRef.current = false;
    }, 50);
  };

  // Mencegah klik terpicu saat pengguna sebenarnya sedang menggeser (dragging)
  const handleClickCapture = (e: React.MouseEvent) => {
    if (hasMovedRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <div className={`relative min-w-0 max-w-full flex items-center group/scroll ${containerClassName}`}>
      {/* Tombol Panah Kiri dengan Efek Gradien Pudar */}
      {showArrows && canScrollLeft && (
        <div
          className={`absolute left-0 top-0 bottom-0 z-20 flex items-center pr-5 pl-0.5 bg-gradient-to-r ${gradientFromClass} via-[var(--surface-card)]/90 to-transparent pointer-events-none animate-in fade-in duration-200`}
        >
          <button
            type="button"
            onClick={() => handleScrollBy(-scrollStep)}
            className="pointer-events-auto w-6.5 h-6.5 rounded-full bg-[var(--surface-card)] hover:bg-[var(--surface-recessed)] text-[var(--text-primary)] border border-[var(--border-hairline)] shadow-xs flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="Geser opsi ke kiri"
            aria-label="Geser ke kiri"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Kontainer Elemen Scrollable */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        onClickCapture={handleClickCapture}
        className={`flex items-center gap-1.5 overflow-x-auto scroll-smooth overscroll-x-contain scrollbar-none select-none ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        } ${className}`}
      >
        {children}
      </div>

      {/* Tombol Panah Kanan dengan Efek Gradien Pudar */}
      {showArrows && canScrollRight && (
        <div
          className={`absolute right-0 top-0 bottom-0 z-20 flex items-center pl-5 pr-0.5 bg-gradient-to-l ${gradientFromClass} via-[var(--surface-card)]/90 to-transparent pointer-events-none animate-in fade-in duration-200`}
        >
          <button
            type="button"
            onClick={() => handleScrollBy(scrollStep)}
            className="pointer-events-auto w-6.5 h-6.5 rounded-full bg-[var(--surface-card)] hover:bg-[var(--surface-recessed)] text-[var(--text-primary)] border border-[var(--border-hairline)] shadow-xs flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="Geser opsi ke kanan"
            aria-label="Geser ke kanan"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
