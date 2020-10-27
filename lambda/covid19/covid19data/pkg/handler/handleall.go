package handler

import (
	"log"
	"encoding/json"
	"strconv"
	"github.com/pwestlake/portal/lambda/covid19/covid19data/pkg/service"
	"net/http"
	"fmt"
	"github.com/aws/aws-lambda-go/events"

)

// HandleAll ...
// Handler function for the /covid19/all request
func HandleAll(queryParams map[string]string, 
	headers map[string]string,
	covid19DataService service.Covid19DataServiceInterface) (events.APIGatewayProxyResponse, error) {
	log.Print("Handler starter")
	count, err := strconv.Atoi(queryParams["count"])
	if err != nil {
		count = 0
	}
	region := queryParams["region"]
	key := queryParams["key"]
	sortKey := queryParams["sortKey"]
	log.Printf("count %d, region: %s, key: %s, sortKey %s", count, region, key, sortKey)
	covid19DataItems, err := covid19DataService.GetAllCovidItems(count, key, sortKey, region)

	if err != nil {
		return events.APIGatewayProxyResponse{
			Body:       fmt.Sprintf("{\"error\":\"%v\"}", err),
			StatusCode: http.StatusNotFound,
			Headers:    headers,
		}, err
	}

	itemsJSON, err := json.Marshal(covid19DataItems)
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
		Headers:    headers,
	}, nil
}