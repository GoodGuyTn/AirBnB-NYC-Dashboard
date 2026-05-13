'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export default function StackedBarChart() {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current) {
      return;
    }

    chartRef.current.innerHTML = '';

    const margin = { top: 40, right: 200, bottom: 80, left: 80 };
    const outerWidth = 980;
    const outerHeight = 560;
    const width = outerWidth - margin.left - margin.right;
    const height = outerHeight - margin.top - margin.bottom;

    const root = d3
      .select(chartRef.current)
      .append('div')
      .style('position', 'relative')
      .style('width', '100%');

    const legend = root
      .append('div')
      .style('display', 'flex')
      .style('align-items', 'center')
      .style('gap', '12px')
      .style('flex-wrap', 'wrap')
      .style('margin-bottom', '14px')
      .style('font-size', '14px')
      .style('color', '#334155');

    legend.append('span').style('font-weight', '700').text('Instant Book:');

    const legendItems = [
      { label: 'True', color: '#FF9500' },
      { label: 'False', color: '#3B82F6' },
    ];

    legendItems.forEach((item) => {
      const itemRow = legend.append('div').style('display', 'flex').style('align-items', 'center').style('gap', '8px');

      itemRow
        .append('span')
        .style('width', '14px')
        .style('height', '14px')
        .style('border-radius', '3px')
        .style('background', item.color);

      itemRow.append('span').text(item.label);
    });

    const tooltip = root
      .append('div')
      .style('position', 'absolute')
      .style('padding', '10px 14px')
      .style('background', 'rgba(15, 23, 42, 0.94)')
      .style('color', '#fff')
      .style('border-radius', '8px')
      .style('font-size', '13px')
      .style('pointer-events', 'none')
      .style('opacity', 0)
      .style('z-index', '10')
      .style('line-height', '1.5');

    const svg = root
      .append('svg')
      .attr('viewBox', `0 0 ${outerWidth} ${outerHeight}`)
      .attr('width', '100%')
      .attr('height', 'auto')
      .style('max-width', '100%')
      .style('overflow', 'visible')
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const formatOcc = d3.format('.2f');

    d3.csv('/data/listings.csv')
      .then((raw) => {
        const data = raw.filter((d) => {
          const roomType = (d.room_type || '').trim();
          const occupancy = Number(d.estimated_occupancy_l365d);
          return roomType !== '' && Number.isFinite(occupancy);
        });

        const grouped = d3.group(data, (d) => d.room_type.trim());
        const processedData = Array.from(grouped, ([roomType, rows]) => {
          const bookableGroups = d3.group(rows, (d) => {
            const value = String(d.instant_bookable).trim().toLowerCase();
            return value === 'true' ? 'true' : 'false';
          });

          const entry = { room_type: roomType };

          bookableGroups.forEach((items, bookable) => {
            const avgOccupancy = d3.mean(items, (d) => Number(d.estimated_occupancy_l365d)) || 0;
            entry[bookable] = Number(avgOccupancy.toFixed(2));
          });

          if (entry.true === undefined) entry.true = 0;
          if (entry.false === undefined) entry.false = 0;

          return entry;
        }).sort((a, b) => a.room_type.localeCompare(b.room_type));

        const xScale = d3
          .scaleBand()
          .domain(processedData.map((d) => d.room_type))
          .range([0, width])
          .padding(0.2);

        const yMax = d3.max(processedData, (d) => d.true + d.false) || 0;
        const yScale = d3
          .scaleLinear()
          .domain([0, yMax * 1.1 || 1])
          .nice()
          .range([height, 0]);

        const colorScale = d3
          .scaleOrdinal()
          .domain(['false', 'true'])
          .range(['#3B82F6', '#FF9500']);

        const stack = d3.stack().keys(['false', 'true']);
        const stackedData = stack(processedData);

        svg
          .append('g')
          .attr('transform', `translate(0,${height})`)
          .call(d3.axisBottom(xScale))
          .selectAll('text')
          .style('font-size', '14px')
          .style('fill', '#111827')
          .style('transform', 'none')
          .style('text-anchor', 'middle')
          .style('dominant-baseline', 'hanging');

        svg
          .append('g')
          .call(d3.axisLeft(yScale))
          .selectAll('text')
          .style('font-size', '14px')
          .style('fill', '#111827');

        svg
          .append('text')
          .attr('x', width / 2)
          .attr('y', height + 58)
          .attr('text-anchor', 'middle')
          .style('font-size', '14px')
          .style('font-weight', '700')
          .style('fill', '#111827')
          .text('Room Type');

        svg
          .append('text')
          .attr('transform', 'rotate(-90)')
          .attr('x', -height / 2)
          .attr('y', -54)
          .attr('text-anchor', 'middle')
          .style('font-size', '14px')
          .style('font-weight', '700')
          .style('fill', '#111827')
          .text('AVG(Estimated Occupancy L365D)');

        svg
          .append('g')
          .selectAll('g')
          .data(stackedData)
          .join('g')
          .attr('fill', (d) => colorScale(d.key))
          .selectAll('rect')
          .data((d) => d)
          .join('rect')
          .attr('x', (d) => xScale(d.data.room_type))
          .attr('y', (d) => yScale(d[1]))
          .attr('height', (d) => yScale(d[0]) - yScale(d[1]))
          .attr('width', xScale.bandwidth())
          .attr('rx', 2)
          .on('mouseenter', (event, d) => {
            const key = d3.select(event.currentTarget.parentNode).datum().key;
            const label = key === 'true' ? 'True' : 'False';
            const value = d[1] - d[0];

            tooltip
              .style('opacity', 1)
              .html(`
                <div><strong>Instant Bookable:</strong> ${label}</div>
                <div><strong>Room Type:</strong> ${d.data.room_type}</div>
                <div><strong>Avg. Estimated Occupancy L365D:</strong> ${formatOcc(value)}</div>
              `);

            tooltip
              .style('left', `${event.offsetX + 16}px`)
              .style('top', `${event.offsetY + 16}px`);
          })
          .on('mousemove', (event) => {
            tooltip
              .style('left', `${event.offsetX + 16}px`)
              .style('top', `${event.offsetY + 16}px`);
          })
          .on('mouseleave', () => {
            tooltip.style('opacity', 0);
          });

        svg
          .append('g')
          .selectAll('g')
          .data(stackedData)
          .join('g')
          .attr('fill', (d) => colorScale(d.key))
          .selectAll('text')
          .data((d) => d)
          .join('text')
          .attr('x', (d) => xScale(d.data.room_type) + xScale.bandwidth() / 2)
          .attr('y', (d) => yScale((d[0] + d[1]) / 2))
          .attr('text-anchor', 'middle')
          .attr('dy', '0.35em')
          .attr('fill', 'white')
          .attr('font-weight', '700')
          .attr('font-size', '14px')
          .style('writing-mode', 'horizontal-tb')
          .style('text-orientation', 'mixed')
          .style('transform', 'none')
          .text((d) => {
            const value = d[1] - d[0];
            return value > 5 ? formatOcc(value) : '';
          });

      })
      .catch((error) => {
        d3.select(chartRef.current)
          .append('div')
          .style('padding', '12px 14px')
          .style('color', '#b91c1c')
          .style('font-weight', '600')
          .text(`Cannot load data: ${error.message}`);
      });
  }, []);

  return (
    <div
      ref={chartRef}
      className="w-full"
      style={{
        position: 'relative',
        minHeight: '560px',
      }}
    />
  );
}