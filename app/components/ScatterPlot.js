'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export default function ScatterPlot() {
  const chartRef = useRef(null);

  useEffect(() => {
    const margin = { top: 24, right: 28, bottom: 70, left: 88 };
    const outerWidth = 1080;
    const outerHeight = 620;
    const width = outerWidth - margin.left - margin.right;
    const height = outerHeight - margin.top - margin.bottom;

    // Clear previous content
    if (chartRef.current) {
      chartRef.current.innerHTML = '';
    }

    const svg = d3
      .select(chartRef.current)
      .append('svg')
      .attr('viewBox', `0 0 ${outerWidth} ${outerHeight}`)
      .attr('width', '100%')
      .attr('height', 'auto')
      .attr('style', 'max-width: 100%; height: auto;')
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const tooltip = d3
      .select(chartRef.current)
      .append('div')
      .style('position', 'absolute')
      .style('background', '#ffffff')
      .style('border', '1px solid #d1d5db')
      .style('box-shadow', '0 10px 25px rgba(17, 24, 39, 0.18)')
      .style('border-radius', '8px')
      .style('padding', '10px 12px')
      .style('min-width', '330px')
      .style('pointer-events', 'none')
      .style('opacity', 0)
      .style('transition', 'opacity 100ms ease')
      .style('line-height', '1.35')
      .style('font-family', 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif')
      .style('font-size', '14px')
      .style('z-index', '1000');

    const formatOcc = d3.format('.1f');
    const formatRev = d3.format(',.0f');

    d3.csv('/data/listings.csv')
      .then((raw) => {
        const valid = raw.filter((d) => {
          const occ = Number(d.estimated_occupancy_l365d);
          const rev = Number(d.estimated_revenue_l365d);
          const neighborhood = (d.neighbourhood_cleansed || '').trim();
          return Number.isFinite(occ) && Number.isFinite(rev) && neighborhood !== '';
        });

        const grouped = d3.group(valid, (d) => d.neighbourhood_cleansed.trim());
        const data = Array.from(grouped, ([neighbourhood, rows]) => ({
          neighbourhood,
          avgOccupancy: d3.mean(rows, (d) => Number(d.estimated_occupancy_l365d)),
          avgRevenue: d3.mean(rows, (d) => Number(d.estimated_revenue_l365d)),
        })).filter((d) => Number.isFinite(d.avgOccupancy) && Number.isFinite(d.avgRevenue));

        const xExtent = d3.extent(data, (d) => d.avgOccupancy);
        const yExtent = d3.extent(data, (d) => d.avgRevenue);

        const xPad = (xExtent[1] - xExtent[0]) * 0.08 || 1;
        const yPad = (yExtent[1] - yExtent[0]) * 0.08 || 1;

        const x = d3
          .scaleLinear()
          .domain([Math.max(0, xExtent[0] - xPad), xExtent[1] + xPad])
          .range([0, width]);

        const y = d3
          .scaleLinear()
          .domain([Math.max(0, yExtent[0] - yPad), yExtent[1] + yPad])
          .range([height, 0]);

        const xAxis = d3.axisBottom(x).ticks(8);
        const yAxis = d3
          .axisLeft(y)
          .ticks(8)
          .tickFormat((d) => formatRev(d));

        // Grid
        svg
          .append('g')
          .attr('class', 'grid')
          .attr('transform', `translate(0,${height})`)
          .call(
            d3
              .axisBottom(x)
              .ticks(8)
              .tickSize(-height)
              .tickFormat('')
          )
          .style('stroke', '#e5e7eb')
          .style('stroke-dasharray', '3 3');

        svg
          .append('g')
          .attr('class', 'grid')
          .call(
            d3
              .axisLeft(y)
              .ticks(8)
              .tickSize(-width)
              .tickFormat('')
          )
          .style('stroke', '#e5e7eb')
          .style('stroke-dasharray', '3 3');

        // Axes
        svg
          .append('g')
          .attr('class', 'axis')
          .attr('transform', `translate(0,${height})`)
          .call(xAxis)
          .style('stroke', '#4b5563')
          .selectAll('text')
          .style('fill', '#111827')
          .style('font-size', '12px');

        svg
          .append('g')
          .attr('class', 'axis')
          .call(yAxis)
          .style('stroke', '#4b5563')
          .selectAll('text')
          .style('fill', '#111827')
          .style('font-size', '12px');

        // Axis labels
        svg
          .append('text')
          .attr('class', 'axis-label')
          .attr('x', width / 2)
          .attr('y', height + 48)
          .attr('text-anchor', 'middle')
          .style('font-size', '13px')
          .style('font-weight', '600')
          .style('fill', '#111827')
          .text('AVG(Estimated Occupancy L365D)');

        svg
          .append('text')
          .attr('class', 'axis-label')
          .attr('transform', 'rotate(-90)')
          .attr('x', -height / 2)
          .attr('y', -58)
          .attr('text-anchor', 'middle')
          .style('font-size', '13px')
          .style('font-weight', '600')
          .style('fill', '#111827')
          .text('AVG(Estimated Revenue L365D)');

        // Points
        svg
          .append('g')
          .selectAll('circle')
          .data(data)
          .join('circle')
          .attr('class', 'point')
          .attr('cx', (d) => x(d.avgOccupancy))
          .attr('cy', (d) => y(d.avgRevenue))
          .attr('r', 5.5)
          .attr('fill', 'none')
          .attr('stroke', '#4f7fb5')
          .attr('stroke-width', 2)
          .style('opacity', 0.82)
          .style('cursor', 'pointer')
          .on('mouseenter', (event, d) => {
            tooltip
              .style('opacity', 1)
              .html(`
                <div style="display: grid; grid-template-columns: 1fr auto; gap: 12px; align-items: baseline; margin-bottom: 8px;">
                  <span style="color: #6b7280; font-size: 14px;">Neighbourhood:</span>
                  <span style="color: #111827; font-size: 14px; font-weight: 700;">${d.neighbourhood}</span>
                </div>
                <div style="display: grid; grid-template-columns: 1fr auto; gap: 12px; align-items: baseline; margin-bottom: 8px;">
                  <span style="color: #6b7280; font-size: 14px;">Avg. Occupancy L365D:</span>
                  <span style="color: #111827; font-size: 14px; font-weight: 700;">${formatOcc(d.avgOccupancy)}%</span>
                </div>
                <div style="display: grid; grid-template-columns: 1fr auto; gap: 12px; align-items: baseline;">
                  <span style="color: #6b7280; font-size: 14px;">Avg. Revenue L365D:</span>
                  <span style="color: #111827; font-size: 14px; font-weight: 700;">$${formatRev(d.avgRevenue)}</span>
                </div>
              `);
          })
          .on('mousemove', (event) => {
            const tipNode = tooltip.node();
            const chartNode = chartRef.current;
            const tipWidth = tipNode ? tipNode.offsetWidth : 0;
            const tipHeight = tipNode ? tipNode.offsetHeight : 0;
            const chartRect = chartNode.getBoundingClientRect();

            let xPos = event.clientX - chartRect.left + 16;
            let yPos = event.clientY - chartRect.top + 16;

            if (xPos + tipWidth > chartRect.width - 8) {
              xPos = xPos - tipWidth - 24;
            }
            if (yPos + tipHeight > chartRect.height - 8) {
              yPos = yPos - tipHeight - 24;
            }

            tooltip
              .style('left', `${Math.max(8, xPos)}px`)
              .style('top', `${Math.max(8, yPos)}px`);
          })
          .on('mouseleave', () => {
            tooltip.style('opacity', 0);
          });
      })
      .catch((err) => {
        d3.select(chartRef.current)
          .append('p')
          .style('color', '#b91c1c')
          .style('font-weight', '600')
          .text(`Cannot load data: ${err.message}`);
      });
  }, []);

  return (
    <div
      ref={chartRef}
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '650px',
      }}
    />
  );
}
