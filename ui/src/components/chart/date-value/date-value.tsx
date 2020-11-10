import React, { useEffect, createRef } from "react";
import { DateValueModel } from "../../../models/datevalue";
import drawDateValueChart from "./date-value-d3";
import { useTheme } from "@material-ui/core/styles";

export interface DateValueChartProps {
    id: string,
    data: DateValueModel[];
    width: number;
    height: number;
}
const DateValueChart = (props: DateValueChartProps) => {
    const ref: React.RefObject<HTMLDivElement> = createRef();
    const theme = useTheme();

    useEffect(() => {
        if (props.data.length > 0) {
            drawDateValueChart(props, ref.current, theme);
        }
    }, [props, ref, theme]);

    return (
        <div ref={ref}/>
    )
}

export default DateValueChart;