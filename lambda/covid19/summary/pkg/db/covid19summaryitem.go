package db

// Covid19SummaryItem ...
// Covid-19 Summary data item
type Covid19SummaryItem struct {
	CountryExp  string `json:"countryexp"`
	TotalCases  int    `json:"totalcases"`
	TotalDeaths int    `json:"totaldeaths"`
	PopData2019 int    `json:"popdata2019"`
}
