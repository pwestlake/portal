package main

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	hdlr "github.com/pwestlake/portal/lambda/equity-fund/eod/pkg/handler"
	"github.com/pwestlake/portal/lambda/equity-fund/eod/pkg/service"
)

func handler(request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	headers := map[string]string{
		"Access-Control-Allow-Origin":  "*",
		"Access-Control-Allow-Methods": "GET",
		"Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept",
		"Content-Type":                 "application/json",
	}

	path := request.Path

	eodService := service.InitializeEndOfDayService()

	switch {
	case strings.Contains(path, "/timeseries/close"):
		id, ok := request.PathParameters["id"]
		if !ok {
			return events.APIGatewayProxyResponse{
				Body:       "{\"Error\",\"id missing\"}",
				StatusCode: http.StatusBadRequest,
				Headers:    headers,
			}, nil
		}
		return hdlr.HandleTimeseriesClose(id, eodService, headers)
	}

	return events.APIGatewayProxyResponse{
		Body:       fmt.Sprintf("{\"Message\",\"%s\"}", path),
		StatusCode: http.StatusOK,
		Headers:    headers,
	}, nil
}

func main() {
	lambda.Start(handler)
}
