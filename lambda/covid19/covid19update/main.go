package main

import (
	"github.com/pwestlake/portal/lambda/covid19/covid19update/pkg/domain"
	"log"
	"time"
	"github.com/pwestlake/portal/lambda/covid19/covid19update/pkg/service"
	"context"
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

func handler(ctx context.Context, event events.CloudWatchEvent) {
	covid19DataService := service.InitializeCovid19DataService()
	
	extractLogItems, err := covid19DataService.GetExtractLogItemsForExtractDate(time.Now())
	if err != nil {
		log.Printf("Failed to read extract log, %v", err)
	}

	if len(*extractLogItems) > 0 {
		log.Print("Data has already been extracted and loaded for today. Ignoring")
		return
	}

	// Get latest data
	latest, err := covid19DataService.SourceDataFromJSON()
	if err != nil {
		log.Printf("Failed to source data from ecdc. Error: %v", err)
		return
	}

	if len(*latest) == 0 {
		log.Printf("Nothing new to update.")
		return
	} 

	// Save the latest data
	rows, err := covid19DataService.PersistData(latest)
	if err != nil {
		log.Printf("Failed to persist covid data. Error: %v", err)
		return;
	}

	log.Printf("Persisted %d rows of Covid-19 data", rows)
	
	// Save a summary of the latest data
	rows, err = covid19DataService.PersistSummaryData(latest)
	if err != nil {
		log.Printf("Failed to persist summary data. Error: %v", err)
	}

	log.Printf("Persisted %d rows of summary data", rows)

	// Register that the data has been updated for today
	extractLogItem := domain.ExtractLogItem {
		ExtractDate: time.Now().Format("20060102"),
		ItemCountInserted: rows,
	}

	covid19DataService.AddToExtractLogItems(extractLogItem)
	if err != nil {
		log.Printf("Failed to update extract log. Error %v", err)
	}

	log.Print("Update complete")
}

func main() {
	lambda.Start(handler)
}