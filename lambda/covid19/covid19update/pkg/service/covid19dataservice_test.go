package service

import (
	"log"
	"testing"
)

func TestSourceDataFromJSON(t *testing.T) {
	covid19DataService := InitializeCovid19DataService()

	items, err := covid19DataService.SourceDataFromJSON()
	if err != nil {
		t.Errorf("SourceDataFromJson returned error %v", err)
	}

	log.Printf("%d", len(*items))
}