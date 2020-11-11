package main

import (
	"fmt"
	"encoding/json"
	"github.com/pwestlake/portal/lambda/equity-fund/equitycatalog/pkg/service"
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

	equityCatalogService := service.InitializeEquityCatalogService()
	equityCatalogItems, err := equityCatalogService.GetAllEquityCatalogItems()
	if err != nil {
		return events.APIGatewayProxyResponse{
			Body:       fmt.Sprintf("{\"error\":\"%v\"}", err),
			StatusCode: http.StatusInternalServerError,
			Headers: headers,
		}, err
	}

	itemsJSON, err := json.Marshal(equityCatalogItems)
	if err != nil {
		return events.APIGatewayProxyResponse{
			Body:       fmt.Sprintf("{\"error\":\"%v\"}", err),
			StatusCode: http.StatusInternalServerError,
			Headers:    headers,
		}, err
	}

	return events.APIGatewayProxyResponse{
		Body:       string(itemsJSON),
		StatusCode: http.StatusOK,
		Headers: headers,
	}, nil
}


func main() {
	lambda.Start(handler)
}