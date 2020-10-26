package main

import (
	"github.com/pwestlake/portal/lambda/covid19/covid19data/pkg/service"
	"log"
	"fmt"
	"net/http"
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	hdlr "github.com/pwestlake/portal/lambda/covid19/covid19data/pkg/handler"
)

func handler(request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	pathParams := request.PathParameters
	headers := map[string]string{
		"Access-Control-Allow-Origin": "*", 
		"Access-Control-Allow-Methods": "GET",
		"Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept",
		"Content-Type": "application/json",
	}

	covid19DataService := service.InitializeCovid19DataService()

	switch pathParams["type"] {
	case "cases": 
		return hdlr.HandleCases(pathParams["region"], headers, covid19DataService)
	case "deaths":
		return hdlr.HandleDeaths(pathParams["region"], headers, covid19DataService)
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