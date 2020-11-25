package handler

import (
	"net/http"
	"fmt"
	"encoding/json"
	"github.com/aws/aws-lambda-go/events"
	"github.com/pwestlake/portal/lambda/equity-fund/news/pkg/service"
)

// Get ...
// Handler function for the /news/newsitem/{id} endpoint
func Get(id string, newsService service.NewsService, headers map[string]string) (events.APIGatewayProxyResponse, error) {
	item, err := newsService.GetItem(id)
	if err != nil {
		return events.APIGatewayProxyResponse{
			Body:       fmt.Sprintf("{\"Error\",\"%v\"}", err),
			StatusCode: http.StatusNotFound,
			Headers:    headers,
		}, err
	}

	itemJSON, err := json.Marshal(*item)
	if err != nil {
		return events.APIGatewayProxyResponse{
			Body:       fmt.Sprintf("{\"Error\",\"%v\"}", err),
			StatusCode: http.StatusInternalServerError,
			Headers:    headers,
		}, err
	}

	return events.APIGatewayProxyResponse{
		Body:       string(itemJSON),
		StatusCode: http.StatusOK,
		Headers:    headers,
	}, nil
}