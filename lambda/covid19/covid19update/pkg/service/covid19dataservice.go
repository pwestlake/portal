package service

import (
	"strings"
	"io"
	"log"
	"encoding/json"
	"net/http"
	"time"
	"github.com/pwestlake/portal/lambda/covid19/covid19update/pkg/db"
	"github.com/pwestlake/portal/lambda/covid19/covid19update/pkg/domain"

)

// Covid19DataServiceInterface ...
// Covid19DataService interface
type Covid19DataServiceInterface interface {
	AddToExtractLogItems(item domain.ExtractLogItem) error
	GetExtractLogItemsForExtractDate(date time.Time) (*[]domain.ExtractLogItem, error)
	SourceDataFromJSON() (*[]domain.Covid19DataItem, error)
}

// Covid19DataService ...
type covid19DataService struct {
	covid19DataDao db.Covid19DataDao
	extractLogItemDao db.ExtractLogItemDao
}

// NewCovid19DataService ...
// Create function for a Covid19DataService
func NewCovid19DataService(covid19DataDao db.Covid19DataDao, extractLogItemDao db.ExtractLogItemDao) Covid19DataServiceInterface {
	return &covid19DataService{covid19DataDao: covid19DataDao, extractLogItemDao: extractLogItemDao}
}

func (s *covid19DataService) AddToExtractLogItems(item domain.ExtractLogItem) error {
	return s.extractLogItemDao.SaveItem(item)
}

func (s *covid19DataService) GetExtractLogItemsForExtractDate(date time.Time) (*[]domain.ExtractLogItem, error) {
	return s.extractLogItemDao.GetItemsForExtractDate(date)
}

func (s *covid19DataService) SourceDataFromJSON() (*[]domain.Covid19DataItem, error) {
	const url = "https://opendata.ecdc.europa.eu/covid19/casedistribution/json/"

	resp, err := http.Get(url)
	if err != nil {
		return nil, err;
	}

	buffer := strings.Builder{}
	_, err = io.Copy(&buffer, resp.Body)
	if err != nil {
		log.Printf("Failed to read url. %s", err.Error())
		return nil, err
	}

	sourceItems := domain.Covid19JsonItemList{}

	err = json.Unmarshal([]byte(buffer.String()), &sourceItems)
	if err != nil {
		return nil, err
	}

	result := []domain.Covid19DataItem{}
	return &result, nil
}