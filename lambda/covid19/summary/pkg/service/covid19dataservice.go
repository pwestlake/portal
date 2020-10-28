package service

import (
	"github.com/pwestlake/portal/lambda/covid19/summary/pkg/db"

)

// Covid19DataServiceInterface ...
// Covid19DataService interface
type Covid19DataServiceInterface interface {
	GetSummaryItems() (*[]db.Covid19SummaryItem, error)
}

type covid19DataService struct {
	covid19SummaryItemDao db.Covid19SummaryItemDao
}

// NewCovid19DataService ...
// Create function for an Covid19DataService
func NewCovid19DataService(covid19SummaryItemDao db.Covid19SummaryItemDao) Covid19DataServiceInterface {
	return &covid19DataService{covid19SummaryItemDao: covid19SummaryItemDao}
}

// GetSummaryItems ...
// Get all Covid-19 summary items
func (s *covid19DataService) GetSummaryItems() (*[]db.Covid19SummaryItem, error) {
	return s.covid19SummaryItemDao.GetItems()
}