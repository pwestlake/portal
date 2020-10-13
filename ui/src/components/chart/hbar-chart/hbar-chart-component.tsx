import React from "react";
import { withTheme, Theme } from '@material-ui/core/styles';
import './hbar-chart-component.css';
import { KeyValueModel } from "../../../models/keyvalue";
import * as d3 from 'd3';

interface HbarChartComponentState {
    dimensions: any;
}

interface HbarChartComponentProps {
    theme: Theme;
    data: KeyValueModel[];
}

class HbarChartComponent extends React.Component<HbarChartComponentProps, HbarChartComponentState> {
    constructor(props: HbarChartComponentProps) {
        super(props);
        this.state = {
            dimensions: null,
        };
    }

    private container: HTMLDivElement | null = null;
    private node = React.createRef<SVGSVGElement>();
    private margin = { top: 20, right: 20, bottom: 10, left: 70 };

    componentDidMount() {
        this.setState({
            dimensions: {
              width: this.container != null ? this.container.offsetWidth : 0,
              height: this.container != null ? this.container.offsetHeight: 0,
            },
          });

    }

    renderChart() {
        const { dimensions } = this.state;
        const data = this.props.data;

        const width = this.state.dimensions.width - this.margin.left - this.margin.right;
        const height = this.state.dimensions.height - this.margin.top - this.margin.bottom;

        const x = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.v) as number])
        .range([0, width]);

        const y = d3.scaleBand()
        .domain(data.map(d => d.k))
        .rangeRound([this.margin.top, height - this.margin.bottom])
        .padding(0.1)

        const xAxis = g => g
        .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`)
        .call(d3.axisTop(x).ticks(width / 80))
        .call(g => g.select(".domain").remove());

        const yAxis = g => g
        .attr("transform", `translate(${this.margin.left},0)`)
        .call(d3.axisLeft(y).tickFormat((d, i) => d).tickSizeOuter(0));

        const format = x.tickFormat(20);

        const svg = d3.select(this.node.current);

        svg.append("g")
        .selectAll("rect")
        .data(data)
        .join("rect")
        .attr('fill', this.props.theme.palette.primary.main)
        .attr("x", (x(0) as number) + this.margin.left)
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
        .attr("x", d => (x(d.v) as number) + this.margin.left - 4)
        .attr("y", (d, i) => (y(d.k) as number) + y.bandwidth() / 2)
        .attr("dy", "0.35em")
        .text(d => this.canDisplay(d.v, x(d.v) as number) ? format(d.v): "");

        svg.append("g")
        .call(xAxis);

        svg.append("g")
        .call(yAxis);
        return <svg ref={this.node} width={dimensions.width} height={dimensions.height}></svg>
    }

    render() {
        const { dimensions } = this.state;

        return (
            <div className="container" ref={el => (this.container = el)}>
                {dimensions && this.renderChart()}
            </div>
    )}

    private canDisplay(n: number, max: number): boolean {
        const numberWidth = this.measureWidth(n.toString());
    
        return numberWidth < max - 4;
    }
    
    private measureWidth(text: string): number {
        const context = document.createElement("canvas").getContext("2d");
        if (context != null) {
            context.font = "12px sans-serif";
        }
        return context != null ? context.measureText(text).width : 0;
    }
}

export default withTheme(HbarChartComponent);