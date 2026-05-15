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

    const margin = { top: 30, right: 160, bottom: 64, left: 72 };
    const outerWidth = 980;
    const outerHeight = 470;
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

    legend.append('span').style('font-weight', '700').text('Instant Bookable:');

    const legendItems = [
      { label: 'True', color: '#FF9500' },
      { label: 'False', color: '#3B82F6' },
    ];

    const legendItemNodes = new Map();

    legendItems.forEach((item) => {
      const itemRow = legend
        .append('div')
        .style('display', 'flex')
        .style('align-items', 'center')
        .style('gap', '8px')
        .style('cursor', 'pointer')
        .style('transition', 'opacity 160ms ease, transform 160ms ease');

      itemRow
        .append('span')
        .style('width', '14px')
        .style('height', '14px')
        .style('border-radius', '3px')
        .style('background', item.color);

      itemRow.append('span').text(item.label);

      legendItemNodes.set(item.label.toLowerCase(), itemRow);
    });

    const tooltip = root
      .append('div')
      .style('position', 'absolute')
      .style('padding', '10px 14px')
      .style('background', '#ffffff')
      .style('color', '#1f2937')
      .style('border', '1px solid #e2e8f0')
      .style('border-radius', '8px')
      .style('font-size', '13px')
      .style('pointer-events', 'none')
      .style('opacity', 0)
      .style('z-index', '10')
      .style('box-shadow', '0 4px 12px rgba(0,0,0,0.1)')
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
    let selectedKey = null;
    let barSelection = null;

    const updateBarStyles = () => {
      if (!barSelection) {
        return;
      }

      barSelection
        .style('opacity', function () {
          const key = d3.select(this.parentNode).datum().key;

          if (!selectedKey) {
            return 1;
          }

          return key === selectedKey ? 1 : 0.24;
        })
        .style('stroke', function () {
          const key = d3.select(this.parentNode).datum().key;
          return key === selectedKey ? '#0f172a' : 'none';
        })
        .style('stroke-width', function () {
          const key = d3.select(this.parentNode).datum().key;
          return key === selectedKey ? 2 : 0;
        })
        .style('filter', function () {
          const key = d3.select(this.parentNode).datum().key;
          return key === selectedKey ? 'drop-shadow(0 4px 10px rgba(15, 23, 42, 0.18))' : 'none';
        });
    };

    const updateLegendStyles = () => {
      legendItemNodes.forEach((itemNode, key) => {
        itemNode
          .style('opacity', !selectedKey || selectedKey === key ? 1 : 0.38)
          .style('transform', selectedKey === key ? 'translateY(-1px)' : 'translateY(0)');
      });
    };

    const setSelection = (nextKey) => {
      selectedKey = nextKey;
      updateBarStyles();
      updateLegendStyles();
    };

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

        barSelection = svg
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
          .style('cursor', 'pointer')
          .on('mouseenter', (event, d) => {
            const key = d3.select(event.currentTarget.parentNode).datum().key;
            const label = key === 'true' ? 'True' : 'False';
            const value = d[1] - d[0];

            tooltip
              .style('opacity', 1)
              .html(`
                <div style="font-weight:700;margin-bottom:4px;border-bottom:1px solid #e5e7eb;padding-bottom:4px;">${d.data.room_type}</div>
                <div style="display:flex;justify-content:space-between;gap:16px;margin-top:4px;"><span style="color:#6b7280">Instant Bookable:</span><span style="font-weight:600;color:${key === 'true' ? '#d97706' : '#2563eb'}">${label}</span></div>
                <div style="display:flex;justify-content:space-between;gap:16px;margin-top:2px;"><span style="color:#6b7280">Avg. Occupancy L365D:</span><span style="font-weight:600">${formatOcc(value)}</span></div>
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
          })
          .on('click', (event, d) => {
            event.stopPropagation();
            const key = d3.select(event.currentTarget.parentNode).datum().key;
            const label = key === 'true' ? 'True' : 'False';
            const value = d[1] - d[0];

            setSelection(selectedKey === key ? null : key);

            tooltip
              .style('opacity', 1)
              .html(`
                <div style="font-weight:700;margin-bottom:4px;border-bottom:1px solid #e5e7eb;padding-bottom:4px;">${d.data.room_type}</div>
                <div style="display:flex;justify-content:space-between;gap:16px;margin-top:4px;"><span style="color:#6b7280">Đặt tức thì:</span><span style="font-weight:600;color:${key === 'true' ? '#d97706' : '#2563eb'}">${label}</span></div>
                <div style="display:flex;justify-content:space-between;gap:16px;margin-top:2px;"><span style="color:#6b7280">TB chiếm dụng (365 ngày):</span><span style="font-weight:600">${formatOcc(value)}</span></div>
              `);
            tooltip
              .style('left', `${event.offsetX + 16}px`)
              .style('top', `${event.offsetY + 16}px`);
          });

        svg.on('click', () => {
          if (!selectedKey) {
            return;
          }

          selectedKey = null;
          updateBarStyles();
          updateLegendStyles();
          tooltip.style('opacity', 0);
        });

        legendItemNodes.forEach((itemNode, key) => {
          itemNode.on('click', () => {
            setSelection(selectedKey === key ? null : key);
          });
        });

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
          .text('Loại phòng');

        svg
          .append('text')
          .attr('transform', 'rotate(-90)')
          .attr('x', -height / 2)
          .attr('y', -54)
          .attr('text-anchor', 'middle')
          .style('font-size', '14px')
          .style('font-weight', '700')
          .style('fill', '#111827')
          .text('Avg. Estimated Occupancy L365D');

        updateBarStyles();
        updateLegendStyles();

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
        minHeight: '350px',
      }}
    />
  );
}
