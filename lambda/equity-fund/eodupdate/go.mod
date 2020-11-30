module github.com/pwestlake/portal/lambda/equity-fund/eodupdate

go 1.14

require (
	cloud.google.com/go v0.72.0
	github.com/aws/aws-lambda-go v1.20.0
	github.com/google/wire v0.4.0
	github.com/pwestlake/equity-fund v0.0.0-20201118123243-17d46a854a73 // indirect
	github.com/pwestlake/portal/lambda/equity-fund/eod v0.0.0-20201127112637-5d79a2f0dc71
	github.com/pwestlake/portal/lambda/equity-fund/equitycatalog v0.0.0-20201127112637-5d79a2f0dc71
	github.com/pwestlake/portal/lambda/equity-fund/news v0.0.0-20201127112637-5d79a2f0dc71
	google.golang.org/genproto v0.0.0-20201119123407-9b1e624d6bc4
)
