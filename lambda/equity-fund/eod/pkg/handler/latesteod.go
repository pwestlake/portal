package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"github.com/aws/aws-lambda-go/events"
	"github.com/pwestlake/portal/lambda/equity-fund/eod/pkg/service"

)

// HandleLatestEndOfDay ...
// Handler function for the /eod/latest-eod endpoint
// Returns a JSON list of latest price data for all catalog items
func HandleLatestEndOfDay(eodService service.EndOfDayService, headers map[string]string) (events.APIGatewayProxyResponse, error) {
	latest, err := eodService.GetLatestItem("a946a667-dd1f-46e0-81d9-c4fb7d52de9c")
	if err != nil {
		return events.APIGatewayProxyResponse{
			Body: fmt.Sprintf("{\"Error\",\"Failed to get End of Day item: %v\"}", err),
			StatusCode: http.StatusNotFound,
			Headers: headers,
		}, err
	}	

	items, err := eodService.GetAllEndOfDayItemsByDate(latest.Date)
	if err != nil {
		return events.APIGatewayProxyResponse{
			Body: fmt.Sprintf("{\"Error\",\"Failed to get End of Day item: %v\"}", err),
			StatusCode: http.StatusNotFound,
			Headers: headers,
		}, err
	}

	json, err := json.Marshal(items)
	if err != nil {
		return events.APIGatewayProxyResponse{
			Body: fmt.Sprintf("{\"Error\",\"Unable to marshal data for End Of Day, error: %s\"}", err),
			StatusCode: http.StatusInternalServerError,
			Headers: headers,
		}, err
	}

	return events.APIGatewayProxyResponse{
		Body: string(json),
		StatusCode: http.StatusOK,
		Headers: headers,
	}, nil
}