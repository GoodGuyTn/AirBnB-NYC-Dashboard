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
    const margin = { top: 36, right: 20, bottom: 60, left: 70 };
    const width = containerWidth - margin.left - margin.right;
    const height = 420 - margin.top - margin.bottom;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    // Create SVG
    const svg = d3
      .select(svgRef.current)
      .attr('width', containerWidth)
      .attr('height', 420)
      .style('background-color', '#fff')
      .style('border-radius', '8px');

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.number_of_reviews || 0)])
      .range([0, width]);

    const yScale = d3
      .scaleLinear()
      .domain([0, 5])
      .range([height, 0]);

    // Color scale from yellow to red
    const colorScale = d3
      .scaleLinear()
      .domain([0, 3, 5])
      .range(['#fdd49e', '#fc8d59', '#bd0026']);

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
      .attr('cx', (d) => xScale(d.number_of_reviews || 0))
      .attr('cy', (d) => yScale(d.review_scores_rating || 0))
      .attr('r', 5)
      .attr('fill', (d) => colorScale(d.review_scores_rating || 0))
      .attr('opacity', 0.7)
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)
      .on('mouseover', function (event, d) {
        d3.select(this)
          .attr('r', 8)
          .attr('opacity', 1)
          .attr('stroke-width', 2);

        tip
          .style('opacity', 1)
          .html(
            `<strong>${d.host_name || 'Unknown'}</strong><br/>
             Reviews: ${d.number_of_reviews}<br/>
             Rating: ${d.review_scores_rating?.toFixed(2)}/5`
          )
          .style('left', event.pageX + 10 + 'px')
          .style('top', event.pageY - 10 + 'px');
      })
      .on('mouseout', function () {
        d3.select(this)
          .attr('r', 5)
          .attr('opacity', 0.7)
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
      .text('Số lượng bài đánh giá');

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
      .text('Điểm xếp hạng (Rating)');

    // Legend
    const legend = g
      .append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${width - 150}, -25)`);

    legend
      .append('rect')
      .attr('width', 140)
      .attr('height', 50)
      .attr('fill', 'white')
      .attr('stroke', '#e5e7eb')
      .attr('stroke-width', 1)
      .attr('rx', 4);

    legend
      .append('circle')
      .attr('cx', 10)
      .attr('cy', 12)
      .attr('r', 4)
      .attr('fill', '#fdd49e');

    legend
      .append('text')
      .attr('x', 20)
      .attr('y', 16)
      .style('font-size', '11px')
      .text('Rating thấp');

    legend
      .append('circle')
      .attr('cx', 10)
      .attr('cy', 30)
      .attr('r', 4)
      .attr('fill', '#bd0026');

    legend
      .append('text')
      .attr('x', 20)
      .attr('y', 34)
      .style('font-size', '11px')
      .text('Rating cao');
  }, [data]);

  return <svg ref={svgRef} />;
}
