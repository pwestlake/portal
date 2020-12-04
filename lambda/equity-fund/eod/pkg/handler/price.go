package handler

import ()
import "encoding/json"
import "fmt"
import "time"
import "net/http"
import "github.com/pwestlake/portal/lambda/equity-fund/eod/pkg/service"
import "github.com/aws/aws-lambda-go/events"

// HandleEndOfDayPrice ...
// Handler function for the /eod/price/{id}/{date} endpoint
// id - the string catalog id for the equity
// date - the string date yyyyMMdd for the date of the price
func HandleEndOfDayPrice(id string, date time.Time, eodService service.EndOfDayService, headers map[string]string) (events.APIGatewayProxyResponse, error) {
	item, err := eodService.GetItem(id, date)
	if err != nil {
		return events.APIGatewayProxyResponse{
			Body: fmt.Sprintf("{\"Error\",\"Failed to get End of Day item: %v\"}", err),
			StatusCode: http.StatusNotFound,
			Headers: headers,
		}, err
	}

	json, err := json.Marshal(item)
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
