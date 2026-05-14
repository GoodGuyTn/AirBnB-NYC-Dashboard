'use client';

import { useEffect, useMemo, useRef } from 'react';
import * as d3 from 'd3';

export default function DT03_HostProfessionalismChart({ data }) {
  const svgRef = useRef(null);

  // Aggregate raw listing data → grouped by host_response_time
  const aggregatedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    const grouped = {};
    data.forEach((row) => {
      const rt = row.host_response_time || 'Unknown';
      const lc = row.host_listings_count || 0;
      if (!grouped[rt]) grouped[rt] = { totalListings: 0, hostCount: 0 };
      grouped[rt].totalListings += lc;
      grouped[rt].hostCount += 1;
    });
    const order = { 'within an hour': 1, 'within a few hours': 2, 'within a day': 3, 'a few days or more': 4, 'Unknown': 5 };
    return Object.entries(grouped)
      .map(([rt, g]) => ({
        host_response_time: rt,
        avg_listings_count: parseFloat((g.totalListings / g.hostCount).toFixed(2)),
        host_count: g.hostCount,
      }))
      .sort((a, b) => (order[a.host_response_time] || 99) - (order[b.host_response_time] || 99));
  }, [data]);

  useEffect(() => {
    if (aggregatedData.length === 0) return;

    const sortedData = [...aggregatedData].sort(
      (a, b) => b.avg_listings_count - a.avg_listings_count
    );

    // Container responsive sizing
    const container = svgRef.current?.parentElement;
    if (!container) return;

    const containerWidth = container.clientWidth;
    const margin = { top: 30, right: 30, bottom: 80, left: 70 };
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

    // Scales
    const xScale = d3
      .scaleBand()
      .domain(sortedData.map((d) => d.host_response_time))
      .range([0, width])
      .padding(0.2);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(sortedData, (d) => d.avg_listings_count) * 1.15])
      .range([height, 0]);

    // Tooltip
    const tooltip = d3.select('body').select('.professionalism-tooltip');
    const tip = tooltip.empty()
      ? d3
          .select('body')
          .append('div')
          .attr('class', 'professionalism-tooltip')
          .style('position', 'absolute')
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

    // Add bars for avg_listings_count (single metric - bar chart)
    g.selectAll('.bar')
      .data(sortedData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d) => xScale(d.host_response_time))
      .attr('y', (d) => yScale(d.avg_listings_count))
      .attr('width', xScale.bandwidth())
      .attr('height', (d) => height - yScale(d.avg_listings_count))
      .attr('fill', '#3b82f6')
      .attr('opacity', 0.8)
      .attr('rx', 3)
      .style('cursor', 'pointer')
      .on('mouseover', function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('opacity', 1)
          .attr('fill', '#2563eb');
          
        tip.transition().duration(200).style('opacity', 1);
        tip
          .html(
            `<div style="font-weight: 600; margin-bottom: 4px; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px;">${d.host_response_time}</div>
             <div style="display: flex; justify-content: space-between; gap: 16px; margin-top: 4px;">
               <span style="color: #6b7280">Avg Listings:</span> 
               <span style="font-weight: 600; color: #2563eb">${d.avg_listings_count.toFixed(2)}</span>
             </div>
             <div style="display: flex; justify-content: space-between; gap: 16px; margin-top: 2px;">
               <span style="color: #6b7280">Total Hosts:</span> 
               <span style="font-weight: 600">${d.host_count.toLocaleString()}</span>
             </div>`
          )
          .style('left', event.pageX + 15 + 'px')
          .style('top', event.pageY - 40 + 'px');
      })
      .on('mousemove', function (event) {
        tip
          .style('left', event.pageX + 15 + 'px')
          .style('top', event.pageY - 40 + 'px');
      })
      .on('mouseout', function () {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('opacity', 0.8)
          .attr('fill', '#3b82f6');
          
        tip.transition().duration(200).style('opacity', 0);
      });

    // X Axis
    const xAxis = g
      .append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale));

    xAxis
      .selectAll('text')
      .attr('transform', 'rotate(0)')
      .attr('text-anchor', 'middle')
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
      .attr('transform', `translate(${width - 140}, -25)`);

    legend
      .append('rect')
      .attr('width', 130)
      .attr('height', 35)
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
      .attr('fill', '#3b82f6');

    legend
      .append('text')
      .attr('x', 25)
      .attr('y', 17)
      .style('font-size', '11px')
      .style('fill', '#374151')
      .text('Avg Host Listings');
  }, [aggregatedData]);

  return <svg ref={svgRef} />;
}
