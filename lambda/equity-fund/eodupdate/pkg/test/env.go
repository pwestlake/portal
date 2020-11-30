package test

import (
	"os"
	"path/filepath"
	"encoding/json"
	"log"
	"io/ioutil"
)

// Environment ...
type Environment struct {
	Region string `json:"REGION"`
	DynamoDbEndpoint string `json:"DYNAMODB_ENDPOINT"`
	YahooEndpoint string `json:"YAHOO_ENDPOINT"`
	LSEEndpoint string `json:"LSE_ENDPOINT"`
	LSENewsEndpoint string `json:"LSE_NEWS_ENDPOINT"`
}

// ConfigureTestEnvironment ...
// Import environment variables from the file env.json
func ConfigureTestEnvironment() {
	path, err := filepath.Abs("pkg/test/env.json")
	if err != nil {
		log.Printf("Failed to create path for env.json. %v", err)
		return
	}

	file, err := ioutil.ReadFile(path)
	if err != nil {
		log.Printf("Failed to read file env.json. %v", err)
		return
	}

	environment := Environment{}

	err = json.Unmarshal([]byte(file), &environment)
	if err != nil {
		log.Printf("Failed to unmarshal env.json. %v", err)
		return
	}

	os.Setenv("REGION", environment.Region)
	os.Setenv("DYNAMODB_ENDPOINT", environment.DynamoDbEndpoint)
	os.Setenv("YAHOO_ENDPOINT", environment.YahooEndpoint)
	os.Setenv("LSE_ENDPOINT", environment.LSEEndpoint)
	os.Setenv("LSE_NEWS_ENDPOINT", environment.LSENewsEndpoint)
}