import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface Node extends d3.SimulationNodeDatum {
  id: string;
  group: number;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: string;
  target: string;
}

export default function KnowledgeGraph({ subject }: { subject: string }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    // Mock data based on subject
    const data = {
      nodes: [
        { id: subject, group: 1 },
        { id: "Concept A", group: 2 },
        { id: "Concept B", group: 2 },
        { id: "Detail 1", group: 3 },
        { id: "Detail 2", group: 3 },
        { id: "Detail 3", group: 3 },
      ],
      links: [
        { source: subject, target: "Concept A" },
        { source: subject, target: "Concept B" },
        { source: "Concept A", target: "Detail 1" },
        { source: "Concept A", target: "Detail 2" },
        { source: "Concept B", target: "Detail 3" },
      ]
    };

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const simulation = d3.forceSimulation(data.nodes as Node[])
      .force("link", d3.forceLink(data.links).id((d: any) => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svg.append("g")
      .attr("stroke", "#94a3b8")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(data.links)
      .join("line")
      .attr("stroke-width", 1);

    const node = svg.append("g")
      .selectAll("circle")
      .data(data.nodes)
      .join("circle")
      .attr("r", (d: any) => d.group === 1 ? 12 : 8)
      .attr("fill", (d: any) => d.group === 1 ? "#4f46e5" : d.group === 2 ? "#818cf8" : "#c7d2fe")
      .call(d3.drag<any, any>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    node.append("title").text(d => d.id);

    const label = svg.append("g")
      .selectAll("text")
      .data(data.nodes)
      .join("text")
      .text(d => d.id)
      .attr("font-size", "10px")
      .attr("dx", 15)
      .attr("dy", 4)
      .attr("fill", "#94a3b8");

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node
        .attr("cx", (d: any) => d.x)
        .attr("cy", (d: any) => d.y);

      label
        .attr("x", (d: any) => d.x)
        .attr("y", (d: any) => d.y);
    });

    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return () => simulation.stop();
  }, [subject]);

  return (
    <div className="w-full h-64 bg-slate-900/30 rounded-2xl border border-white/5 overflow-hidden">
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
}
