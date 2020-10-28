package db

import (
	"log"
	"github.com/aws/aws-sdk-go/service/dynamodb/dynamodbattribute"
	"os"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/dynamodb"
)

// Covid19SummaryItemDao ...
// DAO component for sourcing or storing Covid19SummaryItems
type Covid19SummaryItemDao struct {
	endpoint string
	region string
}

// NewCovid19SummaryItemDao ...
// Create function for the Covid19SummaryItemDao component
func NewCovid19SummaryItemDao() Covid19SummaryItemDao {
	return Covid19SummaryItemDao{
		endpoint: os.Getenv("DYNAMODB_ENDPOINT"),
		region: os.Getenv("REGION"),
	}
}

// GetItems ...
// Get all Covid19SummaryItems
func (s *Covid19SummaryItemDao) GetItems() (*[]Covid19SummaryItem, error) {
	var covid19SummaryItems []Covid19SummaryItem

	//creds := credentials.NewStaticCredentials(os.Getenv("AWS_ACCESS_KEY_ID"), os.Getenv("AWS_SECRET_ACCESS_KEY"), "")
	dbSession := session.Must(session.NewSession())
	client := dynamodb.New(dbSession, aws.NewConfig().WithEndpoint(s.endpoint).WithRegion(s.region))

	params := &dynamodb.ScanInput{
		TableName: aws.String("Covid19Summary"),
	}

	complete := false
	for !complete {
		result, err := client.Scan(params)
		if err != nil {
			return nil, err
		}

		items := []Covid19SummaryItem{}
		
		err = dynamodbattribute.UnmarshalListOfMaps(result.Items, &items)
		log.Print(err)
		if err != nil {
			return nil, err
		}

		covid19SummaryItems = append(covid19SummaryItems, items...)
		
		if result.LastEvaluatedKey != nil {
			params.ExclusiveStartKey = result.LastEvaluatedKey
		} else {
			complete = true
		}
	}

	return &covid19SummaryItems, nil
}