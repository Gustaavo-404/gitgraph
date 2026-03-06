"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import gsap from "gsap";

type Commit = { date: string; count: number };

export function CommitsChart({ data }: { data: Commit[] }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const [width, setWidth] = useState(500);
  const height = 260;
  const margin = { top: 30, right: 30, bottom: 40, left: 10 };

  useEffect(() => {
    if (!wrapperRef.current) return;
    const obs = new ResizeObserver((entries) => {
      setWidth(entries[0].contentRect.width);
    });
    obs.observe(wrapperRef.current);
    return () => obs.disconnect();
  }, []);

  const parsed = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data.map((d) => ({ ...d, date: new Date(d.date) }));
  }, [data]);

  useEffect(() => {
    if (!svgRef.current || width === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const x = d3.scaleTime()
      .domain(d3.extent(parsed, (d) => d.date) as [Date, Date])
      .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(parsed, (d) => d.count)! * 1.2])
      .range([height - margin.bottom, margin.top]);

    const defs = svg.append("defs");

    // 1. PADRÃO DE HACHURA (Inatividade - Flat)
    const pattern = defs.append("pattern")
      .attr("id", "hatch-v2")
      .attr("patternUnits", "userSpaceOnUse")
      .attr("width", 6)
      .attr("height", 6)
      .attr("patternTransform", "rotate(45)");

    pattern.append("line")
      .attr("x1", 0).attr("y1", 0).attr("x2", 0).attr("y2", 6)
      .attr("stroke", "#73737c")
      .attr("stroke-width", 1.5);

    // Grid Horizontal Flat
    svg.append("g")
      .selectAll("line")
      .data(y.ticks(4))
      .join("line")
      .attr("x1", margin.left)
      .attr("x2", width - margin.right)
      .attr("y1", (d) => y(d))
      .attr("y2", (d) => y(d))
      .attr("stroke", "#313138")
      .attr("stroke-dasharray", "2,2");

    // 2. BLOCOS DE INATIVIDADE (Largura Total)
    const stepWidth = (width - margin.left - margin.right) / (parsed.length - 1);

    svg.append("g")
      .selectAll("rect")
      .data(parsed.filter(d => d.count === 0))
      .join("rect")
      .attr("x", d => x(d.date) - stepWidth / 2)
      .attr("y", margin.top)
      .attr("width", stepWidth)
      .attr("height", height - margin.bottom - margin.top)
      .attr("fill", "url(#hatch-v2)")
      .attr("opacity", 0)
      .transition().duration(800).attr("opacity", 0.6);

    const lineGenerator = d3.line<any>()
      .x((d) => x(d.date))
      .y((d) => y(d.count))
      .curve(d3.curveCatmullRom.alpha(0.5));

    const areaGenerator = d3.area<any>()
      .x((d) => x(d.date))
      .y0(height - margin.bottom)
      .y1((d) => y(d.count))
      .curve(d3.curveCatmullRom.alpha(0.5));

    // Área (Sem glow/gradiente pesado, apenas preenchimento sutil)
    svg.append("path")
      .datum(parsed)
      .attr("fill", "#57e071")
      .attr("d", areaGenerator)
      .attr("opacity", 0)
      .transition().duration(800).attr("opacity", 0.05);

    // Linha Principal (Flat)
    const path = svg.append("path")
      .datum(parsed)
      .attr("fill", "none")
      .attr("stroke", "#57e071")
      .attr("stroke-width", 2)
      .attr("d", lineGenerator);

    // Animação GSAP Simples
    const l = path.node()?.getTotalLength() || 0;
    gsap.fromTo(path.node(),
      { strokeDasharray: l, strokeDashoffset: l },
      { strokeDashoffset: 0, duration: 1.2, ease: "power2.inOut" }
    );

    // Pontos (Apenas no Hover)
    const dots = svg.append("g")
      .selectAll("circle")
      .data(parsed)
      .join("circle")
      .attr("cx", d => x(d.date))
      .attr("cy", d => y(d.count))
      .attr("r", 3)
      .attr("fill", "#57e071")
      .attr("opacity", 0);

    // Eixo X
    svg.append("g")
      .attr("transform", `translate(0, ${height - margin.bottom + 15})`)
      .call(d3.axisBottom(x).ticks(5).tickSize(0).tickFormat(d => d3.timeFormat("%b %d")(d as Date)))
      .call(g => g.select(".domain").remove())
      .selectAll("text")
      .attr("fill", "#3f3f46")
      .attr("font-family", "monospace")
      .attr("font-size", "10px");

    // Interação
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "transparent")
      .on("mousemove", (event) => {
        const [mx] = d3.pointer(event);
        const bisect = d3.bisector((d: any) => d.date).center;
        const i = bisect(parsed, x.invert(mx));
        const d = parsed[i];

        if (!d || !tooltipRef.current) return;

        const posX = x(d.date);
        const posY = y(d.count);

        const tooltipWidth = 100;
        let translateX = "-50%";
        if (posX < tooltipWidth / 2 + 10) translateX = "0%";
        else if (posX > width - (tooltipWidth / 2 + 10)) translateX = "-100%";

        gsap.to(tooltipRef.current, {
          x: posX,
          y: posY,
          opacity: 1,
          xPercent: translateX === "0%" ? 5 : translateX === "-100%" ? -105 : -50,
          duration: 0.1,
          ease: "none"
        });

        dots.attr("opacity", p => p === d ? 1 : 0)
          .attr("r", p => (p === d ? 4 : 3));

        tooltipRef.current.innerHTML = `
          <div class="text-[10px] text-zinc-500 font-mono tracking-tight">${d3.timeFormat("%d %B")(d.date)}</div>
          <div class="text-white font-bold text-xs font-mono">${d.count} commits</div>
        `;
      })
      .on("mouseleave", () => {
        gsap.to(tooltipRef.current, { opacity: 0, duration: 0.2 });
        dots.attr("opacity", 0);
      });

  }, [parsed, width]);

  return (
    <div ref={wrapperRef} className="relative w-full space-y-4">

      {/* Legendas Flat */}
      <div className="flex gap-6 items-center">
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-[#57e071]" />
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Active_Push</span>
        </div>

        <div className="flex items-center gap-2 text-zinc-600">
          <div
            className="w-3 h-3 bg-zinc-900 border border-zinc-800"
            style={{
              backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 1px, #27272a 1px, #27272a 2px)',
              backgroundSize: '4px 4px'
            }}
          />
          <span className="text-[10px] font-mono uppercase tracking-widest italic">System_Idle</span>
        </div>
      </div>

      <div className="relative border-t border-white/5 pt-4">
        <div
          ref={tooltipRef}
          className="absolute z-50 pointer-events-none opacity-0 bg-zinc-950 border border-zinc-800 px-3 py-1.5 rounded-sm shadow-none -translate-y-[125%]"
        />
        <svg ref={svgRef} width={width} height={height} className="overflow-visible" />
      </div>
    </div>
  );
}