package main

import (
	hdlr "github.com/pwestlake/portal/lambda/covid19/preferences/pkg/handler"
	"fmt"
	"github.com/pwestlake/portal/lambda/covid19/preferences/pkg/service"
	"github.com/aws/aws-lambda-go/lambda"
	"net/http"
	"github.com/aws/aws-lambda-go/events"
)

func handler(request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	pathParams := request.PathParameters

	headers := map[string]string{
		"Access-Control-Allow-Origin": "*", 
		"Access-Control-Allow-Methods": "GET, POST",
		"Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept",
		"Content-Type": "application/json",
	}

	userService := service.InitializeUserService()

	switch request.HTTPMethod {
	case http.MethodGet:
		return hdlr.HandleGetPreferences(pathParams["user"], pathParams["key"], headers, userService)
	case http.MethodPost:
		return hdlr.HandlePostPreferences(request.Body, headers, userService)
	default:
		return events.APIGatewayProxyResponse{
			Body:       fmt.Sprintf("{\"Error\":\"Invalid method: %v\"}", request.HTTPMethod),
			StatusCode: http.StatusBadRequest,
			Headers: headers,
		}, nil
	}
	return events.APIGatewayProxyResponse{
		Body:       "{\"Error\":\"Invalid api call\"}",
		StatusCode: http.StatusBadRequest,
		Headers: headers,
	}, nil
}

func main() {
	lambda.Start(handler)
}