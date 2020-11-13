package handler

import (
	"encoding/json"
	"github.com/pwestlake/portal/lambda/equity-fund/eod/pkg/domain"
	"fmt"
	"net/http"
	"github.com/aws/aws-lambda-go/events"
	"time"
	"github.com/pwestlake/portal/lambda/equity-fund/eod/pkg/service"

)

// HandleTimeseriesClose ...
// Handler function for the /eod/timeseries/close/{id} endpoint
// Returns a JSON representation of the close price timeseries identified by id
func HandleTimeseriesClose(id string, eodService service.EndOfDayService, headers map[string]string) (events.APIGatewayProxyResponse, error) {
	from := time.Time{}
	items, err := eodService.GetEndOfDayItems(id, from)

	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusNotFound,
			Body: fmt.Sprintf("Failed to get Timeseries for: %s, error: %s", id, err.Error()),
			Headers: headers,
		}, err
	}

	timeseries := make([]domain.DateValue, len(*items))
	for i, v := range *items {
		timeseries[i] = domain.DateValue {
			Date: v.Date,
			Value: v.Close,
		}
	}

	timeseriesJSON, err := json.Marshal(timeseries)
	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
			Body: fmt.Sprintf("Unable to marshal data for timeseries, error: %s", err.Error()),
			Headers: headers,
		}, err
	}

	return events.APIGatewayProxyResponse{
		Body: string(timeseriesJSON),
		StatusCode: http.StatusOK,
		Headers: headers,
	}, nil
}