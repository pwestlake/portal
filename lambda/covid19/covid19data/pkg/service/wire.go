//+build wireinject

package service

import (
	"github.com/pwestlake/portal/lambda/covid19/covid19data/pkg/domain"
	"github.com/pwestlake/portal/lambda/covid19/covid19data/pkg/db"
	"github.com/google/wire"
)

type dummyService struct {
	covid19DataDao db.Covid19DataDao
}

func InitializeCovid19DataService() Covid19DataServiceInterface {
	wire.Build(NewCovid19DataService, db.NewCovid19DataDao)
	return &dummyService{}
}

// GetDataForRegion ...
// Dummy method
func (s *dummyService) GetDataForRegion(regionName string) (*[]domain.Covid19DataItem, error) {
	return nil, nil
}
