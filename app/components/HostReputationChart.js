'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export default function HostReputationChart({ data }) {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Dimensions
    const margin = { top: 30, right: 30, bottom: 50, left: 60 };
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
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.number_of_reviews)])
      .range([0, width]);

    const yScale = d3
      .scaleLinear()
      .domain([0, 5])
      .range([height, 0]);

    // Color scale
    const colorScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.review_scores_rating)])
      .range(['#fdd49e', '#bd0026']);

    // X Axis
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .append('text')
      .attr('x', width / 2)
      .attr('y', 40)
      .attr('fill', 'black')
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .text('Số lượng bài đánh giá (Number of Reviews)');

    // Y Axis
    g.append('g')
      .call(d3.axisLeft(yScale))
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - height / 2)
      .attr('dy', '1em')
      .attr('fill', 'black')
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .text('Điểm xếp hạng trung bình (Rating)');

    // Grid lines (optional)
    g.append('g')
      .attr('class', 'grid')
      .attr('opacity', 0.1)
      .call(
        d3
          .axisLeft(yScale)
          .tickSize(-width)
          .tickFormat('')
      );

    // Scatter points
    g.selectAll('.dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', (d) => xScale(d.number_of_reviews))
      .attr('cy', (d) => yScale(d.review_scores_rating))
      .attr('r', 5)
      .attr('fill', (d) => colorScale(d.review_scores_rating))
      .attr('opacity', 0.7)
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)
      .style('cursor', 'pointer')
      .on('mouseover', function (event, d) {
        d3.select(this).attr('r', 7).attr('opacity', 1);
        // Tooltip
        svg
          .append('text')
          .attr('class', 'tooltip')
          .attr('x', margin.left + xScale(d.number_of_reviews))
          .attr('y', margin.top + yScale(d.review_scores_rating) - 15)
          .attr('text-anchor', 'middle')
          .style('background', '#f5f5f5')
          .style('padding', '5px')
          .style('border-radius', '4px')
          .style('font-size', '12px')
          .style('pointer-events', 'none')
          .text(
            `${d.host_name} - ${d.number_of_reviews} reviews, Rating: ${d.review_scores_rating.toFixed(
              2
            )}`
          );
      })
      .on('mouseout', function (event, d) {
        d3.select(this).attr('r', 5).attr('opacity', 0.7);
        svg.selectAll('.tooltip').remove();
      });

    // Legend
    const legend = svg
      .append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${width - 150},${margin.top})`);

    legend
      .append('rect')
      .attr('width', 150)
      .attr('height', 80)
      .attr('fill', 'white')
      .attr('stroke', '#ccc')
      .attr('stroke-width', 1)
      .attr('rx', 4);

    legend
      .append('text')
      .attr('x', 10)
      .attr('y', 20)
      .style('font-weight', 'bold')
      .style('font-size', '12px')
      .text('Chủ nhà');

    legend
      .append('circle')
      .attr('cx', 15)
      .attr('cy', 40)
      .attr('r', 4)
      .attr('fill', '#fdd49e');

    legend
      .append('text')
      .attr('x', 30)
      .attr('y', 45)
      .style('font-size', '11px')
      .text('Rating thấp');

    legend
      .append('circle')
      .attr('cx', 15)
      .attr('cy', 60)
      .attr('r', 4)
      .attr('fill', '#bd0026');

    legend
      .append('text')
      .attr('x', 30)
      .attr('y', 65)
      .style('font-size', '11px')
      .text('Rating cao');
  }, [data]);

  return (
    <div className="chart-container">
      <h2>Phân tích uy tín chủ nhà (Host Reputation Analysis)</h2>
      <p className="chart-description">
        Mối liên hệ giữa số lượng bài đánh giá (Number of reviews) và điểm xếp hạng trung bình (Review scores rating)
      </p>
      <svg ref={svgRef} style={{ width: '100%', height: 'auto' }}></svg>
      <div className="chart-insights">
        <h3>Phân tích:</h3>
        <ul>
          <li>📍 <strong>Extremes (Cực trị):</strong> Tìm ra những chủ nhà có điểm đánh giá cao nhất (điểm {'>='} 4.8)</li>
          <li>📊 <strong>Correlation (Tương quan):</strong> Phân tích xem liệu những chủ nhà có nhiều lượt review thì điểm số có ổn định và cao hơn hay không</li>
          <li>✨ <strong>Khám phá:</strong> Nhập chuộc nhóm chủ nhà có hiệu suất phục vụ tốt dựa trên phản hồi thực tế của người dùng</li>
        </ul>
      </div>
    </div>
  );
}
