package main

import (
	"fmt"
	"log"
	"github.com/pwestlake/portal/lambda/covid19/summary/pkg/service"
	"net/http"
	"strconv"
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	hdlr "github.com/pwestlake/portal/lambda/covid19/summary/pkg/handler"
)

func handler(request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	pathParams := request.PathParameters

	queryParams := request.QueryStringParameters;
	perCapita, ok := queryParams["perCapita"]
	if !ok {
		perCapita = "false"
	}

	multiplier, ok := queryParams["multiplier"]
	if !ok {
		multiplier = "1"
	}

	headers := map[string]string{
		"Access-Control-Allow-Origin": "*", 
		"Access-Control-Allow-Methods": "GET",
		"Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept",
		"Content-Type": "application/json",
	}

	perCapitaValue, e := strconv.ParseBool(perCapita)
	if e != nil {
		return events.APIGatewayProxyResponse{
			Body:       "{\"Error\":\"Failed to parse perCapita parameter\"}",
			StatusCode: http.StatusBadRequest,
			Headers: headers,
		}, nil
	}

	multiplierValue, e := strconv.Atoi(multiplier)
	if e != nil {
		return events.APIGatewayProxyResponse{
			Body:       "{\"Error\":\"Failed to parse multiplier parameter\"}",
			StatusCode: http.StatusBadRequest,
			Headers: headers,
		}, nil
	}

	covid19DataService := service.InitializeCovid19DataService()

	switch pathParams["type"] {
	case "all-covid-cases":
		return hdlr.HandleAllCovidCases(perCapitaValue, multiplierValue, headers, covid19DataService)
	case "all-covid-deaths":
		return hdlr.HandleAllCovidDeaths(perCapitaValue, multiplierValue, headers, covid19DataService)
	default:
		log.Printf("Invalid request")
	}

	return events.APIGatewayProxyResponse{
		Body:       fmt.Sprintf("{\"Error\":\"Invalid path variable type: %s\"}", pathParams["type"]),
		StatusCode: http.StatusBadRequest,
		Headers: headers,
	}, nil
}

func main() {
	lambda.Start(handler)
}
