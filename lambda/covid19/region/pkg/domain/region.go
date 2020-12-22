package domain

// Region ...
// Region domain object
type Region struct {
	Key        string  `json:"key"`
	Country    string  `json:"country"`
	State      string  `json:"state"`
	Lat        float64 `json:"lat"`
	Long       float64 `json:"long"`
	Name       string  `json:"name"`
	Population int     `json:"population"`
}
