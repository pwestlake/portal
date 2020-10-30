package domain

// Covid19DataItem ...
type Covid19DataItem struct {
	DateRep      string `json:"dateRep"`
	CountryExp   string `json:"countryExp"`
	NewConfCases int    `json:"newConfCases"`
	TotalCases   int    `json:"totalCases"`
	NewDeaths    int    `json:"newDeaths"`
	TotalDeaths  int    `json:"totalDeaths"`
	GeoID        string `json:"geoId"`
	Gaul1Nuts1   string `json:"gaul1Nuts1"`
	Eu           string `json:"eu"`
	PopData2019  int    `json:"popData2019"`
}
