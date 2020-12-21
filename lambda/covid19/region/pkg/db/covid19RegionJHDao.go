package db

import (
	"log"
	"github.com/aws/aws-sdk-go/service/dynamodb/dynamodbattribute"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/service/dynamodb"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/pwestlake/portal/lambda/covid19/region/pkg/domain"
	"os"

)

// Covid19RegionJHDao ...
type Covid19RegionJHDao struct {
	endpoint string
	region   string
}

// NewCovid19RegionJHDao ...
// Create function for a NewCovid19RegionJHDao
func NewCovid19RegionJHDao() Covid19RegionJHDao {
	return Covid19RegionJHDao{
		endpoint: os.Getenv("DYNAMODB_ENDPOINT"),
		region: os.Getenv("REGION"),
	}
}


// GetRegions ...
func (s *Covid19RegionJHDao) GetRegions() (*[]domain.Region, error) {
	var regions = []domain.Region{}
	dbSession := session.Must(session.NewSession())
	client := dynamodb.New(dbSession, aws.NewConfig().WithEndpoint(s.endpoint).WithRegion(s.region))

	params := &dynamodb.ScanInput{
		TableName: aws.String("Covid19RegionsJH"),
	}

	complete := false
	for !complete {
		result, err := client.Scan(params)
		if err != nil {
			return nil, err
		}

		items := []domain.Region{}
		
		err = dynamodbattribute.UnmarshalListOfMaps(result.Items, &items)
		if err != nil {
			log.Print(err)
			return nil, err
		}

		for _, v := range items {
			regions = append(regions, v)
		}
		
		if result.LastEvaluatedKey != nil {
			params.ExclusiveStartKey = result.LastEvaluatedKey
		} else {
			complete = true
		}
	}

	return &regions, nil
}

// PutRegions ...
// Write the given array of Regions to the database
// Return the number of items written
func (s *Covid19RegionJHDao) PutRegions(data *[]domain.Region) (int, error) {
	dbSession := session.Must(session.NewSession())
	client := dynamodb.New(dbSession, aws.NewConfig().WithEndpoint(s.endpoint).WithRegion(s.region))

	count := 0
	var err error = nil
	for _, v := range *data {
		av, err := dynamodbattribute.MarshalMap(v)
		if err != nil {
			break
		}

		input := &dynamodb.PutItemInput{
			Item:      av,
			TableName: aws.String("Covid19RegionsJH"),
		}

		_, err = client.PutItem(input)
		if err != nil {
			break
		}
		
		count++
	}

	return count, err
}
