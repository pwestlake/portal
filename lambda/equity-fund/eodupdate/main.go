package main

import (
	"github.com/pwestlake/portal/lambda/equity-fund/eodupdate/pkg/service"
	"log"
	"context"
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

func handler(ctx context.Context, event events.CloudWatchEvent) {
	eodUpdateService := service.InitializeEODUpdateService()
	eodUpdateService.UpdateWithLatest()
	
	log.Print("Update complete")
}

func main() {
	lambda.Start(handler)
}
