package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sort"

	"github.com/aws/aws-lambda-go/events"
	"github.com/pwestlake/portal/lambda/covid19/summary/pkg/db"
	"github.com/pwestlake/portal/lambda/covid19/summary/pkg/domain"
	"github.com/pwestlake/portal/lambda/covid19/summary/pkg/service"
)

// HandleAllCovidCases ...
// Handler function for this lambda function
func HandleAllCovidCases(perCapita bool, multiplier int,
	headers map[string]string,
	covid19DataService service.Covid19DataServiceInterface) (events.APIGatewayProxyResponse, error) {

	return handleCases(perCapita, multiplier, headers, covid19DataService,
		func(s db.Covid19SummaryItem) int {
			return s.TotalCases
		})
}

// HandleAllCovidDeaths ...
// Handler function for this lambda function
func HandleAllCovidDeaths(perCapita bool, multiplier int, 
	headers map[string]string, 
	covid19DataService service.Covid19DataServiceInterface) (events.APIGatewayProxyResponse, error) {
	
	return handleCases(perCapita, multiplier, headers, covid19DataService,
		func(s db.Covid19SummaryItem) int {
			return s.TotalDeaths
		})
}

func handleCases(perCapita bool, multiplier int,
	headers map[string]string,
	covid19DataService service.Covid19DataServiceInterface,
	getValue func(s db.Covid19SummaryItem) int) (events.APIGatewayProxyResponse, error) {
	items, err := covid19DataService.GetSummaryItems()
	if err != nil {
		return events.APIGatewayProxyResponse{
			Body:       fmt.Sprintf("{\"error\":\"%v\"}", err),
			StatusCode: http.StatusInternalServerError,
			Headers:    headers,
		}, err
	}

	valuePairs := []domain.ValuePair{}
	for _, v := range *items {
		// Filter: If perCapita is specified then choose only countries with a large
		// enough population
		if !perCapita || (v.PopData2019 >= multiplier) {
			count := getValue(v)
			if perCapita {
				count = int((float64(count) * float64(multiplier)) / float64(v.PopData2019))
			}
			valuePairs = append(valuePairs, domain.ValuePair{Key: v.CountryExp, Value: count})
		}

		sort.Slice(valuePairs, func(i int, j int) bool {
			return valuePairs[j].Value.(int) < valuePairs[i].Value.(int)
		})
	}

	itemsJSON, err := json.Marshal(valuePairs[0:20])
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
