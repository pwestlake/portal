import React, { useEffect, createRef } from "react";
import { KeyValueModel } from "../../../models/keyvalue";
import drawHBarChart from "./hbar-chart-d3";
import { useTheme } from "@material-ui/core/styles";

export interface HbarChartProps {
    data: KeyValueModel[];
    width: number;
    height: number;
}
const HBarChart = (props: HbarChartProps) => {
    const ref: React.RefObject<SVGSVGElement> = createRef();
    const theme = useTheme();

    useEffect(() => {
        drawHBarChart(props, ref.current, theme);
    }, [props, ref, theme]);

    return (
        <svg ref={ref}/>
    )
}

export default HBarChart;