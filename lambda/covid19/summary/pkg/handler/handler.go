package handler

import (
	"github.com/aws/aws-lambda-go/events"
)

func handle() (events.APIGatewayProxyResponse, error) {
	headers := map[string]string{
		"Access-Control-Allow-Origin": "*", 
		"Access-Control-Allow-Methods": "GET",
		"Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept",
		"Content-Type": "application/json",
	}

	return events.APIGatewayProxyResponse{
		Body:       "{\"msg\":\"Summary\"}",
		StatusCode: 200,
		Headers: headers,
	}, nil
}