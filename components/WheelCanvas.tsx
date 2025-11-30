import React, { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { CATEGORIES } from '../types';

interface WheelCanvasProps {
  scores: Record<string, number>;
  width?: number;
  height?: number;
  interactive?: boolean;
  onSectionClick?: (categoryId: string) => void;
  animating?: boolean;
}

const WheelCanvas: React.FC<WheelCanvasProps> = ({
  scores,
  width = 300,
  height = 300,
  interactive = false,
  onSectionClick,
  animating = false
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const radius = Math.min(width, height) / 2;
  const center = { x: width / 2, y: height / 2 };

  // Calculate "Wobble Factor" based on standard deviation
  const wobbleFactor = useMemo(() => {
    const values = Object.values(scores) as number[];
    if (values.length === 0) return 0;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    return Math.sqrt(variance); // Standard Deviation
  }, [scores]);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg.append("g")
      .attr("transform", `translate(${center.x},${center.y})`);

    // Scale for radius (0-10 -> 0-radius)
    const rScale = d3.scaleLinear().domain([0, 10]).range([0, radius]);

    // Pie Layout
    const pie = d3.pie<any>()
      .value(1) // Equal slices
      .sort(null);

    const data = pie(CATEGORIES);

    // Arc Generator
    const arcGenerator = d3.arc<any>()
      .innerRadius(0)
      .outerRadius(d => {
        const catId = d.data.id;
        const score = scores[catId] || 0;
        return rScale(score);
      });

    const maxArcGenerator = d3.arc<any>()
      .innerRadius(0)
      .outerRadius(radius);

    // Draw Background Slices (Full 10 score ghost)
    g.selectAll(".bg-slice")
      .data(data)
      .enter()
      .append("path")
      .attr("d", maxArcGenerator)
      .attr("fill", d => interactive ? "#f1f5f9" : "none") // Only show background in interactive mode
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .attr("class", "cursor-pointer transition-opacity opacity-50 dark:opacity-20")
      .on("click", (event, d) => {
         if (interactive && onSectionClick) onSectionClick(d.data.id);
      });

    // Draw Score Slices (Colorful)
    g.selectAll(".slice")
      .data(data)
      .enter()
      .append("path")
      .attr("d", arcGenerator)
      .attr("fill", d => d.data.color)
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .attr("class", interactive ? "cursor-pointer hover:opacity-90" : "")
      .on("click", (event, d) => {
        if (interactive && onSectionClick) onSectionClick(d.data.id);
      });

    // Draw Labels
    g.selectAll(".label")
      .data(data)
      .enter()
      .append("text")
      .attr("transform", d => {
        const c = maxArcGenerator.centroid(d);
        // Push label out a bit if score is low, or keep centered? 
        // Let's keep it somewhat centered in the wedge but ensure it's readable.
        // For the design requested, labels are often inside.
        // We'll place them at 2/3 radius.
        const angle = (d.startAngle + d.endAngle) / 2 - Math.PI / 2;
        const labelR = radius * 0.7;
        const x = Math.cos(angle) * labelR;
        const y = Math.sin(angle) * labelR;
        
        // Rotate text to match angle
        const rotate = (angle * 180 / Math.PI) + 90;
        const finalRotate = rotate > 90 && rotate < 270 ? rotate + 180 : rotate; // Prevent upside down text
        
        return `translate(${x},${y}) rotate(${finalRotate})`;
      })
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .style("fill", "#1e293b") // Dark slate for visibility on colors usually, or white with shadow
      .style("text-shadow", "0px 0px 3px rgba(255,255,255,0.8)")
      .text(d => d.data.name)
      .style("pointer-events", "none");

  }, [scores, width, height, interactive, onSectionClick, radius, center]);

  // Animation Styles
  const animationStyle: React.CSSProperties = animating ? {
    animation: `roll 3s linear forwards, ${wobbleFactor > 2 ? 'limp 0.5s infinite' : 'none'}`,
    transformOrigin: 'center center'
  } : {};

  return (
    <div className={`relative overflow-hidden p-1 flex justify-center items-center rounded-full ${interactive ? 'shadow-2xl' : ''}`}>
      <style>{`
        @keyframes roll {
          0% { transform: translateX(-100%) rotate(0deg); }
          100% { transform: translateX(100%) rotate(720deg); }
        }
        @keyframes limp {
          0% { margin-top: 0px; }
          50% { margin-top: -10px; }
          100% { margin-top: 0px; }
        }
      `}</style>
      
      <div ref={containerRef} style={animationStyle}>
        <svg ref={svgRef} width={width} height={height} className="overflow-visible drop-shadow-lg" />
      </div>
      
      {animating && (
        <div className="absolute -bottom-12 text-center w-full min-w-[200px]">
            <span className={`inline-block px-4 py-2 rounded-full text-white text-sm font-bold shadow-lg backdrop-blur-md ${wobbleFactor > 2 ? 'bg-red-500/90' : 'bg-emerald-500/90'}`}>
                {wobbleFactor > 2 ? '⚠️ حرکت با لنگش (نامتعادل)' : '✅ حرکت روان (متعادل)'}
            </span>
        </div>
      )}
    </div>
  );
};

export default WheelCanvas;