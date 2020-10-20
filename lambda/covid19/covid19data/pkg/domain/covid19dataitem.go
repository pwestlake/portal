package domain

import (
)

// Covid19DataItem ...
type Covid19DataItem struct {
	DateRep      string `json:"daterep"`
	CountryExp   string    `json:"countryexp"`
	NewConfCases int       `json:"newConfcases"`
	TotalCases   int       `json:"totalcases"`
	NewDeaths    int       `json:"newdeaths"`
	TotalDeaths  int       `json:"totaldeaths"`
	GeoID        string    `json:"geoid"`
	Gaul1Nuts1   string    `json:"gaulnuts1"`
	Eu           string    `json:"eu"`
	PopData2019  int       `json:"popdata2019"`
}
