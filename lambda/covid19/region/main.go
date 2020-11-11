package main

import (
	"encoding/json"
	"fmt"
	"github.com/pwestlake/portal/lambda/covid19/region/pkg/service"
	"github.com/pwestlake/portal/lambda/commons/pkg/security"
	"net/http"
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

func handler(request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	headers := map[string]string{
		"Access-Control-Allow-Origin": "*", 
		"Access-Control-Allow-Methods": "GET",
		"Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept",
		"Content-Type": "application/json",
	}

	err := security.RequireGroup("covid19", request)
	if err != nil {
		return events.APIGatewayProxyResponse{
			Body:       "{\"Error\":\"Not authorized\"}",
			StatusCode: http.StatusUnauthorized,
			Headers: headers,
		}, nil
	}

	regionService := service.InitializeRegionService()
	names, err := regionService.GetRegionNames()
	if err != nil {
		return events.APIGatewayProxyResponse{
			Body:       fmt.Sprintf("{\"Error\":\"Failed to get region names: %s\"}", err),
			StatusCode: http.StatusInternalServerError,
			Headers: headers,
		}, err
	}

	json, err := json.Marshal(names)
	if err != nil {
		return events.APIGatewayProxyResponse{
			Body:       fmt.Sprintf("{\"Error\":\"Failed to decode region names: %s\"}", err),
			StatusCode: http.StatusInternalServerError,
			Headers: headers,
		}, err
	}

	return events.APIGatewayProxyResponse{
		Body:       string(json),
		StatusCode: http.StatusOK,
		Headers: headers,
	}, nil
}

func main() {
	lambda.Start(handler)
}