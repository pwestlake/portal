package main

import (
	"log"
	"context"
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

func handler(ctx context.Context, event events.CloudWatchEvent) {
	log.Print("Update complete")
}

func main() {
	lambda.Start(handler)
}
