import * as d3 from 'd3';
import { HbarChartProps } from './hbar-chart';
import { Theme } from '@material-ui/core';

const drawHBarChart = (props: HbarChartProps, element: SVGSVGElement | null, theme: Theme) => {
    const data = props.data;
    const margin = { top: 20, right: 20, bottom: 10, left: 70 };
    const width = props.width - margin.left - margin.right;
    const height = props.height - margin.top - margin.bottom;

    const x = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.v) as number])
        .range([0, width]);

    const y = d3.scaleBand()
        .domain(data.map(d => d.k))
        .rangeRound([margin.top, height - margin.bottom])
        .padding(0.1)

    const xAxis = g => g
        .attr("transform", `translate(${margin.left}, ${margin.top})`)
        .call(d3.axisTop(x).ticks(width / 80))
        .call(g => g.select(".domain").remove());

    const yAxis = g => g
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).tickFormat((d, i) => d).tickSizeOuter(0));

    const format = x.tickFormat(20);

    const svg = d3.select(element).attr("height", props.height).attr("width", props.width);
    svg.selectAll("*").remove();

    svg.append("g")
        .selectAll("rect")
        .data(data)
        .join("rect")
        .attr('fill', theme.palette.primary.main)
        .attr("x", (x(0) as number) + margin.left)
        .attr("y", (d, i) => y(d.k) as number)
        .attr("width", d => x(d.v) as number)
        .attr("height", y.bandwidth());

    svg.append("g")
        .attr("fill", "white")
        .attr("text-anchor", "end")
        .attr("font-family", "sans-serif")
        .attr("font-size", 12)
        .selectAll("text")
        .data(data)
        .join("text")
        .attr("x", d => (x(d.v) as number) + margin.left - 4)
        .attr("y", (d, i) => (y(d.k) as number) + y.bandwidth() / 2)
        .attr("dy", "0.35em")
        .text(d => canDisplay(d.v, x(d.v) as number) ? format(d.v) : "");

    svg.append("g")
        .call(xAxis);

    svg.append("g")
        .call(yAxis);
}

const canDisplay = (n: number, max: number) => {
    const numberWidth = measureWidth(n.toString());

    return numberWidth < max - 4;
}

const measureWidth = (text: string) => {
    const context = document.createElement("canvas").getContext("2d");
    if (context != null) {
        context.font = "12px sans-serif";
    }
    return context != null ? context.measureText(text).width : 0;
}

export default drawHBarChart;