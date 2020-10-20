package handler

import (
	"time"
	"log"
	"encoding/json"
	"github.com/pwestlake/portal/lambda/covid19/covid19data/pkg/domain"
	"fmt"
	"net/http"
	"github.com/aws/aws-lambda-go/events"
	"github.com/pwestlake/portal/lambda/covid19/covid19data/pkg/service"

)

// HandleCases ...
// Handler function for the covid19data/cases/{region} endpoint
func HandleCases(regionName string, 
	headers map[string]string,
	covid19DataService service.Covid19DataServiceInterface) (events.APIGatewayProxyResponse, error) {
	covid19DataItems, err := covid19DataService.GetDataForRegion(regionName)
	
	if err != nil {
		return events.APIGatewayProxyResponse{
			Body:       fmt.Sprintf("{\"error\":\"%v\"}", err),
			StatusCode: http.StatusNotFound,
			Headers:    headers,
		}, err
	}

	// Get the max, min dates with values so that the data can be trimmed
	max, min := getDateRange(covid19DataItems)

	dateValues := []domain.DateValue{}
	for _, v := range *covid19DataItems {
		date, err := time.Parse("20060102", v.DateRep)
		if err != nil {
			log.Printf("Invalid date format %s, Ignoring. %s", v.DateRep, err.Error())
			continue
		}

		if (date.After(min) || date.Equal(min)) && (date.Before(max) || date.Equal(max)) {
			dateValues = append(dateValues, domain.DateValue{Date: date, Value: v.NewConfCases})
		}
	}

	itemsJSON, err := json.Marshal(dateValues)
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

func getDateRange(items *[]domain.Covid19DataItem) (max time.Time, min time.Time) {
	max = time.Time{}
	min = time.Now()

	for _, v := range *items {
		date, err := time.Parse("20060102", v.DateRep)
		if err != nil {
			log.Printf("Invalid date format %s, Ignoring. %s", v.DateRep, err.Error())
			continue
		}

		if v.NewConfCases > 0 && date.After(max) {
			max = date
		}

		if v.NewConfCases > 0 && date.Before(min) {
			min = date
		}
	}

	return max, min
}