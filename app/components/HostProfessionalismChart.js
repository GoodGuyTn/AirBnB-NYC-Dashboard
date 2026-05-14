'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export default function HostProfessionalismChart({ data }) {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Dimensions
    const margin = { top: 30, right: 30, bottom: 100, left: 60 };
    const width = 900 - margin.left - margin.right;
    const height = 450 - margin.top - margin.bottom;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    // Create SVG
    const svg = d3
      .select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .style('background-color', '#fff')
      .style('border-radius', '8px')
      .style('box-shadow', '0 2px 8px rgba(0, 0, 0, 0.1)');

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3
      .scaleBand()
      .domain(data.map((d) => d.host_response_time))
      .range([0, width])
      .padding(0.2);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.avg_listings_count) * 1.1])
      .range([height, 0]);

    const colorScale = d3.scaleOrdinal().domain(['avg_listings_count', 'host_count']).range(['#82ca9d', '#ffc658']);

    // X Axis
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .attr('text-anchor', 'end')
      .style('font-size', '12px');

    // Add X Axis label
    svg
      .append('text')
      .attr('x', margin.left + width / 2)
      .attr('y', height + margin.top + 80)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('fill', 'black')
      .text('Thời gian phản hồi (Response Time)');

    // Y Axis
    g.append('g').call(d3.axisLeft(yScale));

    // Add Y Axis label
    svg
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0)
      .attr('x', 0 - (height / 2 + margin.top))
      .attr('dy', '1em')
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('fill', 'black')
      .text('Số lượng tài sản trung bình');

    // Grid lines
    g.append('g')
      .attr('class', 'grid')
      .attr('opacity', 0.1)
      .call(
        d3
          .axisLeft(yScale)
          .tickSize(-width)
          .tickFormat('')
      );

    // Subgroups
    const subgroups = ['avg_listings_count', 'host_count'];
    const xSubScale = d3
      .scaleBand()
      .domain(subgroups)
      .range([0, xScale.bandwidth()])
      .padding(0.05);

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
      .attr('x', (d) => xSubScale('avg_listings_count'))
      .attr('y', (d) => yScale(d.avg_listings_count))
      .attr('width', xSubScale.bandwidth())
      .attr('height', (d) => height - yScale(d.avg_listings_count))
      .attr('fill', '#82ca9d')
      .attr('opacity', 0.8)
      .style('cursor', 'pointer')
      .on('mouseover', function (event, d) {
        d3.select(this).attr('opacity', 1);
      })
      .on('mouseout', function (event, d) {
        d3.select(this).attr('opacity', 0.8);
      });

    // Add bars for host_count (scaled for visibility)
    const hostCountScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.host_count)])
      .range([0, d3.max(data, (d) => d.avg_listings_count) * 1.1]);

    groups
      .append('rect')
      .attr('x', (d) => xSubScale('host_count'))
      .attr('y', (d) => yScale(hostCountScale(d.host_count)))
      .attr('width', xSubScale.bandwidth())
      .attr('height', (d) => height - yScale(hostCountScale(d.host_count)))
      .attr('fill', '#ffc658')
      .attr('opacity', 0.8)
      .style('cursor', 'pointer')
      .on('mouseover', function (event, d) {
        d3.select(this).attr('opacity', 1);
      })
      .on('mouseout', function (event, d) {
        d3.select(this).attr('opacity', 0.8);
      });

    // Legend
    const legend = svg
      .append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const legendItems = legend
      .selectAll('.legend-item')
      .data(subgroups)
      .enter()
      .append('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => `translate(0, ${i * 25})`);

    legendItems
      .append('rect')
      .attr('width', 18)
      .attr('height', 18)
      .attr('fill', (d) => colorScale(d));

    legendItems
      .append('text')
      .attr('x', 25)
      .attr('y', 9)
      .attr('dy', '.35em')
      .style('font-size', '12px')
      .text((d) => (d === 'avg_listings_count' ? 'Số tài sản trung bình' : 'Số lượng chủ nhà'));
  }, [data]);

  return (
    <div className="chart-container">
      <h2>Phân tích mức độ chuyên nghiệp của chủ nhà (Host Professionalism Analysis)</h2>
      <p className="chart-description">
        Mối quan hệ giữa thời gian phản hồi (host_response_time) và số lượng tài sản sở hữu (host_listings_count)
      </p>
      <svg ref={svgRef} style={{ width: '100%', height: 'auto' }}></svg>
      <div className="chart-insights">
        <h3>Phân tích:</h3>
        <ul>
          <li>📊 <strong>Dependency (Phụ thuộc):</strong> Tìm sự tương quan giữa số tài sản sở hữu và thời gian phản hồi</li>
          <li>🔍 <strong>Compare (So sánh):</strong> So sánh thời gian phản hồi trung bình giữa các chủ nhà quản lý quy mô khác nhau</li>
          <li>👥 <strong>Discover (Khám phá):</strong> Tìm ra nhóm chủ nhà quản lý chuyên nghiệp trong các chủ nhà</li>
          <li>💡 <strong>Insight:</strong> Các chủ nhà sở hữu nhiều bất động sản có duy trì được tốc độ tương tác chuyên nghiệp với khách hàng hay không</li>
        </ul>
      </div>
    </div>
  );
}
