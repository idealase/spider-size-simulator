import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { ModelOutput, FailurePoint } from '../../model';
import './Charts.css';

interface ScalingLawsChartProps {
  modelOutputs: ModelOutput[];
  sizes: number[];
  currentSize: number;
  failurePoints?: FailurePoint[];
}

export const ScalingLawsChart: React.FC<ScalingLawsChartProps> = ({
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

    const margin = { top: 20, right: 20, bottom: 50, left: 60 };
    const width = svgRef.current.clientWidth - margin.left - margin.right;
    const height = svgRef.current.clientHeight - margin.top - margin.bottom;

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Find max values for scaling
    const maxMass = d3.max(modelOutputs, d => d.mass) || 1;
    const maxSurface = d3.max(modelOutputs, d => d.surfaceArea) || 1;
    const maxWeight = d3.max(modelOutputs, d => d.weightFactor) || 1;
    const maxVal = Math.max(maxMass, maxSurface, maxWeight);

    // Scales - log scale for both axes
    const xScale = d3.scaleLog()
      .domain([sizes[0], sizes[sizes.length - 1]])
      .range([0, width]);

    const yScale = d3.scaleLog()
      .domain([0.01, maxVal * 1.2])
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
      .call(d3.axisLeft(yScale)
        .ticks(5)
        .tickFormat(d => {
          const val = d as number;
          if (val >= 1000000) return `${(val / 1000000).toFixed(0)}M`;
          if (val >= 1000) return `${(val / 1000).toFixed(0)}K`;
          if (val >= 1) return val.toFixed(0);
          return val.toFixed(2);
        })
      )
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
      .attr('y', -45)
      .attr('text-anchor', 'middle')
      .attr('fill', '#6c7086')
      .style('font-size', '12px')
      .text('Relative Value (log scale)');

    // Line generators with safe log handling
    const createLine = (accessor: (d: ModelOutput) => number) => 
      d3.line<ModelOutput>()
        .x((_, i) => xScale(sizes[i]))
        .y(d => yScale(Math.max(0.01, accessor(d))))
        .curve(d3.curveMonotoneX);

    const metrics = [
      { key: 'Mass (∝ s³)', color: '#f38ba8', accessor: (d: ModelOutput) => d.mass },
      { key: 'Surface (∝ s²)', color: '#a6e3a1', accessor: (d: ModelOutput) => d.surfaceArea },
      { key: 'Weight', color: '#fab387', accessor: (d: ModelOutput) => d.weightFactor },
      { key: 'Scale Factor', color: '#89dceb', accessor: (d: ModelOutput) => d.scaleFactor },
    ];

    // Draw lines
    metrics.forEach(({ color, accessor }) => {
      g.append('path')
        .datum(modelOutputs)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', 2)
        .attr('d', createLine(accessor));
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
    metrics.forEach(({ color, accessor }) => {
      const val = Math.max(0.01, accessor(currentOutput));
      g.append('circle')
        .attr('cx', xScale(currentSize))
        .attr('cy', yScale(val))
        .attr('r', 5)
        .attr('fill', color)
        .attr('stroke', '#1e1e2e')
        .attr('stroke-width', 2);
    });

    // Legend
    const legend = g.append('g')
      .attr('transform', `translate(10, 10)`);

    metrics.forEach(({ key, color }, i) => {
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
        .text(key);
    });

  }, [modelOutputs, sizes, currentSize, failurePoints]);

  return (
    <div className="chart-container">
      <h3>Scaling Laws (Log-Log)</h3>
      <svg ref={svgRef} className="chart-svg" />
    </div>
  );
};
