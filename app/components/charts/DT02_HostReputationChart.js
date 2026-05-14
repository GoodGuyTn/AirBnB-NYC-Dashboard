'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export default function DT02_HostReputationChart({ data }) {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Container responsive sizing
    const container = svgRef.current?.parentElement;
    if (!container) return;

    const containerWidth = container.clientWidth;
    const margin = { top: 30, right: 30, bottom: 60, left: 70 };
    const width = containerWidth - margin.left - margin.right;
    const height = 420 - margin.top - margin.bottom;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    // Create SVG
    const svg = d3
      .select(svgRef.current)
      .attr('width', containerWidth)
      .attr('height', 420);

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales - SWAPPED: X = Rating (0-5), Y = Number of Reviews
    const xScale = d3
      .scaleLinear()
      .domain([0, 5])
      .range([0, width]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.number_of_reviews || 0)])
      .range([height, 0]);

    // Tooltip
    const tooltip = d3.select('body').select('.reputation-tooltip');
    const tip = tooltip.empty()
      ? d3
          .select('body')
          .append('div')
          .attr('class', 'reputation-tooltip')
          .style('position', 'fixed')
          .style('pointer-events', 'none')
          .style('background', 'white')
          .style('border', '1px solid #e2e8f0')
          .style('border-radius', '8px')
          .style('padding', '10px 12px')
          .style('font-size', '12px')
          .style('color', '#1f2937')
          .style('box-shadow', '0 4px 12px rgba(0,0,0,0.1)')
          .style('opacity', 0)
          .style('z-index', 1000)
      : tooltip;

    // Add grid lines
    g.append('g')
      .attr('class', 'grid-lines')
      .attr('opacity', 0.1)
      .call(
        d3
          .axisBottom(xScale)
          .tickSize(height)
          .tickFormat('')
      );

    g.append('g')
      .attr('class', 'grid-lines')
      .attr('opacity', 0.1)
      .call(
        d3
          .axisLeft(yScale)
          .tickSize(-width)
          .tickFormat('')
      );

    // Draw circles
    g.selectAll('.dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', (d) => xScale(d.review_scores_rating || 0))
      .attr('cy', (d) => yScale(d.number_of_reviews || 0))
      .attr('r', 4)
      .attr('fill', '#4b8adb')
      .attr('opacity', 0.6)
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)
      .on('mouseover', function (event, d) {
        d3.select(this)
          .attr('r', 6)
          .attr('opacity', 0.9)
          .attr('stroke-width', 2);

        tip
          .style('opacity', 1)
          .html(
            `<strong>${d.host_name || 'Unknown'}</strong><br/>
             Rating: ${d.review_scores_rating?.toFixed(2)}/5<br/>
             Reviews: ${d.number_of_reviews}`
          )
          .style('left', event.pageX + 10 + 'px')
          .style('top', event.pageY - 10 + 'px');
      })
      .on('mouseout', function () {
        d3.select(this)
          .attr('r', 4)
          .attr('opacity', 0.6)
          .attr('stroke-width', 1);

        tip.style('opacity', 0);
      });

    // X Axis
    const xAxis = g
      .append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale));

    xAxis
      .append('text')
      .attr('x', width / 2)
      .attr('y', 45)
      .attr('fill', '#1f2937')
      .attr('text-anchor', 'middle')
      .style('font-size', '13px')
      .style('font-weight', '600')
      .text('Review Scores Rating');

    // Y Axis
    const yAxis = g.append('g').call(d3.axisLeft(yScale));

    yAxis
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - height / 2)
      .attr('dy', '1em')
      .attr('fill', '#1f2937')
      .attr('text-anchor', 'middle')
      .style('font-size', '13px')
      .style('font-weight', '600')
      .text('Number Of Reviews');

    // Legend
    const legend = g
      .append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${width - 120}, -25)`);

    legend
      .append('rect')
      .attr('width', 110)
      .attr('height', 30)
      .attr('fill', 'white')
      .attr('stroke', '#e5e7eb')
      .attr('stroke-width', 1)
      .attr('rx', 4);

    legend
      .append('circle')
      .attr('cx', 10)
      .attr('cy', 10)
      .attr('r', 4)
      .attr('fill', '#4b8adb')
      .attr('opacity', 0.6);

    legend
      .append('text')
      .attr('x', 20)
      .attr('y', 14)
      .style('font-size', '11px')
      .text('Host Data Points');
  }, [data]);

  return <svg ref={svgRef} />;
}
