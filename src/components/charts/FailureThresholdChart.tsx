import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { ModelOutput, FAILURE_THRESHOLDS, FailurePoint } from '../../model';
import './Charts.css';

interface FailureThresholdChartProps {
  modelOutputs: ModelOutput[];
  sizes: number[];
  currentSize: number;
  failurePoints?: FailurePoint[];
}

export const FailureThresholdChart: React.FC<FailureThresholdChartProps> = ({
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
      .domain([0, 1.2])
      .range([height, 0]);

    // Danger zone background
    g.append('rect')
      .attr('x', 0)
      .attr('y', yScale(FAILURE_THRESHOLDS.respiration))
      .attr('width', width)
      .attr('height', height - yScale(FAILURE_THRESHOLDS.respiration))
      .attr('fill', 'rgba(243, 139, 168, 0.1)');

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

    // Failure threshold line
    g.append('line')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', yScale(FAILURE_THRESHOLDS.respiration))
      .attr('y2', yScale(FAILURE_THRESHOLDS.respiration))
      .attr('stroke', '#f38ba8')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '8,4');

    g.append('text')
      .attr('x', width - 5)
      .attr('y', yScale(FAILURE_THRESHOLDS.respiration) - 5)
      .attr('text-anchor', 'end')
      .attr('fill', '#f38ba8')
      .style('font-size', '10px')
      .text('FAILURE THRESHOLD');

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
      .text('Proxy Value');

    // Line generators
    const createLine = (accessor: (d: ModelOutput) => number) => 
      d3.line<ModelOutput>()
        .x((_, i) => xScale(sizes[i]))
        .y(d => yScale(Math.min(1.2, accessor(d))))
        .curve(d3.curveMonotoneX);

    const proxies = [
      { key: 'Respiration', color: '#f38ba8', accessor: (d: ModelOutput) => d.proxies.respiration },
      { key: 'Hydraulics', color: '#facc15', accessor: (d: ModelOutput) => d.proxies.hydraulics },
      { key: 'Exoskeleton', color: '#fab387', accessor: (d: ModelOutput) => d.proxies.exoskeleton },
      { key: 'Locomotion', color: '#89b4fa', accessor: (d: ModelOutput) => d.proxies.locomotion },
    ];

    // Draw lines
    proxies.forEach(({ color, accessor }) => {
      g.append('path')
        .datum(modelOutputs)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', 2)
        .attr('d', createLine(accessor));
    });

    // Find and mark failure points
    const failureColors: Record<string, string> = {
      'respiration': '#f38ba8',
      'hydraulics': '#facc15',
      'exoskeleton': '#fab387',
      'locomotion': '#89b4fa',
    };

    // Draw enhanced failure point markers from failurePoints prop
    failurePoints.forEach((fp) => {
      if (fp.sizeAtFailure >= sizes[0] && fp.sizeAtFailure <= sizes[sizes.length - 1]) {
        const color = failureColors[fp.subsystem] || '#dc2626';
        
        // Vertical line at failure point
        g.append('line')
          .attr('x1', xScale(fp.sizeAtFailure))
          .attr('x2', xScale(fp.sizeAtFailure))
          .attr('y1', 0)
          .attr('y2', height)
          .attr('stroke', color)
          .attr('stroke-width', 2)
          .attr('stroke-dasharray', '8,4')
          .attr('opacity', 0.6);

        // Failure marker circle
        g.append('circle')
          .attr('cx', xScale(fp.sizeAtFailure))
          .attr('cy', yScale(FAILURE_THRESHOLDS.respiration))
          .attr('r', 8)
          .attr('fill', 'rgba(220, 38, 38, 0.3)')
          .attr('stroke', color)
          .attr('stroke-width', 2);

        // Skull icon at top
        g.append('text')
          .attr('x', xScale(fp.sizeAtFailure))
          .attr('y', -5)
          .attr('text-anchor', 'middle')
          .attr('font-size', '14px')
          .text('💀');
        
        // Subsystem label
        g.append('text')
          .attr('x', xScale(fp.sizeAtFailure))
          .attr('y', yScale(FAILURE_THRESHOLDS.respiration) - 15)
          .attr('text-anchor', 'middle')
          .attr('fill', color)
          .style('font-size', '9px')
          .style('font-weight', 'bold')
          .text(fp.subsystem.substring(0, 3).toUpperCase());
      }
    });

    // Legacy failure point detection (fallback if failurePoints not provided)
    if (failurePoints.length === 0) {
      proxies.forEach(({ key, color, accessor }) => {
        const failureIndex = modelOutputs.findIndex(d => accessor(d) < FAILURE_THRESHOLDS.respiration);
        if (failureIndex > 0) {
          const failSize = sizes[failureIndex];
          g.append('circle')
            .attr('cx', xScale(failSize))
            .attr('cy', yScale(FAILURE_THRESHOLDS.respiration))
            .attr('r', 6)
            .attr('fill', 'none')
            .attr('stroke', color)
            .attr('stroke-width', 2);
          
          // Small label for failure point
          g.append('text')
            .attr('x', xScale(failSize))
            .attr('y', yScale(FAILURE_THRESHOLDS.respiration) - 10)
            .attr('text-anchor', 'middle')
            .attr('fill', color)
            .style('font-size', '8px')
            .text(key.substring(0, 3));
        }
      });
    }

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
    proxies.forEach(({ color, accessor }) => {
      g.append('circle')
        .attr('cx', xScale(currentSize))
        .attr('cy', yScale(Math.min(1.2, accessor(currentOutput))))
        .attr('r', 5)
        .attr('fill', color)
        .attr('stroke', '#1e1e2e')
        .attr('stroke-width', 2);
    });

    // Legend
    const legend = g.append('g')
      .attr('transform', `translate(${width - 90}, 10)`);

    proxies.forEach(({ key, color }, i) => {
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
      <h3>Failure Threshold Map</h3>
      <svg ref={svgRef} className="chart-svg" />
    </div>
  );
};
