package service

import (
	"sort"
	"fmt"
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
	PersistData(data *[]domain.Covid19DataItem) (int, error)
	PersistSummaryData(data *[]domain.Covid19DataItem) (int, error)
}

// Covid19DataService ...
type covid19DataService struct {
	covid19DataDao db.Covid19DataDao
	extractLogItemDao db.ExtractLogItemDao
	covid19SummaryItemDao db.Covid19SummaryItemDao
}

// NewCovid19DataService ...
// Create function for a Covid19DataService
func NewCovid19DataService(covid19DataDao db.Covid19DataDao, 
	extractLogItemDao db.ExtractLogItemDao,
	covid19SummaryItemDao db.Covid19SummaryItemDao) Covid19DataServiceInterface {
	return &covid19DataService{covid19DataDao: covid19DataDao, 
		extractLogItemDao: extractLogItemDao,
		covid19SummaryItemDao: covid19SummaryItemDao}
}

func (s *covid19DataService) AddToExtractLogItems(item domain.ExtractLogItem) error {
	return s.extractLogItemDao.SaveItem(item)
}

func (s *covid19DataService) GetExtractLogItemsForExtractDate(date time.Time) (*[]domain.ExtractLogItem, error) {
	return s.extractLogItemDao.GetItemsForExtractDate(date)
}

func (s *covid19DataService) PersistData(data *[]domain.Covid19DataItem) (int, error) {
	return s.covid19DataDao.PersistData(data)
}

func (s *covid19DataService) PersistSummaryData(data *[]domain.Covid19DataItem) (int, error) {
	summaryData := make([]domain.Covid19SummaryItem, len(*data))

	for i, v := range *data {
		summaryData[i] = domain.Covid19SummaryItem{
			CountryExp: v.CountryExp,
			TotalCases: v.TotalCases,
			TotalDeaths: v.TotalDeaths,
			PopData2019: v.PopData2019,
		}
	}

	return s.covid19SummaryItemDao.SaveItems(&summaryData)
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
	for _, v := range sourceItems.Records {
		item := domain.Covid19DataItem {
			DateRep: fmt.Sprintf("%s%s%s", v.Year, v.Month, v.Day),
			CountryExp: v.CountriesAndTerritories,
			NewConfCases: v.Cases,
			TotalCases: 0,
			NewDeaths: v.Deaths,
			TotalDeaths: 0,
			GeoID: v.GeoID, 
			Gaul1Nuts1: "",
			Eu: "",  
			PopData2019: v.PopData2019,
		}

		result = append(result, item)
	}

	countryMap := buildCountryMapOfCovidData(&result)
	updateList := make([]domain.Covid19DataItem, 0, len(*countryMap))
	for _, v := range *countryMap {
		// Sort by date reported descending
		sort.Slice(v, func(i int, j int) bool {
			return v[i].DateRep > v[j].DateRep
		})

		aggregateCounts(&v)

		// Choose only the most recent data item if it is within
		// 7 days of today
		daysOffset, err := daysFromToday(v[0].DateRep)
		if err != nil {
			return nil, err
		}

		if len(v) > 0 &&  daysOffset < 7 {
			updateList = append(updateList, v[0])
		}
	}

	return &updateList, nil
}

// Aggregate the count of cases and deaths. Assumes that the 
// list is sorted in descending date order
func aggregateCounts(data *[]domain.Covid19DataItem) {
	previousDeathCount := 0
	previousCasesCount := 0

	for i := len(*data) - 1; i >= 0; i-- {
		(*data)[i].TotalDeaths = (*data)[i].NewDeaths + previousDeathCount
		previousDeathCount = (*data)[i].TotalDeaths
		(*data)[i].TotalCases = (*data)[i].NewConfCases + previousCasesCount
		previousCasesCount = (*data)[i].TotalCases
	}
}

// Return the number of days that the data parameter is away from today
// Where the date is given in the form yyyyMMdd
func daysFromToday(date string) (int, error) {
	givenDate, err := time.Parse("20060102", date)
	if err != nil {
		return 0, err
	}

	duration := time.Now().Sub(givenDate)

 	return int(duration.Hours() / 24), nil
}

func buildCountryMapOfCovidData(data *[]domain.Covid19DataItem) *map[string][]domain.Covid19DataItem {
	mapOfCovidData := make(map[string][]domain.Covid19DataItem)
	for _, v := range *data {
		countryList := mapOfCovidData[v.CountryExp]
		if countryList == nil {
			countryList = []domain.Covid19DataItem{}
			mapOfCovidData[v.CountryExp] = countryList
		}

		countryList = append(countryList, v)
		mapOfCovidData[v.CountryExp] = countryList
	}

	return &mapOfCovidData
}