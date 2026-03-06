"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import gsap from "gsap";

type LangData = { name: string; value: number };

export function LanguagesDonut({ data }: { data: LangData[] }) {
    const svgRef = useRef<SVGSVGElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const centerTextRef = useRef<HTMLSpanElement>(null);
    const centerSubRef = useRef<HTMLSpanElement>(null);

    const width = 300;
    const height = 300;
    const radius = width / 2;

    useEffect(() => {
        if (!svgRef.current || !data) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const total = d3.sum(data, d => d.value);

        const colors = d3.scaleOrdinal<string>()
            .domain(data.map(d => d.name))
            .range(["#57e071", "#3b82f6", "#a855f7", "#f59e0b", "#ef4444", "#22d3ee"]);

        const group = svg.append("g").attr("transform", `translate(${radius}, ${radius})`);

        const pie = d3.pie<LangData>()
            .sort(null)
            .value(d => d.value)
            .padAngle(0.04);

        const arc = d3.arc<d3.PieArcDatum<LangData>>()
            .innerRadius(90)
            .outerRadius(radius - 20)
            .cornerRadius(8);

        const arcHover = d3.arc<d3.PieArcDatum<LangData>>()
            .innerRadius(85)
            .outerRadius(radius - 10)
            .cornerRadius(10);

        const paths = group.selectAll("path")
            .data(pie(data))
            .join("path")
            .attr("fill", d => colors(d.data.name))
            .style("opacity", 0.8)
            .on("mouseenter", (event, d) => {
                d3.select(event.currentTarget)
                    .transition().duration(300).attr("d", arcHover(d)).style("opacity", 1);

                if (centerTextRef.current && centerSubRef.current) {
                    centerTextRef.current.textContent = d.data.name;
                    centerSubRef.current.textContent = `${((d.data.value / total) * 100).toFixed(1)}%`;

                    gsap.fromTo([centerTextRef.current, centerSubRef.current],
                        { y: 5, opacity: 0 },
                        { y: 0, opacity: 1, duration: 0.3, stagger: 0.05 }
                    );
                }
            })
            .on("mouseleave", (event, d) => {
                d3.select(event.currentTarget)
                    .transition().duration(300).attr("d", arc(d)).style("opacity", 0.8);

                if (centerTextRef.current && centerSubRef.current) {
                    centerTextRef.current.textContent = "Languages";
                    centerSubRef.current.textContent = "Distribution";
                }
            });

        paths.transition()
            .duration(1200)
            .ease(d3.easeExpOut)
            .attrTween("d", function (d) {
                const i = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
                return t => arc(i(t))!;
            });

    }, [data, radius]);

    return (
        <div ref={wrapperRef} className="relative flex items-center justify-center">
            <svg ref={svgRef} width={width} height={height} className="overflow-visible" />

            {/* Texto Central */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span
                    ref={centerTextRef}
                    className="text-white text-lg font-mono uppercase tracking-widest"
                >
                    Languages
                </span>
                <span
                    ref={centerSubRef}
                    className="text-zinc-500 text-[10px] font-mono uppercase mt-1"
                >
                    Distribution
                </span>
            </div>
        </div>
    );
}