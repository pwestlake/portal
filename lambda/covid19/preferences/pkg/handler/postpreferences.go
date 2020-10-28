package handler

import (
	"fmt"
	"encoding/json"
	"github.com/pwestlake/portal/lambda/covid19/preferences/pkg/db"
	"net/http"

	"github.com/aws/aws-lambda-go/events"
	"github.com/pwestlake/portal/lambda/covid19/preferences/pkg/service"
)

// HandlePostPreferences ...
// Handler preferences POST method. Updates the given user preference
func HandlePostPreferences(message string,
	headers map[string]string,
	userService service.UserServiceInterface) (events.APIGatewayProxyResponse, error) {

	preference := db.UserPreference{}
	err := json.Unmarshal([]byte(message), &preference)
	if err != nil {
		return events.APIGatewayProxyResponse{
			Body:       "{\"Error\":\"Failed to decode message\"}",
			StatusCode: http.StatusBadRequest,
			Headers:    headers,
		}, err
	}

	err = userService.PutUserPreference(&preference)
	if err != nil {
		return events.APIGatewayProxyResponse{
			Body:       fmt.Sprintf("{\"Error\":\"Failed to persist preference %s/%s\"}", preference.UserID, preference.Key),
			StatusCode: http.StatusInternalServerError,
			Headers:    headers,
		}, err
	}

	return events.APIGatewayProxyResponse{
		Body:       fmt.Sprintf("{\"Success\":\"Saved preference %s/%s\"}", preference.UserID, preference.Key),
		StatusCode: http.StatusOK,
		Headers:    headers,
	}, nil
}
