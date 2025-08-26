// /src/components/blocks/SolutionsStatic.tsx
import * as siteData from "../../site.json";
import React, { useEffect, useMemo, useRef, useState } from "react";

type Item = {
  id: number;
  title: string;
  desc: string;
  image: string;
  icon: string;
  link: string;
};

type FitMode = "shrink" | "pad";

type Props = {
  /** Modo de ajuste visual para evitar que la última card se corte */
  mode?: FitMode;          // "shrink" | "pad"
  /** Solo para mode="shrink": reduce el ancho de cada card en px (default 4) */
  shrinkPx?: number;       
  /** Solo para mode="pad": padding horizontal del contenedor en px (default 8) */
  containerPad?: number;   
};

function getSlidesPerView(width: number) {
  if (width >= 1024) return 3; // lg
  if (width >= 640) return 2;  // sm
  return 1;
}

export default function SolutionsStatic({
  mode = "shrink",
  shrinkPx = 19,
  containerPad = 19,
}: Props) {
  const data =
    (siteData as any).solutionsSlider ?? (siteData as any).solutions;
  const items: Item[] = (data.items || []) as Item[];

  const [slidesPerView, setSlidesPerView] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [stepPx, setStepPx] = useState(0); // ancho de 1 card + gap en px

  // Recalcular slides por vista en resize
  useEffect(() => {
    const update = () => {
      const spv = getSlidesPerView(window.innerWidth);
      setSlidesPerView(spv);
      setCurrentIndex((prev) => {
        const maxIdx = Math.max(0, items.length - spv);
        return Math.min(prev, maxIdx);
      });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [items.length]);

  // Medir el paso real en px (ancho de card visible + column-gap real del track)
  const measureStep = () => {
    const track = trackRef.current;
    if (!track) return 0;
    const firstItem = track.querySelector<HTMLElement>('[data-slide="true"]');
    if (!firstItem) return 0;

    const itemRect = firstItem.getBoundingClientRect();
    const styles = getComputedStyle(track);
    // En navegadores modernos, gap horizontal se expone como columnGap
    const gap = parseFloat(styles.columnGap || "0");
    // Redondear evita acumulación de flotantes tras muchos pasos
    const step = Math.round(itemRect.width + gap);
    return step;
  };

  // Re-medimos cuando cambian slidesPerView, items o el modo que afecta tamaño
  useEffect(() => {
    const recalc = () => setStepPx(measureStep());
    const id = requestAnimationFrame(recalc);
    window.addEventListener("resize", recalc);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("resize", recalc);
    };
    // incluir dependencias que pueden alterar ancho de card
  }, [slidesPerView, items.length, mode, shrinkPx]);

  const maxIndex = useMemo(
    () => Math.max(0, items.length - slidesPerView),
    [items.length, slidesPerView]
  );

  const canSlide = items.length > slidesPerView;

  const prev = () => {
    if (!canSlide) return;
    setCurrentIndex((idx) => (idx === 0 ? maxIndex : idx - 1));
  };

  const next = () => {
    if (!canSlide) return;
    setCurrentIndex((idx) => (idx === maxIndex ? 0 : idx + 1));
  };

  // Swipe en mobile
  useEffect(() => {
    const root = trackRef.current;
    if (!root) return;

    let startX = 0;
    let deltaX = 0;

    const onTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      deltaX = 0;
    };
    const onTouchMove = (e: TouchEvent) => {
      deltaX = e.touches[0].clientX - startX;
    };
    const onTouchEnd = () => {
      const threshold = 40;
      if (Math.abs(deltaX) > threshold) {
        deltaX < 0 ? next() : prev();
      }
    };

    root.addEventListener("touchstart", onTouchStart, { passive: true });
    root.addEventListener("touchmove", onTouchMove, { passive: true });
    root.addEventListener("touchend", onTouchEnd);

    return () => {
      root.removeEventListener("touchstart", onTouchStart);
      root.removeEventListener("touchmove", onTouchMove);
      root.removeEventListener("touchend", onTouchEnd);
    };
  }, [canSlide, maxIndex]);

  // Cálculos de estilos
  const itemBasisPercent = 100 / slidesPerView;
  const itemBasis =
    mode === "shrink"
      ? `calc(${itemBasisPercent}% - ${shrinkPx}px)`
      : `${itemBasisPercent}%`;

  // Desplazamiento en px (considera gap real)
  const translateX = -(currentIndex * stepPx);

  // Padding del contenedor si se usa mode="pad"
  const containerStyle =
    mode === "pad"
      ? { paddingLeft: containerPad, paddingRight: containerPad }
      : undefined;

  return (
    <section id={data.id ?? "soluciones"} className="relative">
      <div className="mx-auto max-w-7xl px-6 py-14 sm:py-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0f172a]">
            {data.title}
          </h2>
          {data.subtitle && (
            <p className="mt-3 text-slate-600 max-w-3xl mx-auto">
              {data.subtitle}
            </p>
          )}
        </div>

        {/* Contenedor del Carrusel */}
        <div
          ref={containerRef}
          className="relative overflow-hidden"
          style={containerStyle}
        >
          <div
            ref={trackRef}
            id="solutions-slider-track"
            className="flex gap-6 sm:gap-7 transition-transform duration-500 ease-in-out will-change-transform"
            style={{ transform: `translateX(${translateX}px)` }}
          >
            {items.map((item) => (
              <a
                key={item.id}
                href={item.link}
                data-slide="true"
                className="shrink-0 rounded-2xl overflow-hidden bg-white ring-1 ring-slate-200 shadow-sm hover:shadow-lg transition"
                style={{ flex: `0 0 ${itemBasis}` }}
              >
                {/* Imagen */}
                <div className="relative h-44 sm:h-52 w-full">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="inline-flex items-center justify-center rounded-lg bg-blue-600 p-2 shadow-md">
                      <img src={item.icon} alt="" className="h-5 w-5" />
                    </span>
                  </div>
                </div>

                {/* Texto */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-slate-900">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </a>
            ))}
          </div>

          {canSlide && (
            <>
              <button
                onClick={prev}
                aria-label="Anterior"
                className="absolute left-0 top-1/2 -translate-y-1/2 p-2 bg-gray-200 rounded-full shadow-lg z-10"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                onClick={next}
                aria-label="Siguiente"
                className="absolute right-0 top-1/2 -translate-y-1/2 p-2 bg-gray-200 rounded-full shadow-lg z-10"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
