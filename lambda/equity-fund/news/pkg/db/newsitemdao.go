package db

import (
	"github.com/pwestlake/portal/lambda/equity-fund/news/pkg/domain"
	"os"
	"github.com/google/uuid"
	"github.com/aws/aws-sdk-go/service/dynamodb/expression"
	"errors"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/service/dynamodb/dynamodbattribute"
	"github.com/aws/aws-sdk-go/service/dynamodb"
	"github.com/aws/aws-sdk-go/aws/session"
	"log"
)

// NewsItemDAO ...
// DAO for an EndOfDayItem
type NewsItemDAO struct {
	endpoint string
	region   string
}

// NewNewsItemDAO ...
// Create function for an EndOfDayItemDAO
func NewNewsItemDAO() NewsItemDAO {
	return NewsItemDAO{
		endpoint: os.Getenv("DYNAMODB_ENDPOINT"),
		region: os.Getenv("REGION"),
	}
}

// PutNewsItems ...
// Store the given array of NewsItems in the database
func (s *NewsItemDAO) PutNewsItems(items *[]domain.NewsItem) error{
	dbSession := session.Must(session.NewSession())
	client := dynamodb.New(dbSession, aws.NewConfig().WithEndpoint(s.endpoint).WithRegion(s.region))

	var err error
	for _, v := range *items {
		v.ID = uuid.New().String()
		av, err := dynamodbattribute.MarshalMap(v)
		if err != nil {
			log.Printf("Error marshalling NewsItem type")
			break
		} else {
			input := &dynamodb.PutItemInput{
				Item:      av,
				TableName: aws.String("NewsItems")}

			_, err = client.PutItem(input)
		}
	}

	return err
}

// GetLatestItem ...
// Retrieve the latest item for the given key id
func (s *NewsItemDAO) GetLatestItem(id string) (*domain.NewsItem, error){
	var newsItem = domain.NewsItem{}
	dbSession := session.Must(session.NewSession())
	client := dynamodb.New(dbSession, aws.NewConfig().WithEndpoint(s.endpoint).WithRegion(s.region))

	expressionAttributeValues := map[string]*dynamodb.AttributeValue {
		":catalogref": &dynamodb.AttributeValue{S: aws.String(id)},
	}

	queryInput := dynamodb.QueryInput {
		TableName: aws.String("NewsItems"),
		IndexName: aws.String("catalogref-datetime-index"),
		ExpressionAttributeValues: expressionAttributeValues,
		Limit: aws.Int64(1),
		ScanIndexForward: aws.Bool(false),
		KeyConditionExpression: aws.String("catalogref = :catalogref"),
	}

	resp, err := client.Query(&queryInput)
	if err != nil {
		return &domain.NewsItem{}, err
	}

	if *resp.Count == 0 {
		return nil, errors.New("Item not found")
	}

	err = dynamodbattribute.UnmarshalMap(resp.Items[0],  &newsItem)
	
	return &newsItem, err
}

// GetNewsItems ...
// Return count news items from the given offset with the given id. All items if the id is nil
func (s *NewsItemDAO) GetNewsItems(count int, offset *domain.NewsItem, id *string) (*[]domain.NewsItem, error) {
	if id != nil {
		return s.queryNewsItems(count, offset, id)
	}

	var newsItems = []domain.NewsItem{}
	dbSession := session.Must(session.NewSession())
	client := dynamodb.New(dbSession, aws.NewConfig().WithEndpoint(s.endpoint).WithRegion(s.region))

	proj := expression.NamesList(
		expression.Name("id"), 
		expression.Name("datetime"), 
		expression.Name("catalogref"),
		expression.Name("companycode"),
		expression.Name("companyname"),
		expression.Name("sentiment"),
		expression.Name("title"))

	expr, err := expression.NewBuilder().WithProjection(proj).Build()
	if err != nil {
		return nil, err
	}
	
	params := &dynamodb.ScanInput{
		TableName: aws.String("NewsItems"),
		Limit: aws.Int64(int64(count)),
		ExpressionAttributeNames: expr.Names(),
		ExpressionAttributeValues: expr.Values(),
		ProjectionExpression: expr.Projection(),
	}

	if (offset != nil) {
		exclusiveStartKeyMap := map[string]*dynamodb.AttributeValue {
			":id": &dynamodb.AttributeValue{S: aws.String(offset.ID)},
			":datetime": &dynamodb.AttributeValue{S: aws.String(offset.DateTime.Format("2006-01-02T15:04:05Z"))},
		}
		params.ExclusiveStartKey = exclusiveStartKeyMap
	}

	complete := false
	for !complete {
		result, err := client.Scan(params)
		if err != nil {
			return nil, err
		}

		items := []domain.NewsItem{}
		err = dynamodbattribute.UnmarshalListOfMaps(result.Items, &items)
		if err != nil {
			return nil, err
		}

		newsItems = append(newsItems, items...)
		
		if len(newsItems) < count && result.LastEvaluatedKey != nil {
			params.ExclusiveStartKey = result.LastEvaluatedKey
		} else {
			complete = true
		}
	}

	return &newsItems, nil
}

