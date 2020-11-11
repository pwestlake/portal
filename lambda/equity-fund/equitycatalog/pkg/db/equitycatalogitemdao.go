package db

import (
	"github.com/pwestlake/portal/lambda/equity-fund/equitycatalog/pkg/domain"
	"os"
	"log"
	"time"
	"errors"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/dynamodb"
	"github.com/aws/aws-sdk-go/service/dynamodb/dynamodbattribute"
	"github.com/aws/aws-sdk-go/service/dynamodb/expression"
	"github.com/google/uuid"
)

// EquityCatalogItemDAO ...
// DAO for an EquityCatalogItem
type EquityCatalogItemDAO struct {
	endpoint string
	region   string
}

// NewEquityCatalogItemDAO ...
// Create function for a NewUserDao
func NewEquityCatalogItemDAO() EquityCatalogItemDAO {
	return EquityCatalogItemDAO{
		endpoint: os.Getenv("DYNAMODB_ENDPOINT"),
		region: os.Getenv("REGION"),
	}
}

// PutEquityCatalogItem ...
// DAO method to persist a new EquityCatalogItem in the database
func (s *EquityCatalogItemDAO) PutEquityCatalogItem(equityCatalogItem *domain.EquityCatalogItem) error {
	dbSession := session.Must(session.NewSession())
	client := dynamodb.New(dbSession, aws.NewConfig().WithEndpoint(s.endpoint).WithRegion(s.region))

	if (len(equityCatalogItem.ID) == 0) {
		equityCatalogItem.ID = uuid.New().String()
	}
	if (equityCatalogItem.DateCreated == time.Time{}) {
		equityCatalogItem.DateCreated = time.Now()
	}

	av, err := dynamodbattribute.MarshalMap(equityCatalogItem)
	if err != nil {
		log.Printf("Error marshalling EquityCatalogItem type")
	} else {
		input := &dynamodb.PutItemInput{
			Item:      av,
			TableName: aws.String("EquityCatalog")}

		_, err = client.PutItem(input)
	}

	return err
}

// GetEquityCatalogItem ...
// DAO method to retrieve an EquityCatalogItem with the given id f
func (s *EquityCatalogItemDAO) GetEquityCatalogItem(id string, equityCatalogItem *domain.EquityCatalogItem) error {
	dbSession := session.Must(session.NewSession())
	client := dynamodb.New(dbSession, aws.NewConfig().WithEndpoint(s.endpoint).WithRegion(s.region))

	result, err := client.GetItem(&dynamodb.GetItemInput{
		TableName: aws.String("EquityCatalog"),
		Key: map[string]*dynamodb.AttributeValue{
			"id": {
				S: aws.String(id)}}})
	if err != nil {
		return err
	}

	if result.Item == nil {
		return errors.New("Item not found")
	}

	err = dynamodbattribute.UnmarshalMap(result.Item, equityCatalogItem)
	return err
}

// GetEquityCatalogItems ...
// DAO method to return an array of all EquityCatalogItems 
func (s *EquityCatalogItemDAO) GetEquityCatalogItems() (*[]domain.EquityCatalogItem, error) {
	var equityCatalogItems []domain.EquityCatalogItem
	dbSession := session.Must(session.NewSession())
	client := dynamodb.New(dbSession, aws.NewConfig().WithEndpoint(s.endpoint).WithRegion(s.region))

	params := &dynamodb.ScanInput{
		TableName: aws.String("EquityCatalog")}

	result, err := client.Scan(params)

	if err == nil {
		equityCatalogItems = make([]domain.EquityCatalogItem, len(result.Items))
		for i, item := range result.Items {
			equityCatalogItem := domain.EquityCatalogItem{}
			err = dynamodbattribute.UnmarshalMap(item, &equityCatalogItem)
			if err != nil {
				break;
			} else {
				equityCatalogItems[i] = equityCatalogItem
			}
		}
	}
	return &equityCatalogItems, err
}

// GetEquityCatalogItemsByDatasource ...
// DAO method to return an array of all EquityCatalogItems with the given datasource
func (s *EquityCatalogItemDAO) GetEquityCatalogItemsByDatasource(datasource string) (*[]domain.EquityCatalogItem, error) {
	var equityCatalogItems []domain.EquityCatalogItem
	dbSession := session.Must(session.NewSession())
	client := dynamodb.New(dbSession, aws.NewConfig().WithEndpoint(s.endpoint).WithRegion(s.region))

	filter := expression.Name("datasource").Equal(expression.Value(datasource))
	expr, err := expression.NewBuilder().WithFilter(filter).Build()
	if err != nil {
		return nil, err
	}
	params := &dynamodb.ScanInput{
		TableName: aws.String("EquityCatalog"),
		ExpressionAttributeNames:  expr.Names(),
		ExpressionAttributeValues: expr.Values(),
		FilterExpression: expr.Filter()}

	result, err := client.Scan(params)

	if err != nil {
		return nil, err
	}

	equityCatalogItems = make([]domain.EquityCatalogItem, len(result.Items))
	for i, item := range result.Items {
		equityCatalogItem := domain.EquityCatalogItem{}
		err = dynamodbattribute.UnmarshalMap(item, &equityCatalogItem)
		if err != nil {
			break;
		} else {
			equityCatalogItems[i] = equityCatalogItem
		}
	}
	
	return &equityCatalogItems, err
}

// GetEquityCatalogItemsBySymbol ...
// DAO method to retrieve EquityCatalogItems by symbol
func (s *EquityCatalogItemDAO) GetEquityCatalogItemsBySymbol(symbol string) (*[]domain.EquityCatalogItem, error) {
	var equityCatalogItems []domain.EquityCatalogItem
	var err error
	dbSession := session.Must(session.NewSession())
	client := dynamodb.New(dbSession, aws.NewConfig().WithEndpoint(s.endpoint).WithRegion(s.region))

	filter := expression.Name("symbol").Equal(expression.Value(symbol))
	expr, err := expression.NewBuilder().WithFilter(filter).Build()
	if err != nil {
		return nil, err
	}

	params := &dynamodb.ScanInput{
		TableName: aws.String("EquityCatalog"),
		ExpressionAttributeNames:  expr.Names(),
		ExpressionAttributeValues: expr.Values(),
		FilterExpression: expr.Filter(),
	}

	result, err := client.Scan(params)
	if err != nil {
		return nil, err
	}

	equityCatalogItems = make([]domain.EquityCatalogItem, len(result.Items))
	for i, item := range result.Items {
		equityCatalogItem := domain.EquityCatalogItem{}
		err = dynamodbattribute.UnmarshalMap(item, &equityCatalogItem)
		if err != nil {
			break;
		} else {
			equityCatalogItems[i] = equityCatalogItem
		}
	}

	return &equityCatalogItems, err
}