package main

import (
	"time"
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
		"Access-Control-Allow-Methods": "GET,POST",
		"Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept",
		"Content-Type":                 "application/json",
	}

	path := request.Path

	eodService := service.InitializeEndOfDayService()

	switch {
	// Timeseries close price for given id
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

	// Latest end of day price data for all
	case strings.Contains(path, "/latest-eod"):
		return hdlr.HandleLatestEndOfDay(eodService, headers)

	// End of day price for a given id and date
	case strings.Contains(path, "/price") && request.HTTPMethod == http.MethodGet:
		id, ok := request.PathParameters["id"]
		if !ok {
			return events.APIGatewayProxyResponse{
				Body:       "{\"Error\",\"id missing\"}",
				StatusCode: http.StatusBadRequest,
				Headers:    headers,
			}, nil
		}

		dateString, ok := request.PathParameters["date"]
		if !ok {
			return events.APIGatewayProxyResponse{
				Body:       "{\"Error\",\"date missing\"}",
				StatusCode: http.StatusBadRequest,
				Headers:    headers,
			}, nil
		}

		date, err := time.Parse("20060102", dateString)
		if err != nil {
			return events.APIGatewayProxyResponse{
				Body:       "{\"Error\",\"Invalid date format. Expected yyyyMMdd\"}",
				StatusCode: http.StatusBadRequest,
				Headers:    headers,
			}, nil
		}

		return hdlr.HandleEndOfDayPrice(id, date, eodService, headers)

		// Post end of day price
		case strings.Contains(path, "/price") && request.HTTPMethod == http.MethodPost:
			return hdlr.HandlePostEndOfDayPrice(request.Body, headers, eodService)

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
