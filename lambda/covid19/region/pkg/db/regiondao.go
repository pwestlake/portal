package db

import (
	"log"
	"github.com/aws/aws-sdk-go/service/dynamodb/dynamodbattribute"
	"os"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/dynamodb"
)

// RegionDao ...
type RegionDao struct {
	endpoint string
	region   string
}

type regionEntry struct {
	Name string
}

// NewRegionDao ...
// Create function for a NewUserDao
func NewRegionDao() RegionDao {
	return RegionDao{
		endpoint: os.Getenv("DYNAMODB_ENDPOINT"),
		region: os.Getenv("REGION"),
	}
}

// GetRegionNames ...
func (s *RegionDao) GetRegionNames() (*[]string, error) {
	var names = []string{}
	dbSession := session.Must(session.NewSession())
	client := dynamodb.New(dbSession, aws.NewConfig().WithEndpoint(s.endpoint).WithRegion(s.region))

	params := &dynamodb.ScanInput{
		TableName: aws.String("Covid19Countries"),
	}

	complete := false
	for !complete {
		result, err := client.Scan(params)
		if err != nil {
			return nil, err
		}

		items := []regionEntry{}
		
		err = dynamodbattribute.UnmarshalListOfMaps(result.Items, &items)
		log.Print(err)
		if err != nil {
			return nil, err
		}

		for _, v := range items {
			names = append(names, v.Name)
		}
		
		if result.LastEvaluatedKey != nil {
			params.ExclusiveStartKey = result.LastEvaluatedKey
		} else {
			complete = true
		}
	}

	return &names, nil
}
