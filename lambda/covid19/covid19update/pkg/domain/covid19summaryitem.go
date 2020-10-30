package domain

// Covid19SummaryItem ...
type Covid19SummaryItem struct {
	CountryExp  string `json:"countryExp"`
	TotalCases  int    `json:"totalCases"`
	TotalDeaths int    `json:"totalDeaths"`
	PopData2019 int    `json:"popData2019"`
}
