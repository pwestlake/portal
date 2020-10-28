package main

import (
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

	log.Printf("%d extract log items found", len(*extractLogItems))
}

func main() {
	lambda.Start(handler)
}