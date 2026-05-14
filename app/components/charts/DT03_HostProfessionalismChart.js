'use client';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

export default function DT03_HostProfessionalismChart({ data }) {
  const svgRef = useRef(null);
  const [hoveredBar, setHoveredBar] = useState(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Container responsive sizing
    const container = svgRef.current?.parentElement;
    if (!container) return;

    const containerWidth = container.clientWidth;
    const margin = { top: 40, right: 30, bottom: 80, left: 70 };
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
      .scaleBand()
      .domain(data.map((d) => d.host_response_time))
      .range([0, width])
      .padding(0.15);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => Math.max(d.avg_listings_count, d.host_count)) * 1.1])
      .range([height, 0]);

    // Tooltip
    const tooltip = d3.select('body').select('.professionalism-tooltip');
    const tip = tooltip.empty()
      ? d3
          .select('body')
          .append('div')
          .attr('class', 'professionalism-tooltip')
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
          .axisLeft(yScale)
          .tickSize(-width)
          .tickFormat('')
      );

    // Subgroups for grouped bars
    const subgroups = ['avg_listings_count', 'host_count'];
    const xSubScale = d3
      .scaleBand()
      .domain(subgroups)
      .range([0, xScale.bandwidth()])
      .padding(0.08);

    // Create groups for each response time
    const groups = g
      .selectAll('g.group')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'group')
      .attr('transform', (d) => `translate(${xScale(d.host_response_time)},0)`);

    // Add bars for avg_listings_count
    groups
      .append('rect')
      .attr('class', 'bar avg-listings')
      .attr('x', (d) => xSubScale('avg_listings_count'))
      .attr('y', (d) => yScale(d.avg_listings_count))
      .attr('width', xSubScale.bandwidth())
      .attr('height', (d) => height - yScale(d.avg_listings_count))
      .attr('fill', '#82ca9d')
      .attr('opacity', 0.8)
      .attr('rx', 3)
      .style('cursor', 'pointer')
      .on('mouseover', function (event, d) {
        d3.select(this).attr('opacity', 1);
        tip
          .style('opacity', 1)
          .html(
            `<strong>${d.host_response_time}</strong><br/>
             Avg Listings: ${d.avg_listings_count.toFixed(2)}`
          )
          .style('left', event.pageX + 10 + 'px')
          .style('top', event.pageY - 10 + 'px');
      })
      .on('mouseout', function () {
        d3.select(this).attr('opacity', 0.8);
        tip.style('opacity', 0);
      });

    // Add bars for host_count
    groups
      .append('rect')
      .attr('class', 'bar host-count')
      .attr('x', (d) => xSubScale('host_count'))
      .attr('y', (d) => yScale(d.host_count))
      .attr('width', xSubScale.bandwidth())
      .attr('height', (d) => height - yScale(d.host_count))
      .attr('fill', '#ffc658')
      .attr('opacity', 0.8)
      .attr('rx', 3)
      .style('cursor', 'pointer')
      .on('mouseover', function (event, d) {
        d3.select(this).attr('opacity', 1);
        tip
          .style('opacity', 1)
          .html(
            `<strong>${d.host_response_time}</strong><br/>
             Host Count: ${d.host_count}`
          )
          .style('left', event.pageX + 10 + 'px')
          .style('top', event.pageY - 10 + 'px');
      })
      .on('mouseout', function () {
        d3.select(this).attr('opacity', 0.8);
        tip.style('opacity', 0);
      });

    // X Axis
    const xAxis = g
      .append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickFormat(''));

    xAxis
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .attr('text-anchor', 'end')
      .style('font-size', '12px')
      .style('fill', '#6b7280');

    // X Axis Label
    svg
      .append('text')
      .attr('x', margin.left + width / 2)
      .attr('y', height + margin.top + 65)
      .attr('text-anchor', 'middle')
      .style('font-size', '13px')
      .style('font-weight', '600')
      .style('fill', '#1f2937')
      .text('Thời gian phản hồi (Response Time)');

    // Y Axis
    const yAxis = g.append('g').call(d3.axisLeft(yScale).ticks(6));

    yAxis
      .selectAll('text')
      .style('font-size', '11px')
      .style('fill', '#6b7280');

    // Y Axis Label
    svg
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0)
      .attr('x', 0 - (height / 2 + margin.top))
      .attr('dy', '1em')
      .attr('text-anchor', 'middle')
      .style('font-size', '13px')
      .style('font-weight', '600')
      .style('fill', '#1f2937')
      .text('Số lượng tài sản trung bình');

    // Legend
    const legend = g
      .append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${width - 180}, -30)`);

    legend
      .append('rect')
      .attr('width', 170)
      .attr('height', 50)
      .attr('fill', 'white')
      .attr('stroke', '#e5e7eb')
      .attr('stroke-width', 1)
      .attr('rx', 4);

    legend
      .append('rect')
      .attr('x', 8)
      .attr('y', 8)
      .attr('width', 12)
      .attr('height', 12)
      .attr('fill', '#82ca9d');

    legend
      .append('text')
      .attr('x', 25)
      .attr('y', 17)
      .style('font-size', '11px')
      .style('fill', '#374151')
      .text('Avg Listings');

    legend
      .append('rect')
      .attr('x', 8)
      .attr('y', 26)
      .attr('width', 12)
      .attr('height', 12)
      .attr('fill', '#ffc658');

    legend
      .append('text')
      .attr('x', 25)
      .attr('y', 35)
      .style('font-size', '11px')
      .style('fill', '#374151')
      .text('Host Count');
  }, [data]);

  return <svg ref={svgRef} />;
}
