package db

import (
	"github.com/aws/aws-sdk-go/service/dynamodb/dynamodbattribute"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/service/dynamodb"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/google/uuid"
	"time"
	"github.com/pwestlake/portal/lambda/covid19/covid19update/pkg/domain"
	"os"
)

// ExtractLogItemDao ...
type ExtractLogItemDao struct {
	endpoint string
	region   string
}

// NewExtractLogItemDao ...
// Create function for a ExtractLogItemDao
func NewExtractLogItemDao() ExtractLogItemDao {
	return ExtractLogItemDao{
		endpoint: os.Getenv("DYNAMODB_ENDPOINT"),
		region: os.Getenv("REGION"),
	}
}

// SaveItem ...
// Persist the given item in the database
func (s *ExtractLogItemDao) SaveItem(item domain.ExtractLogItem) error {
	uuid := uuid.New()
	item.ID = uuid.String()
	item.DateInserted = time.Now().Format("20060102 15:04:05")

	dbSession := session.Must(session.NewSession())
	client := dynamodb.New(dbSession, aws.NewConfig().WithEndpoint(s.endpoint).WithRegion(s.region))

	av, err := dynamodbattribute.MarshalMap(item)
	if err != nil {
		return err
	}

	input := &dynamodb.PutItemInput{
		Item:      av,
		TableName: aws.String("ExtractLogItems"),
	}

	_, err = client.PutItem(input)
	if err != nil {
		return err
	}

	return nil
}

// GetItemsForExtractDate ...
// Return a pointer to an array of ExtractLogItem with the given extract date
func (s * ExtractLogItemDao) GetItemsForExtractDate(date time.Time) (*[]domain.ExtractLogItem, error) {
	var result = []domain.ExtractLogItem{}
	dbSession := session.Must(session.NewSession())
	client := dynamodb.New(dbSession, aws.NewConfig().WithEndpoint(s.endpoint).WithRegion(s.region))

	dateString := date.Format("20060102")

	expressionAttributeValues := map[string]*dynamodb.AttributeValue {
		":extractDate": &dynamodb.AttributeValue{S: aws.String(dateString)},
	}

	queryInput := dynamodb.QueryInput {
		TableName: aws.String("ExtractLogItems"),
		IndexName: aws.String("extractDate-id-index"),
		ExpressionAttributeValues: expressionAttributeValues,
		KeyConditionExpression: aws.String("extractDate = :extractDate"),
	}

	resp, err := client.Query(&queryInput)
	err = dynamodbattribute.UnmarshalListOfMaps(resp.Items, &result)
	if err != nil {
		return nil, err
	}


	return &result, nil
}