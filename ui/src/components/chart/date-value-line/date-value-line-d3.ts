
import { DateValueLineChartProps } from './date-value-line';
import { Theme } from '@material-ui/core';
import { DateValueModel } from '../../../models/datevalue';
import * as d3 from 'd3';
import './date-value-line.css';

const drawDateValueLineChart = (props: DateValueLineChartProps, element: HTMLDivElement | null, theme: Theme) => {
    const data = props.data;
    const average: [number, number][] = sevenDayRollingAverage(data);
    let maxY = undefined;

    const margin = { top: 0, right: 16, bottom: 20, left: 47 };
    const months: string[] = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const xLabelWidth = 40;
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

    const chartline = d3.line<DateValueModel>()
        .x(d => xLine(new Date(d.date)))
        .y(d => yLine(d.value));

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

    const updateRulerX = (e: Event): void => {
        let xcoord: number;
        if (e instanceof TouchEvent) {
            xcoord = e.touches[0].clientX;
        }
        if (e instanceof MouseEvent) {
            xcoord = e.clientX;
        }

        const xSelection = d3.select("svg#id-" + props.id + " > g > g.x-measure");
        const xSelectionLabel = d3.select("#id-" + props.id + " > g > g.x-measure-label");
        const svg = d3.select("#id-" + props.id + " > g");
        const svgElement = svg.node() as Element;
        const minX = svgElement.getBoundingClientRect().x + margin.left;
        const maxX = x((data.length - 1).toString());
        const xNew = (xcoord - minX) < 0 ? 0 : ((xcoord - minX) > maxX ? maxX : (xcoord - minX));
        xMeasureGroup.style("display", "block");
        xSelection.attr('transform', `translate(${xNew}, 0)`);
        xMeasureLabel.style("display", "block");
        const dateLabel: Date = new Date(data[Math.floor(xNew / x.step())].date);
        const dateString = dateLabel.getDate().toString();
        xMeasureText.text(months[dateLabel.getMonth()] + " " + (dateString.length > 1 ? dateString : ("0" + dateString)));

        const xNewLabel = (xcoord - minX - (xLabelWidth / 2)) < 0 ? (xLabelWidth / 2) : ((xcoord - minX + (xLabelWidth / 2)) > maxX ? (maxX - (xLabelWidth / 2)) : (xcoord - minX));
        xSelectionLabel.attr('transform', `translate(${xNewLabel}, 0)`);
    }

    const updateRulerY = (e: Event): void => {
        let ycoord: number;
        if (e instanceof TouchEvent) {
            let svg = d3.select("#id-" + props.id + " > g");
            let svgElement = svg.node() as Element;
            let offsetY = svgElement.getBoundingClientRect().top + margin.top;
            ycoord = e.touches[0].clientY - offsetY;
        }
        if (e instanceof MouseEvent) {
            ycoord = e.offsetY;
        }

        const ySelection = d3.select("#id-" + props.id + " > g > g.y-measure");
        const ySelectionLabel = d3.select("#id-" + props.id + " > g > g.y-measure-label");
        const minY = 0;
        const maxY = y(0);
        const yNew = ycoord < minY ? minY : (ycoord > maxY ? maxY : ycoord);
        const yNewLabel = (ycoord - 7) < minY ? minY + 7 : (ycoord > maxY ? maxY : ycoord);
        ySelection.attr('transform', `translate(0, ${yNew - y(0)})`);
        yMeasureText.text(y.invert(yNew).toFixed());
        ySelectionLabel.attr('transform', `translate(0, ${yNewLabel - y(0)})`);
        yMeasureLabel.style("display", "block");
    }
    const svg = div.append('svg')
        .attr('id', 'id-' + props.id)
        .attr('width', props.width)
        .attr('height', props.height)
        .on('touchmove', (e: Event) => { updateRulerX(e); updateRulerY(e) })
        .on('mousemove', (e: Event) => { updateRulerX(e); updateRulerY(e) });

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

    g.append('path')
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "#42a5f5")
        .attr("stroke-width", 2)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("d", chartline);
    // .enter().append('rect')
    // .attr('fill', theme.palette.primary.main)
    // .attr('x', (d, i) => x(i.toString()))
    // .attr('y', d => {
    //     if (typeof (maxY) == 'undefined') {
    //         return y(d.value);
    //     }
    //     return y(d.value > maxY ? maxY : d.value)
    // })
    // .attr('width', x.bandwidth)
    // .attr('height', d => {
    //     if (typeof (maxY) == 'undefined') {
    //         return (height - y(d.value)) < 0 ? 0 : (height - y(d.value));
    //     }
    //     return height - y(d.value > maxY ? maxY : d.value)
    // })
    // .attr('transform', 'translate(0,0)');

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

    const yMeasureGroup = g.append('g')
        .attr("class", "y-measure");
    const yMeasureLabel = g.append('g')
        .attr("class", "y-measure-label")
        .style("display", "none");

    yMeasureGroup.append('path')
        .attr('stroke', 'lightgrey')
        .attr('stroke-dasharray', '3, 3')
        .attr('stroke-width', 1)
        .attr('d', yMeasure.toString());

    yMeasureLabel.append('rect')
        .attr('x', x("0") - 46)
        .attr('y', y(0) - 7)
        .attr('width', xLabelWidth)
        .attr('height', 14)
        .attr('stroke', theme.palette.text.primary)
        .attr('fill', theme.palette.background.paper)
        .attr('stroke-width', 1)

    const yMeasureText = yMeasureLabel.append('text')
        .attr('x', x("0") - 9)
        .attr('y', y(0) + 3)
        .attr('font-size', '10px')
        .attr('font-weight', 'bold')
        .attr('text-anchor', 'end')
        .style('fill', theme.palette.text.primary);

    // X Measure
    const xMeasure = d3.path();
    xMeasure.moveTo(x("0"), 0);
    xMeasure.lineTo(x("0"), y(0));
    const xMeasureGroup = g.append('g')
        .attr("class", "x-measure")
        .style("display", "none");
    const xMeasureLabel = g.append('g')
        .attr("class", "x-measure-label")
        .style("display", "none");

    xMeasureGroup.append('path')
        .attr('stroke', 'lightgrey')
        .attr('stroke-dasharray', '3, 3')
        .attr('stroke-width', 1)
        .attr('d', xMeasure.toString());

    xMeasureLabel.append('rect')
        .attr('x', x("0") - (xLabelWidth / 2))
        .attr('y', y(0) + 5)
        .attr('width', xLabelWidth)
        .attr('height', 14)
        .attr('stroke', theme.palette.text.primary)
        .attr('fill', theme.palette.background.paper)
        .attr('stroke-width', 1)

    const xMeasureText = xMeasureLabel.append('text')
        .attr('x', x("0") + 2 - (xLabelWidth / 2))
        .attr('y', y(0) + 16)
        .attr('font-size', '10px')
        .attr('font-weight', 'bold')
        .style('fill', theme.palette.text.primary);
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
        else {
            value = data[i].value;
        }


        const item: [number, number] = [new Date(data[i].date).getTime(), value];

        result[i] = item;

    }

    return result;
}

export default drawDateValueLineChart;