import { Container } from "@material-ui/core";
import { API, Auth } from "aws-amplify";
import React from "react"
import { ResizeObserver } from "resize-observer";
import DateValueLineChart from "../../../components/chart/date-value-line/date-value-line";
import { DateValueModel } from "../../../models/datevalue";

export interface EquityChartProps {
    id: string;
}

interface Dimension {
    width: number;
    height: number;
}

const EquityChart = (props: EquityChartProps) => {
    const [data, setData] = React.useState<DateValueModel[]>([]);
    const [dimension, setDimension] = React.useState<Dimension>({width: 0, height: 0});

    const sizeObserver = React.useRef(
        new ResizeObserver(entries => {
          setDimension({width: entries[0].contentRect.width, height: entries[0].contentRect.height});
        }));
    
    const elRef = React.useRef(null);

    React.useEffect(() => {
        const obs = sizeObserver;
        if (elRef.current) {
            obs.current.observe(elRef.current)
        }
        return () => {
            obs.current.disconnect();
        }
    }, [elRef, sizeObserver]);

    const intersectionObserver = React.useRef(
        new IntersectionObserver((entry) => {
            async function sourceAndSetData() {
                let sessionObject = await Auth.currentSession().catch(e => undefined);
                if (sessionObject !== undefined) {
                    let idToken = sessionObject.getIdToken().getJwtToken();
                    let init = {
                        response: false,
                        headers: { Authorization: idToken }
                    }
        
                    let result = await API.get('covid19', `/eod/timeseries/close/${props.id}`, init)
                    .catch(e =>  { return {value: []}});
                
                    setData(result as DateValueModel[]);
                }
            }
            
            if (entry[0].isIntersecting) {
                sourceAndSetData();
                intersectionObserver.current.disconnect();
            }
        })
    );

    React.useEffect(() => {
        const obs = intersectionObserver;
        if (elRef.current) {
            obs.current.observe(elRef.current);
        }
        return () => {
            obs.current.disconnect();
        }
    }, []);

    return (
        <Container ref={elRef} style={{height: "100%"}}>
            <DateValueLineChart id={props.id} data={data} width={dimension.width} height={dimension.height} />
        </Container>
    )
}

export default EquityChart