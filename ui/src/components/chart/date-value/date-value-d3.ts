
import { DateValueChartProps } from './date-value';
import { Theme } from '@material-ui/core';
import { DateValueModel } from '../../../models/datevalue';
import * as d3 from 'd3';
import './date-value.css';

const drawHBarChart = (props: DateValueChartProps, element: HTMLDivElement | null, theme: Theme) => {
    const data = props.data;
    const average: [number, number][] = sevenDayRollingAverage(data);
    let maxY = undefined;
    const margin = {top: 0, right: 16, bottom: 16, left: 40};
    const width = props.width - margin.left - margin.right;
    const height = props.height - margin.top - margin.bottom;

    const div = d3.select(element);
    div.selectAll("*").remove();
    const svg = div.append('svg')
        .attr('width', props.width)
        .attr('height', props.height);
    

    let startDate = new Date(data[0].date);
    let endDate = new Date(data[data.length - 1].date);

    const xLine = d3.scaleUtc()
        .domain(d3.extent(average, d => d[0]))
        .range([0, width])

    const yLine = d3.scaleLinear()
        .domain([0, d3.max(data, d => {
            if (typeof (maxY) == 'undefined') {
                return d.value
            }
            return d.value > maxY ? maxY : d.value;
        })])
        .range([height, margin.top])

    const line = d3.line()
        .x(d => xLine(d[0]))
        .y(d => yLine(d[1]))

    const x = d3.scaleBand()
        .range([0, width])
        .paddingInner(0.1)
        .align(0)
        .domain(data.map((d, i) => i.toString()));

    const xAxis = d3.scaleTime()
        .domain([startDate, endDate])
        .range([0, (x.step() * (data.length - 1))]);

    const y = d3.scaleLinear()
        .rangeRound([height, 0])
        .domain([0, d3.max(data, d => {
            if (typeof (maxY) == 'undefined') {
                return d.value
            }
            return d.value > maxY ? maxY : d.value;
        })]);

    let tooltip = d3.select(element).append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    const g = svg.append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

    g.append('g')
        .attr('class', 'axis axis--y')
        .call(d3.axisLeft(y).ticks(10))
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 6)
        .attr('dy', '0.71em')
        .attr('text-anchor', 'end')
        .text('Count');

    g.selectAll('.chart-primary')
        .data(data)
        .enter().append('rect')
        .attr('fill', theme.palette.primary.main)
        .attr('x', (d, i) => x(i.toString()))
        .attr('y', d => {
            if (typeof (maxY) == 'undefined') {
                return y(d.value);
            }
            return y(d.value > maxY ? maxY : d.value)
        })
        .attr('width', x.bandwidth)
        .attr('height', d => {
            if (typeof (maxY) == 'undefined') {
                return (height - y(d.value)) < 0 ? 0 : (height - y(d.value));
            }
            return height - y(d.value > maxY ? maxY : d.value)
        })
        .attr('transform', 'translate(0,0)')
        .on("mouseover", (e, d) => {
            let eunknown = e as unknown;
            let event = eunknown as MouseEvent;
            let dunknown = d as unknown;
            let data = dunknown as DateValueModel;
            let coords = [event.clientX, event.clientY];
            showTooltip(data, tooltip, svg, props.width, coords);
        })//showTooltip(d, tooltip, svg, width))					
        .on("mouseout", d => hideTooltip(tooltip));

    g.append("path")
        .datum(average)
        .attr("fill", "none")
        .attr("stroke", "darkgrey")
        .attr("stroke-width", 2)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("d", line);

    g.append('g')
        .attr('class', 'axis axis--x')
        .attr('transform', `translate(${x.bandwidth() / 2}, ${height})`)
        .call(d3.axisBottom(xAxis).ticks(5).tickFormat(d3.timeFormat("%b %d")));

    let setHeightBarFn = (): void => { return this.setHeightBar(this); };
    g.selectAll('.axis--x')
        .attr('fill', 'transparent')
        .on("click", setHeightBarFn);

    g.selectAll('.axis--y')
        .attr('fill', 'transparent')
        .on("click", function (d) { console.log(d); })
}

function showTooltip(d: DateValueModel, 
    tooltip: any, svg: d3.Selection<SVGSVGElement, any, any, any>, 
    maxWidth: any,
    coords: number[]) {
    
    let x = (coords[0] + 120) > maxWidth ? maxWidth - 120 : coords[0];

    tooltip.transition()		
        .duration(200)		
        .style("opacity", .9);		
    tooltip.html("<p>" + (new Date(d.date)).toDateString() + "</p><p>" + d.value + "</p>")	
        .style("left", x + "px")		
        .style("top", (coords[1]) + "px");	
}

function hideTooltip(tooltip: any) {
    tooltip.transition()
        .duration(500)
        .style("opacity", 0);
}

function sevenDayRollingAverage(data: DateValueModel[]): [number, number][] {
    let result = new Array(data.length);

    let rollingAverage: number = 0;
    let value: number = 0;
    for (let i = 0; i < data.length; i++) {

        if (data[i].value < 0) {
            data[i].value = data[i - 1].value;
        }
        rollingAverage += (data[i].value / 7);

        if (i >= 7) {
            rollingAverage -= (data[i - 7].value / 7);
            value = rollingAverage;
        }


        const item: [number, number] = [new Date(data[i].date).getTime(), value];

        result[i] = item;

    }

    return result;
}

export default drawHBarChart;