package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"github.com/pwestlake/portal/lambda/covid19/preferences/pkg/db"
	"github.com/pwestlake/portal/lambda/covid19/preferences/pkg/service"
	"github.com/aws/aws-lambda-go/events"
)

// HandleGetPreferences ...
// Handler preferences GET method
func HandleGetPreferences(user string, key string,
	headers map[string]string,
	userService service.UserServiceInterface) (events.APIGatewayProxyResponse, error) {
	
	preference := db.UserPreference{}
	err := userService.GetUserPreference(user, key, &preference)
	if err != nil {
		return events.APIGatewayProxyResponse{
			Body:       fmt.Sprintf("{\"Error\":\"Preference for %s/%s not found\"}", user, key),
			StatusCode: http.StatusNotFound,
			Headers: headers,
		}, err
	}

	json, err := json.Marshal(preference)
	if err != nil {
		return events.APIGatewayProxyResponse{
			Body:       fmt.Sprintf("{\"Error\":\"Failed to decode preference for %s/%s not found\"}", user, key),
			StatusCode: http.StatusInternalServerError,
			Headers: headers,
		}, err
	}

	return events.APIGatewayProxyResponse{
		Body:       string(json),
		StatusCode: http.StatusOK,
		Headers: headers,
	}, nil
}