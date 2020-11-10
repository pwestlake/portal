package db

import (
	"math"
	"log"
	"github.com/aws/aws-sdk-go/service/dynamodb/dynamodbattribute"
	"github.com/pwestlake/portal/lambda/covid19/covid19update/pkg/domain"
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

// PersistData ...
// Write the given list of items to the database.
// Return the number of items written
func (s *Covid19DataDao) PersistData(data *[]domain.Covid19DataItem) (int, error) {
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
			TableName: aws.String("Covid-19"),
		}

		_, err = client.PutItem(input)
		if err != nil {
			break
		}
		
		count++
	}

	return count, err
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

// GetAllCovidItems ...
// Get the first 'count' items from the Covid-19 table from the offset that is specified by
// the given Covid19DataItem 
func (s *Covid19DataDao) GetAllCovidItems(count int, 
	from *domain.Covid19DataItem, regionName string) (*[]domain.Covid19DataItem, error) {
	var result = []domain.Covid19DataItem{}
	dbSession := session.Must(session.NewSession())
	client := dynamodb.New(dbSession, aws.NewConfig().WithEndpoint(s.endpoint).WithRegion(s.region))
	
	if regionName != "" {
		return queryCovidItems(count, from, regionName, s.endpoint, s.region)
	}

	scanInput := dynamodb.ScanInput{
		TableName: aws.String("Covid-19"),
		Limit: aws.Int64(int64(count)),
	}

	if from != nil {
		exclusiveStartKey := map[string]*dynamodb.AttributeValue {
			"countryExp": &dynamodb.AttributeValue{S: aws.String(from.CountryExp)},
			"dateRep": &dynamodb.AttributeValue{S: aws.String(from.DateRep)},
		}
		scanInput.ExclusiveStartKey = exclusiveStartKey
	}

	complete := false
	for !complete {
		resp, err := client.Scan(&scanInput)
		if err != nil {
			log.Printf("Scan error %s", err)
			return nil, err
		}

		items := []domain.Covid19DataItem{}
		
		err = dynamodbattribute.UnmarshalListOfMaps(resp.Items, &items)
		if err != nil {
			log.Print(err)
			return nil, err
		}

		result = append(result, items...)
		
		if len(result) < count && resp.LastEvaluatedKey != nil {
			scanInput.ExclusiveStartKey = resp.LastEvaluatedKey
		} else {
			complete = true
		}
	}
	
	trimmed := result[0: int(math.Min(float64(count), float64(len(result))))]
	return &trimmed, nil
}

func queryCovidItems(count int, 
	from *domain.Covid19DataItem, regionName string, endpoint string, region string) (*[]domain.Covid19DataItem, error) {
	var result = []domain.Covid19DataItem{}
	dbSession := session.Must(session.NewSession())
	client := dynamodb.New(dbSession, aws.NewConfig().WithEndpoint(endpoint).WithRegion(region))
	
	expressionAttributeValues := map[string]*dynamodb.AttributeValue {
		":countryExp": &dynamodb.AttributeValue{S: aws.String(regionName)},
	}

	queryInput := dynamodb.QueryInput{
		TableName: aws.String("Covid-19"),
		Limit: aws.Int64(int64(count)),
		ExpressionAttributeValues: expressionAttributeValues,
		KeyConditionExpression: aws.String("countryExp = :countryExp"),
	}

	if from != nil {
		exclusiveStartKey := map[string]*dynamodb.AttributeValue {
			"countryExp": &dynamodb.AttributeValue{S: aws.String(from.CountryExp)},
			"dateRep": &dynamodb.AttributeValue{S: aws.String(from.DateRep)},
		}
		queryInput.ExclusiveStartKey = exclusiveStartKey
	}

	complete := false
	for !complete {
		resp, err := client.Query(&queryInput)
		if err != nil {
			log.Printf("Query error %s", err)
			return nil, err
		}

		items := []domain.Covid19DataItem{}
		
		err = dynamodbattribute.UnmarshalListOfMaps(resp.Items, &items)
		if err != nil {
			log.Print(err)
			return nil, err
		}

		result = append(result, items...)
		
		if len(result) < count && resp.LastEvaluatedKey != nil {
			queryInput.ExclusiveStartKey = resp.LastEvaluatedKey
		} else {
			complete = true
		}
	}
	
	trimmed := result[0: int(math.Min(float64(count), float64(len(result))))]
	return &trimmed, nil
}