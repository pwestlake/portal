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
	covid19SummaryItemDao db.Covid19SummaryItemDao
}

func InitializeCovid19DataService() Covid19DataServiceInterface {
	wire.Build(NewCovid19DataService, db.NewCovid19DataDao, db.NewExtractLogItemDao, db.NewCovid19SummaryItemDao)
	return &dummyService{}
}

func (s *dummyService) AddToExtractLogItems(item domain.ExtractLogItem) error {
	return nil
}

func (s *dummyService) GetExtractLogItemsForExtractDate(date time.Time) (*[]domain.ExtractLogItem, error) {
	return nil, nil
}

func (s *dummyService) PersistData(data *[]domain.Covid19DataItem) (int, error) {
	return 0, nil
}

func (s *dummyService) SourceDataFromJSON() (*[]domain.Covid19DataItem, error) {
	return nil, nil
}

func (s *dummyService) PersistSummaryData(data *[]domain.Covid19DataItem) (int, error) {
	return 0, nil
}
