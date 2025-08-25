// /src/components/blocks/SolutionsStatic.tsx
import * as siteData from "../../site.json";
import React from "react";

type Item = {
  id: number;
  title: string;
  desc: string;
  image: string;
  icon: string;
  link: string;
};

export default function SolutionsStatic() {
  // Puedes usar solutionsSlider o solutions; toma el que exista
  const data =
    (siteData as any).solutionsSlider ?? (siteData as any).solutions;

  const items: Item[] = data.items as Item[];

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

        {/* Grid responsivo: 1 / 2 / 3 */}
        <div className="grid gap-6 sm:gap-7 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <a
              key={item.id}
              href={item.link}
              className="group rounded-2xl overflow-hidden bg-white ring-1 ring-slate-200 shadow-sm hover:shadow-lg transition"
            >
              {/* Imagen */}
              <div className="relative h-44 sm:h-52 w-full">
                <img
                  src={item.image}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                />
                {/* Badge icono + número */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="inline-flex items-center justify-center rounded-lg bg-blue-600 p-2 shadow-md">
                    <img src={item.icon} alt="" className="h-5 w-5" />
                  </span>
                  {/* <span className="bg-white/90 rounded-full text-xs font-bold px-2 py-1 shadow-sm">
                    {item.id}
                  </span> */}
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
      </div>
    </section>
  );
}
