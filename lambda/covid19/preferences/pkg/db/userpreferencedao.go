package db

import (
	"log"
	"time"
	"errors"
	"os"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/dynamodb"
	"github.com/aws/aws-sdk-go/service/dynamodb/dynamodbattribute"
)

// UserPreferenceDao ...
type UserPreferenceDao struct {
	endpoint string
	region   string
}

// NewUserPreferenceDao ...
// Create function for a NewUserDao
func NewUserPreferenceDao() UserPreferenceDao {
	return UserPreferenceDao{
		endpoint: os.Getenv("DYNAMODB_ENDPOINT"),
		region: os.Getenv("REGION"),
	}
}

// PutUserPreference ...
// DAO method to persist a new user preference in the database
func (s *UserPreferenceDao) PutUserPreference(userPreference *UserPreference) error {
	dbSession := session.Must(session.NewSession())
	client := dynamodb.New(dbSession, aws.NewConfig().WithEndpoint(s.endpoint).WithRegion(s.region))

	if (userPreference.DateCreated == time.Time{}) {
		userPreference.DateCreated = time.Now()
	}

	av, err := dynamodbattribute.MarshalMap(userPreference)
	if err != nil {
		log.Printf("Error marshalling UserPreference type")
	} else {
		input := &dynamodb.PutItemInput{
			Item:      av,
			TableName: aws.String("UserPreferences")}

		_, err = client.PutItem(input)
	}

	return err
}

// UpdateUserPreference ...
// DAO method to update a user in the UserPreferences table
func (s *UserPreferenceDao) UpdateUserPreference(userPreference *UserPreference) error {
	userPreference.LastModified = time.Now()
	return s.PutUserPreference(userPreference)
}

// GetUserPreference ...
// DAO method to retrieve a user preference with the given id and key from the UserPreferences table
func (s *UserPreferenceDao) GetUserPreference(id string, key string, userPreference *UserPreference) error {
	dbSession := session.Must(session.NewSession())
	client := dynamodb.New(dbSession, aws.NewConfig().WithEndpoint(s.endpoint).WithRegion(s.region))

	result, err := client.GetItem(&dynamodb.GetItemInput{
		TableName: aws.String("UserPreferences"),
		Key: map[string]*dynamodb.AttributeValue{
			"userid": {S: aws.String(id)},
			"key": {S: aws.String(key)}}})
	if err != nil {
		return err
	}

	if result.Item == nil {
		return errors.New("Item not found")
	}

	err = dynamodbattribute.UnmarshalMap(result.Item, userPreference)
	return err
}