func (s *NewsItemDAO) queryNewsItems(count int, offset *domain.NewsItem, id *string) (*[]domain.NewsItem, error) {
	var newsItems = []domain.NewsItem{}
	dbSession := session.Must(session.NewSession())
	client := dynamodb.New(dbSession, aws.NewConfig().WithEndpoint(s.endpoint).WithRegion(s.region))

	proj := expression.NamesList(
		expression.Name("id"), 
		expression.Name("datetime"), 
		expression.Name("catalogref"),
		expression.Name("companycode"),
		expression.Name("companyname"),
		expression.Name("sentiment"),
		expression.Name("title"))

	expr, err := expression.NewBuilder().WithProjection(proj).Build()
	if err != nil {
		return nil, err
	}

	expressionAttributeValues := map[string]*dynamodb.AttributeValue {
		":catalogref": &dynamodb.AttributeValue{S: id},
	}

	params := &dynamodb.QueryInput{
		TableName: aws.String("NewsItems"),
		IndexName: aws.String("catalogref-datetime-index"),
		ExpressionAttributeValues: expressionAttributeValues,
		ExpressionAttributeNames: expr.Names(),
		KeyConditionExpression: aws.String("catalogref = :catalogref"),
		Limit: aws.Int64(int64(count)),
		ScanIndexForward: aws.Bool(false),
		ProjectionExpression: expr.Projection(),
	}

	if (offset != nil) {
		exclusiveStartKeyMap := map[string]*dynamodb.AttributeValue {
			":id": &dynamodb.AttributeValue{S: aws.String(offset.ID)},
			":catalogref": &dynamodb.AttributeValue{S: id},
			":datetime": &dynamodb.AttributeValue{S: aws.String(offset.DateTime.Format("2006-01-02T15:04:05Z"))},
		}
		params.ExclusiveStartKey = exclusiveStartKeyMap
	}

	complete := false
	for !complete {
		result, err := client.Query(params)
		if err != nil {
			return nil, err
		}

		items := []domain.NewsItem{}
		err = dynamodbattribute.UnmarshalListOfMaps(result.Items, &items)
		if err != nil {
			return nil, err
		}

		newsItems = append(newsItems, items...)
		
		if len(newsItems) < count && result.LastEvaluatedKey != nil {
			params.ExclusiveStartKey = result.LastEvaluatedKey
		} else {
			complete = true
		}
	}

	return &newsItems, nil
}

// GetItem ...
// Retrieve the news item for the given key id
func (s *NewsItemDAO) GetItem(id string) (*domain.NewsItem, error){
	var newsItem = domain.NewsItem{}
	dbSession := session.Must(session.NewSession())
	client := dynamodb.New(dbSession, aws.NewConfig().WithEndpoint(s.endpoint).WithRegion(s.region))

	expressionAttributeValues := map[string]*dynamodb.AttributeValue {
		":id": &dynamodb.AttributeValue{S: aws.String(id)},
	}

	queryInput := dynamodb.QueryInput {
		TableName: aws.String("NewsItems"),
		ExpressionAttributeValues: expressionAttributeValues,
		KeyConditionExpression: aws.String("id = :id"),
	}

	resp, err := client.Query(&queryInput)
	if err != nil {
		return &domain.NewsItem{}, err
	}

	if *resp.Count == 0 {
		return nil, errors.New("Item not found")
	}

	err = dynamodbattribute.UnmarshalMap(resp.Items[0],  &newsItem)
	
	return &newsItem, err
}