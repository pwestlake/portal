package domain

// Covid19JsonItem ...
type Covid19JsonItem struct {
	Day                     string `json:"day"`
	Month                   string `json:"month"`
	Year                    string `json:"year"`
	Cases                   int    `json:"cases"`
	Deaths                  int    `json:"deaths"`
	CountriesAndTerritories string `json:"countriesAndTerritories"`
	GeoID                   string `json:"geoid"`
	CountryterritoryCode    string `json:"countryterritoryCode"`
	PopData2019             int    `json:"popData2019"`
	ContinentExp            string `json:"continentExp"`
}
