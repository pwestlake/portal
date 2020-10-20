package db

import (
	"log"
	"github.com/aws/aws-sdk-go/service/dynamodb/dynamodbattribute"
	"github.com/pwestlake/portal/lambda/covid19/covid19data/pkg/domain"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/dynamodb"
	"os"

)

// Covid19DataDao ...
type Covid19DataDao struct {
	endpoint string
	region   string
}

// NewCovid19DataDao ...
// Create function for a NewUserDao
func NewCovid19DataDao() Covid19DataDao {
	return Covid19DataDao{
		endpoint: os.Getenv("DYNAMODB_ENDPOINT"),
		region: os.Getenv("REGION"),
	}
}

// GetDataForRegion ...
// Returns a pointer to an array of Covid19DataItems with the given region
func (s *Covid19DataDao) GetDataForRegion(regionName string) (*[]domain.Covid19DataItem, error) {
	var result = []domain.Covid19DataItem{}
	dbSession := session.Must(session.NewSession())
	client := dynamodb.New(dbSession, aws.NewConfig().WithEndpoint(s.endpoint).WithRegion(s.region))

	expressionAttributeValues := map[string]*dynamodb.AttributeValue {
		":region": &dynamodb.AttributeValue{S: aws.String(regionName)},
	}

	queryInput := dynamodb.QueryInput {
		TableName: aws.String("Covid-19"),
		ExpressionAttributeValues: expressionAttributeValues,
		KeyConditionExpression: aws.String("countryExp = :region"),
	}

	complete := false
	for !complete {
		resp, err := client.Query(&queryInput)
		if err != nil {
			return nil, err
		}

		items := []domain.Covid19DataItem{}
		
		err = dynamodbattribute.UnmarshalListOfMaps(resp.Items, &items)
		if err != nil {
			log.Print(err)
			return nil, err
		}

		result = append(result, items...)
		
		if resp.LastEvaluatedKey != nil {
			queryInput.ExclusiveStartKey = resp.LastEvaluatedKey
		} else {
			complete = true
		}
	}

	return &result, nil
}