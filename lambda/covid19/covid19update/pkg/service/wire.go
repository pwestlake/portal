//+build wireinject

package service

import (
	"time"
	"github.com/pwestlake/portal/lambda/covid19/covid19update/pkg/domain"
	"github.com/pwestlake/portal/lambda/covid19/covid19update/pkg/db"
	"github.com/google/wire"
)

type dummyService struct {
	covid19DataDao db.Covid19DataDao
	extractLogItemDao db.ExtractLogItemDao
}

func InitializeCovid19DataService() Covid19DataServiceInterface {
	wire.Build(NewCovid19DataService, db.NewCovid19DataDao, db.NewExtractLogItemDao)
	return &dummyService{}
}

func (s *dummyService) AddToExtractLogItems(item domain.ExtractLogItem) error {
	return nil
}

func (s *dummyService) GetExtractLogItemsForExtractDate(date time.Time) (*[]domain.ExtractLogItem, error) {
	return nil, nil
}