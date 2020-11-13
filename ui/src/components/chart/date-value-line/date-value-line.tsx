import React, { useEffect, createRef } from "react";
import { DateValueModel } from "../../../models/datevalue";
import drawDateValueLineChart from "./date-value-line-d3";
import { useTheme } from "@material-ui/core/styles";

export interface DateValueLineChartProps {
    id: string,
    data: DateValueModel[];
    width: number;
    height: number;
}
const DateValueLineChart = (props: DateValueLineChartProps) => {
    const ref: React.RefObject<HTMLDivElement> = createRef();
    const theme = useTheme();

    useEffect(() => {
        if (props.data.length > 0) {
            drawDateValueLineChart(props, ref.current, theme);
        }
    }, [props, ref, theme]);

    return (
        <div ref={ref}/>
    )
}

export default DateValueLineChart;