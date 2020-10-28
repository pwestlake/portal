package handler

import (
	"encoding/json"
	"io/ioutil"
	"os"
	"github.com/pwestlake/portal/lambda/covid19/summary/pkg/db"
	"github.com/pwestlake/portal/lambda/covid19/summary/pkg/domain"
	"testing"
)

type covidDataServiceMock struct {
}

// Test, return the top 20 cases sorted by size descending
func TestHandleAllCovidCases(t *testing.T) {
	headers := map[string]string{
		"Access-Control-Allow-Origin": "*", 
		"Access-Control-Allow-Methods": "GET",
		"Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept",
		"Content-Type": "application/json",
	}

	result, err := HandleAllCovidCases(false, 1, headers, &covidDataServiceMock{})
	if err != nil {
		t.Errorf("HandleAllCovidCases returned with error: %v", err)
		return
	}

	var items []domain.ValuePair
	err = json.Unmarshal([]byte(result.Body), &items)
	if err != nil {
		t.Errorf("Failed to unmarshal result: %v", err)
		return
	}

	if len(items) != 20 {
		t.Errorf("Expected 20 items, got %d", len(items))
		return
	}

	if items[0].Key.(string) != "United_States_of_America" {
		t.Errorf("Expected United_States_of_America as first item, got %s", items[0].Key.(string))
	}
}

// Test, return the top 20 deaths sorted by size descending
func TestHandleAllCovidDeaths(t *testing.T) {
	headers := map[string]string{
		"Access-Control-Allow-Origin": "*", 
		"Access-Control-Allow-Methods": "GET",
		"Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept",
		"Content-Type": "application/json",
	}

	result, err := HandleAllCovidDeaths(false, 1, headers, &covidDataServiceMock{})
	if err != nil {
		t.Errorf("HandleAllCovidDeaths returned with error: %v", err)
		return
	}

	var items []domain.ValuePair
	err = json.Unmarshal([]byte(result.Body), &items)
	if err != nil {
		t.Errorf("Failed to unmarshal result: %v", err)
		return
	}

	if len(items) != 20 {
		t.Errorf("Expected 20 items, got %d", len(items))
		return
	}

	if items[0].Key.(string) != "United_States_of_America" {
		t.Errorf("Expected United_States_of_America as first item, got %s", items[0].Key.(string))
	}
}

// Test, return top 20 cases where values are given per 100000 of population.
// Sorted by size descending
func TestHandleAllCovidCasesPer100000(t *testing.T) {
	headers := map[string]string{
		"Access-Control-Allow-Origin": "*", 
		"Access-Control-Allow-Methods": "GET",
		"Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept",
		"Content-Type": "application/json",
	}

	result, err := HandleAllCovidCases(true, 100000, headers, &covidDataServiceMock{})
	if err != nil {
		t.Errorf("HandleAllCovidCases returned with error: %v", err)
		return
	}

	var items []domain.ValuePair
	err = json.Unmarshal([]byte(result.Body), &items)
	if err != nil {
		t.Errorf("Failed to unmarshal result: %v", err)
		return
	}

	if len(items) != 20 {
		t.Errorf("Expected 20 items, got %d", len(items))
		return
	}
}

// Test, return top 20 deaths where values are given per 100000 of population.
// Sorted by size descending
func TestHandleAllCovidDeathsPer100000(t *testing.T) {
	headers := map[string]string{
		"Access-Control-Allow-Origin": "*", 
		"Access-Control-Allow-Methods": "GET",
		"Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept",
		"Content-Type": "application/json",
	}

	result, err := HandleAllCovidDeaths(true, 100000, headers, &covidDataServiceMock{})
	if err != nil {
		t.Errorf("HandleAllCovidDeaths returned with error: %v", err)
		return
	}

	var items []domain.ValuePair
	err = json.Unmarshal([]byte(result.Body), &items)
	if err != nil {
		t.Errorf("Failed to unmarshal result: %v", err)
		return
	}

	if len(items) != 20 {
		t.Errorf("Expected 20 items, got %d", len(items))
		return
	}
}

func (s *covidDataServiceMock) GetSummaryItems() (*[]db.Covid19SummaryItem, error) {
	jsonFile, err := os.Open("../../test/total-cases.json")
	defer jsonFile.Close()
	if err != nil {
		return nil, err
	}

	byteValue, err := ioutil.ReadAll(jsonFile)
	if err != nil {
		return nil, err
	}

	var items []db.Covid19SummaryItem
	err = json.Unmarshal(byteValue, &items)
	if err != nil {
		return nil, err
	}

	return &items, nil
}

