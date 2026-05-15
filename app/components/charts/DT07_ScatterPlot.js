'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export default function ScatterPlot() {
  const chartRef = useRef(null);

  useEffect(() => {
    const margin = { top: 20, right: 24, bottom: 58, left: 78 };
    const outerWidth = 1080;
    const outerHeight = 600;
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
        const yAxis = d3.axisLeft(y).ticks(8).tickFormat((d) => formatRev(d));

        const xAxisG = svg
          .append('g')
          .attr('class', 'axis axis-x')
          .attr('transform', `translate(0,${height})`);

        const yAxisG = svg.append('g').attr('class', 'axis axis-y');

        const gridX = svg
          .append('g')
          .attr('class', 'grid grid-x')
          .attr('transform', `translate(0,${height})`);

        const gridY = svg.append('g').attr('class', 'grid grid-y');

        const plotArea = svg.append('g').attr('class', 'plot-area');

        const pointsLayer = plotArea.append('g').attr('class', 'points-layer');

        const zoom = d3
          .zoom()
          .scaleExtent([1, 7])
          .extent([
            [0, 0],
            [width, height],
          ])
          .translateExtent([
            [0, 0],
            [width, height],
          ])
          .on('zoom', (event) => {
            const transform = event.transform;
            const zx = transform.rescaleX(x);
            const zy = transform.rescaleY(y);
            const showLabels = transform.k >= 2.2;

            gridX.call(
              d3
                .axisBottom(zx)
                .ticks(8)
                .tickSize(-height)
                .tickFormat('')
            );

            gridY.call(
              d3
                .axisLeft(zy)
                .ticks(8)
                .tickSize(-width)
                .tickFormat('')
            );

            xAxisG.call(d3.axisBottom(zx).ticks(8));
            yAxisG.call(d3.axisLeft(zy).ticks(8).tickFormat((d) => formatRev(d)));

            xAxisG.selectAll('text').style('fill', '#111827').style('font-size', '12px');
            yAxisG.selectAll('text').style('fill', '#111827').style('font-size', '12px');

            pointsLayer.selectAll('circle').attr('cx', (d) => zx(d.avgOccupancy)).attr('cy', (d) => zy(d.avgRevenue));
            pointsLayer
              .selectAll('text.point-label')
              .attr('x', (d) => zx(d.avgOccupancy))
              .attr('y', (d) => zy(d.avgRevenue) + 16)
              .style('opacity', showLabels ? 1 : 0);
          });

        const zoomToPoint = (d) => {
          const targetScale = 3.2;
          const xCenter = width / 2;
          const yCenter = height / 2;
          const xPoint = x(d.avgOccupancy);
          const yPoint = y(d.avgRevenue);

          const transform = d3.zoomIdentity
            .translate(xCenter, yCenter)
            .scale(targetScale)
            .translate(-xPoint, -yPoint);

          svgElement
            .transition()
            .duration(750)
            .ease(d3.easeCubicOut)
            .call(zoom.transform, transform);
        };

        const resetZoom = () => {
          svgElement
            .transition()
            .duration(650)
            .ease(d3.easeCubicOut)
            .call(zoom.transform, d3.zoomIdentity);
        };

        const svgElement = d3.select(chartRef.current).select('svg');

        svgElement.call(zoom).on('click', (event) => {
          if (event.target.tagName === 'circle') {
            return;
          }

          resetZoom();
        });

        // Grid
        gridX
          .call(
            d3
              .axisBottom(x)
              .ticks(8)
              .tickSize(-height)
              .tickFormat('')
          )
          .style('stroke', '#e5e7eb')
          .style('stroke-dasharray', '3 3');

        gridY
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
        xAxisG.call(xAxis)
          .style('stroke', '#4b5563')
          .selectAll('text')
          .style('fill', '#111827')
          .style('font-size', '12px');

        yAxisG.call(yAxis)
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
        pointsLayer
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
                  <span style="color: #6b7280; font-size: 14px;">Neighbourhood cleansed:</span>
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
          })
          .on('click', (event, d) => {
            event.stopPropagation();
            zoomToPoint(d);
          });

        pointsLayer
          .selectAll('text.point-label')
          .data(data)
          .join('text')
          .attr('class', 'point-label')
          .attr('x', (d) => x(d.avgOccupancy))
          .attr('y', (d) => y(d.avgRevenue) + 16)
          .attr('text-anchor', 'middle')
          .style('fill', '#374151')
          .style('font-size', '10px')
          .style('font-weight', '600')
          .style('pointer-events', 'none')
          .style('opacity', 0)
          .style('transition', 'opacity 120ms ease')
          .text((d) => d.neighbourhood);
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
        minHeight: '350px',
      }}
    />
  );
}
