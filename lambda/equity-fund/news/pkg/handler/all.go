package handler

import (
	"encoding/json"
	"github.com/pwestlake/portal/lambda/equity-fund/news/pkg/domain"
	"strconv"
	"fmt"
	"net/http"
	"github.com/aws/aws-lambda-go/events"
	"github.com/pwestlake/portal/lambda/equity-fund/news/pkg/service"

)

// All ...
// Handler function for the /news/newsitems endpoint
// params: 
// count
// key
// sortkey
// catalogref
func All(params map[string]string, newsService service.NewsService, headers map[string]string) (events.APIGatewayProxyResponse, error) {
	countParam, ok := params["count"]
	if !ok {
		countParam = "20"
	}
	count, err := strconv.ParseInt(countParam, 10, 32)
	if err != nil {
		count = 20
	}

	var idptr *string = nil
	id, ok := params["catalogref"]
	if ok {
		idptr = &id
	}

	var startKey *domain.NewsItem = nil
	
	items, err := newsService.GetNewsItems(int(count), startKey, idptr)
	if err != nil {
		return events.APIGatewayProxyResponse{
			Body:       fmt.Sprintf("{\"Error\",\"%v\"}", err),
			StatusCode: http.StatusNotFound,
			Headers:    headers,
		}, err
	}

	itemsJSON, err := json.Marshal(*items)
	if err != nil {
		return events.APIGatewayProxyResponse{
			Body:       fmt.Sprintf("{\"Error\",\"%v\"}", err),
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