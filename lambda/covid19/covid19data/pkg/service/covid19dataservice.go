package service

import (
	"github.com/pwestlake/portal/lambda/covid19/covid19data/pkg/db"
	"github.com/pwestlake/portal/lambda/covid19/covid19data/pkg/domain"

)

// Covid19DataServiceInterface ...
// Covid19DataService interface
type Covid19DataServiceInterface interface {
	GetDataForRegion(regionName string) (*[]domain.Covid19DataItem, error)
}

// Covid19DataService ...
type covid19DataService struct {
	covid19DataDao db.Covid19DataDao
}

// NewCovid19DataService ...
// Create function for a NewRegionService
func NewCovid19DataService(covid19DataDao db.Covid19DataDao) Covid19DataServiceInterface {
	return &covid19DataService{covid19DataDao: covid19DataDao}
}

func (s *covid19DataService) GetDataForRegion(regionName string) (*[]domain.Covid19DataItem, error) {
	return s.covid19DataDao.GetDataForRegion(regionName)
}