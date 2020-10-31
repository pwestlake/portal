
import { DateValueChartProps } from './date-value';
import { Theme } from '@material-ui/core';
import { DateValueModel } from '../../../models/datevalue';
import * as d3 from 'd3';
import './date-value.css';

const drawDateValueChart = (props: DateValueChartProps, element: HTMLDivElement | null, theme: Theme) => {
    const data = props.data;
    const average: [number, number][] = sevenDayRollingAverage(data);
    let maxY = undefined;
    
    const margin = {top: 0, right: 16, bottom: 16, left: 40};
    const width = props.width - margin.left - margin.right;
    const height = props.height - margin.top - margin.bottom;

    const div = d3.select(element);
    div.selectAll("*").remove();

    
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

    const updateRulerX = (e: Event): void => {
            let coords : number[];
            if (e instanceof TouchEvent) {
                coords = [e.touches[0].clientX, e.touches[0].clientY];
            }
            if (e instanceof MouseEvent) {
                coords = [e.clientX, e.clientY];
            }
            
            let xSelection = d3.select("#" + props.id + " > g > path.x-measure");
            let svg = d3.select("#" + props.id + " > g");
            let svgElement = svg.node() as Element;
            let minX = svgElement.getBoundingClientRect().x + margin.left;
            let maxX = x((data.length - 1).toString());
            let xNew = (coords[0] - minX) < 0 ? 0 : ((coords[0] - minX) > maxX ? maxX : (coords[0] - minX));
            xSelection.attr('transform', `translate(${xNew}, 0)`);
        }

        const updateRulerY = (e: Event): void => {
            let coords : number[];
            if (e instanceof TouchEvent) {
                coords = [e.touches[0].clientX, e.touches[0].clientY];
            }
            if (e instanceof MouseEvent) {
                coords = [e.offsetX, e.offsetY];
            }
            
            let ySelection = d3.select("#" + props.id + " > g > path.y-measure");
            let minY = 0;
            let maxY = y(0);
            let yNew = (coords[1] - minY) < 0 ? 0 : ((coords[1] - minY) > maxY ? maxY : (coords[1] - minY));
            ySelection.attr('transform', `translate(0, ${yNew - y(0)})`);
        }
    const svg = div.append('svg')
        .attr('id', props.id)
        .attr('width', props.width)
        .attr('height', props.height)
        .on('touchmove', (e: Event) => {updateRulerX(e); updateRulerY(e)})
        .on('mousemove', (e: Event) => {updateRulerX(e); updateRulerY(e)});

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
            let dataPoint = dunknown as DateValueModel;
            let coords = [event.clientX, event.clientY];
            showTooltip(dataPoint, tooltip, svg, props.width, coords);
        })					
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

    // Y Measure
    const yMeasure = d3.path();
    yMeasure.moveTo(x("0"), y(0));
    yMeasure.lineTo(x((data.length - 1).toString()), y(0));
    g.append('path')
        .attr("class", "y-measure")
        .attr('stroke', 'lightgrey')
        .attr('stroke-dasharray', '3, 3')
        .attr('stroke-width', 1)
        .attr('d', yMeasure.toString());

    // X Measure
    const xMeasure = d3.path();
    xMeasure.moveTo(x("0"), 0);
    xMeasure.lineTo(x("0"), y(0));
    g.append('path')
        .attr("class", "x-measure")
        .attr('stroke', 'lightgrey')
        .attr('stroke-dasharray', '3, 3')
        .attr('stroke-width', 1)
        .attr('d', xMeasure.toString());
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

export default drawDateValueChart;