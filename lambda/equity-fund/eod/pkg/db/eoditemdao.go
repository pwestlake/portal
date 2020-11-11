package db

import (
	"github.com/pwestlake/portal/lambda/equity-fund/eod/pkg/domain"
	"os"
	"errors"
	"time"
	"log"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/dynamodb"
	"github.com/aws/aws-sdk-go/service/dynamodb/dynamodbattribute"
)

// EndOfDayItemDAO ...
// DAO for an EndOfDayItem
type EndOfDayItemDAO struct {
	endpoint string
	region   string
}

// NewEndOfDayItemDAO ...
// Create function for an EndOfDayItemDAO
func NewEndOfDayItemDAO() EndOfDayItemDAO {
	return EndOfDayItemDAO{
		endpoint: os.Getenv("DYNAMODB_ENDPOINT"),
		region: os.Getenv("REGION"),
	}
}

// PutEndOfDayItems ...
// Store the given array of EndOfDayItems in the database
func (s *EndOfDayItemDAO) PutEndOfDayItems(items *[]domain.EndOfDayItem) error{
	dbSession := session.Must(session.NewSession())
	client := dynamodb.New(dbSession, aws.NewConfig().WithEndpoint(s.endpoint).WithRegion(s.region))

	var err error
	for _, v := range *items {
		av, err := dynamodbattribute.MarshalMap(v)
		if err != nil {
			log.Printf("Error marshalling EndOfDayItem type")
			break
		} else {
			input := &dynamodb.PutItemInput{
				Item:      av,
				TableName: aws.String("EndOfDay")}

			_, err = client.PutItem(input)
		}
	}

	return err
}

// GetEndOfDayItems ...
// Retrieve EndOfDayItems according to the id and from date
func (s *EndOfDayItemDAO) GetEndOfDayItems(id string, from time.Time) (*[]domain.EndOfDayItem, error){
	var endOfDayItems = []domain.EndOfDayItem{}
	dbSession := session.Must(session.NewSession())
	client := dynamodb.New(dbSession, aws.NewConfig().WithEndpoint(s.endpoint).WithRegion(s.region))

	expressionAttributeValues := map[string]*dynamodb.AttributeValue {
		":id": &dynamodb.AttributeValue{S: aws.String(id)},
		":date": &dynamodb.AttributeValue{S: aws.String(from.String())},
	}


	queryInput := dynamodb.QueryInput {
		TableName: aws.String("EndOfDay"),
		ExpressionAttributeValues: expressionAttributeValues,
		ExpressionAttributeNames: map[string]*string {"#d": aws.String("date")},
		KeyConditionExpression: aws.String("id = :id AND #d >= :date"),
	}

	resp, err := client.Query(&queryInput)
	if err != nil {
		return nil, err
	}

	err = dynamodbattribute.UnmarshalListOfMaps(resp.Items,  &endOfDayItems)
	
	return &endOfDayItems, err
}

// GetAllEndOfDayItemsByDate ...
// Retrieve EndOfDayItems according to the id and from date
func (s *EndOfDayItemDAO) GetAllEndOfDayItemsByDate(date time.Time) (*[]domain.EndOfDayItem, error){
	var endOfDayItems = []domain.EndOfDayItem{}
	dbSession := session.Must(session.NewSession())
	client := dynamodb.New(dbSession, aws.NewConfig().WithEndpoint(s.endpoint).WithRegion(s.region))

	expressionAttributeValues := map[string]*dynamodb.AttributeValue {
		":date": &dynamodb.AttributeValue{S: aws.String(date.Format("2006-01-02T15:04:05Z"))},
	}


	queryInput := dynamodb.QueryInput {
		TableName: aws.String("EndOfDay"),
		IndexName: aws.String("date-index"),
		ExpressionAttributeValues: expressionAttributeValues,
		ExpressionAttributeNames: map[string]*string {"#d": aws.String("date")},
		KeyConditionExpression: aws.String("#d = :date"),
	}

	resp, err := client.Query(&queryInput)
	if err != nil {
		return nil, err
	}

	err = dynamodbattribute.UnmarshalListOfMaps(resp.Items,  &endOfDayItems)
	
	return &endOfDayItems, err
}

// GetLatestItem ...
// Retrieve the latest item for the given key id
func (s *EndOfDayItemDAO) GetLatestItem(id string) (*domain.EndOfDayItem, error){
	var endOfDayItem = domain.EndOfDayItem{}
	dbSession := session.Must(session.NewSession())
	client := dynamodb.New(dbSession, aws.NewConfig().WithEndpoint(s.endpoint).WithRegion(s.region))

	expressionAttributeValues := map[string]*dynamodb.AttributeValue {
		":id": &dynamodb.AttributeValue{S: aws.String(id)},
	}

	queryInput := dynamodb.QueryInput {
		TableName: aws.String("EndOfDay"),
		ExpressionAttributeValues: expressionAttributeValues,
		Limit: aws.Int64(1),
		ScanIndexForward: aws.Bool(false),
		KeyConditionExpression: aws.String("id = :id"),
	}

	resp, err := client.Query(&queryInput)
	if err != nil {
		return &domain.EndOfDayItem{}, err
	}

	if *resp.Count == 0 {
		return nil, errors.New("Item not found")
	}

	err = dynamodbattribute.UnmarshalMap(resp.Items[0],  &endOfDayItem)
	
	return &endOfDayItem, err
}
