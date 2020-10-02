package main

import (
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

func handler(request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	//params := request.MultiValueQueryStringParameters;

	
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

func main() {
	lambda.Start(handler)
}
