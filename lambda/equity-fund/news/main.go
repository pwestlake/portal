package main

import (
	"github.com/pwestlake/portal/lambda/equity-fund/news/pkg/service"
	"fmt"
	"strings"
	"net/http"
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	hdlr "github.com/pwestlake/portal/lambda/equity-fund/news/pkg/handler"
)

// Event handler for the API gateway routes:
// /news/newsitems
// /news/newsitem/{id}
func handler(request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	headers := map[string]string{
		"Access-Control-Allow-Origin":  "*",
		"Access-Control-Allow-Methods": "GET",
		"Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept",
		"Content-Type":                 "application/json",
	}

	path := request.Path
	newsService := service.InitializeNewsService()

	switch {
	case strings.Compare(path, "/news/newsitems") == 0:
		return hdlr.All(request.QueryStringParameters, newsService, headers)
	case strings.Contains(path, "/newsitem/"):
		id, ok := request.PathParameters["id"]
		if !ok {
			return events.APIGatewayProxyResponse{
				Body:       "{\"Error\",\"id missing\"}",
				StatusCode: http.StatusBadRequest,
				Headers:    headers,
			}, nil
		}

		return hdlr.Get(id, newsService, headers)
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
