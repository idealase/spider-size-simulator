import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { ModelOutput, FailurePoint } from '../../model';
import './Charts.css';

interface SubsystemHealthChartProps {
  modelOutputs: ModelOutput[];
  sizes: number[];
  currentSize: number;
  failurePoints?: FailurePoint[];
}

export const SubsystemHealthChart: React.FC<SubsystemHealthChartProps> = ({
  modelOutputs,
  sizes,
  currentSize,
  failurePoints = [],
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || modelOutputs.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 20, bottom: 50, left: 50 };
    const width = svgRef.current.clientWidth - margin.left - margin.right;
    const height = svgRef.current.clientHeight - margin.top - margin.bottom;

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3.scaleLog()
      .domain([sizes[0], sizes[sizes.length - 1]])
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([0, 100])
      .range([height, 0]);

    // Grid lines
    g.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale)
        .ticks(5)
        .tickSize(-height)
        .tickFormat(() => '')
      )
      .style('stroke-dasharray', '3,3')
      .style('stroke-opacity', 0.2);

    g.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(yScale)
        .ticks(5)
        .tickSize(-width)
        .tickFormat(() => '')
      )
      .style('stroke-dasharray', '3,3')
      .style('stroke-opacity', 0.2);

    // Draw failure point vertical lines
    const failureColors: Record<string, string> = {
      'respiration': '#f38ba8',
      'hydraulics': '#facc15',
      'exoskeleton': '#fab387',
      'locomotion': '#89b4fa',
    };

    failurePoints.forEach((fp) => {
      if (fp.sizeAtFailure >= sizes[0] && fp.sizeAtFailure <= sizes[sizes.length - 1]) {
        // Vertical line at failure point
        g.append('line')
          .attr('x1', xScale(fp.sizeAtFailure))
          .attr('x2', xScale(fp.sizeAtFailure))
          .attr('y1', 0)
          .attr('y2', height)
          .attr('stroke', failureColors[fp.subsystem] || '#dc2626')
          .attr('stroke-width', 2)
          .attr('stroke-dasharray', '8,4')
          .attr('opacity', 0.6);

        // Failure marker (skull icon)
        g.append('text')
          .attr('x', xScale(fp.sizeAtFailure))
          .attr('y', -5)
          .attr('text-anchor', 'middle')
          .attr('font-size', '12px')
          .text('💀');
      }
    });

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale)
        .ticks(5)
        .tickFormat(d => {
          const val = d as number;
          if (val < 0.01) return `${(val * 1000).toFixed(0)}mm`;
          if (val < 1) return `${(val * 100).toFixed(0)}cm`;
          return `${val.toFixed(1)}m`;
        })
      )
      .attr('class', 'axis')
      .selectAll('text')
      .style('fill', '#bac2de');

    g.append('g')
      .call(d3.axisLeft(yScale).ticks(5))
      .attr('class', 'axis')
      .selectAll('text')
      .style('fill', '#bac2de');

    // Axis labels
    g.append('text')
      .attr('x', width / 2)
      .attr('y', height + 40)
      .attr('text-anchor', 'middle')
      .attr('fill', '#6c7086')
      .style('font-size', '12px')
      .text('Body Length');

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', -35)
      .attr('text-anchor', 'middle')
      .attr('fill', '#6c7086')
      .style('font-size', '12px')
      .text('Health Score (%)');

    // Line generators
    const createLine = (accessor: (d: ModelOutput) => number) => 
      d3.line<ModelOutput>()
        .x((_, i) => xScale(sizes[i]))
        .y(d => yScale(accessor(d)))
        .curve(d3.curveMonotoneX);

    const subsystems = [
      { key: 'respiration', color: '#f38ba8', accessor: (d: ModelOutput) => d.health.respiration },
      { key: 'hydraulics', color: '#facc15', accessor: (d: ModelOutput) => d.health.hydraulics },
      { key: 'exoskeleton', color: '#fab387', accessor: (d: ModelOutput) => d.health.exoskeleton },
      { key: 'locomotion', color: '#89b4fa', accessor: (d: ModelOutput) => d.health.locomotion },
    ];

    // Draw lines
    subsystems.forEach(({ key, color, accessor }) => {
      g.append('path')
        .datum(modelOutputs)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', 2)
        .attr('d', createLine(accessor))
        .attr('class', `line-${key}`);
    });

    // Current position marker
    const currentIndex = sizes.findIndex(s => s >= currentSize);
    const currentOutput = modelOutputs[currentIndex] || modelOutputs[modelOutputs.length - 1];
    
    g.append('line')
      .attr('x1', xScale(currentSize))
      .attr('x2', xScale(currentSize))
      .attr('y1', 0)
      .attr('y2', height)
      .attr('stroke', '#cba6f7')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5')
      .attr('opacity', 0.7);

    // Current value dots
    subsystems.forEach(({ color, accessor }) => {
      g.append('circle')
        .attr('cx', xScale(currentSize))
        .attr('cy', yScale(accessor(currentOutput)))
        .attr('r', 5)
        .attr('fill', color)
        .attr('stroke', '#1e1e2e')
        .attr('stroke-width', 2);
    });

    // Legend
    const legend = g.append('g')
      .attr('transform', `translate(${width - 100}, 10)`);

    subsystems.forEach(({ key, color }, i) => {
      const legendItem = legend.append('g')
        .attr('transform', `translate(0, ${i * 18})`);
      
      legendItem.append('line')
        .attr('x1', 0)
        .attr('x2', 15)
        .attr('y1', 0)
        .attr('y2', 0)
        .attr('stroke', color)
        .attr('stroke-width', 2);
      
      legendItem.append('text')
        .attr('x', 20)
        .attr('y', 4)
        .attr('fill', '#bac2de')
        .style('font-size', '10px')
        .text(key.charAt(0).toUpperCase() + key.slice(1));
    });

  }, [modelOutputs, sizes, currentSize, failurePoints]);

  return (
    <div className="chart-container">
      <h3>Subsystem Health vs Size</h3>
      <svg ref={svgRef} className="chart-svg" />
    </div>
  );
};
