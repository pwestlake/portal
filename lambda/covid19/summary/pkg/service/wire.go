//+build wireinject

package service

import (
	"github.com/pwestlake/portal/lambda/covid19/summary/pkg/db"
	"github.com/google/wire"
)

func InitializeCovid19DataService() Covid19DataServiceInterface {
	wire.Build(NewCovid19DataService, db.NewCovid19SummaryItemDao)
	return Covid19DataService{}
}
