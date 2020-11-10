package service

import (
	"os"
	"log"
	"testing"
)

func SourceDataFromJSON(t *testing.T) {
	covid19DataService := InitializeCovid19DataService()

	items, err := covid19DataService.SourceDataFromJSON()
	if err != nil {
		t.Errorf("SourceDataFromJson returned error %v", err)
	}

	log.Printf("%d", len(*items))
}

func PersistData(t *testing.T) {
	os.Setenv("DYNAMODB_ENDPOINT", "https://dynamodb.eu-west-2.amazonaws.com")
	os.Setenv("REGION", "eu-west-2")

	covid19DataService := InitializeCovid19DataService()
	items, err := covid19DataService.SourceDataFromJSON()
	if err != nil {
		t.Errorf("SourceDataFromJson returned error %v", err)
	}

	if len(*items) > 0 {
		rows, err := covid19DataService.PersistData(items)
		if err != nil {
			t.Errorf("PersistData returned with error %v", err)
		}

		log.Printf("Persisted %d rows", rows)
	}
}

func TestPersisSummaryData(t *testing.T) {
	os.Setenv("DYNAMODB_ENDPOINT", "https://dynamodb.eu-west-2.amazonaws.com")
	os.Setenv("REGION", "eu-west-2")

	covid19DataService := InitializeCovid19DataService()
	items, err := covid19DataService.SourceDataFromJSON()
	if err != nil {
		t.Errorf("SourceDataFromJson returned error %v", err)
	}

	if len(*items) > 0 {
		rows, err := covid19DataService.PersistSummaryData(items)
		if err != nil {
			t.Errorf("PersistData returned with error %v", err)
		}

		log.Printf("Persisted %d rows", rows)
	}
}