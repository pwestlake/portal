package domain

// ExtractLogItem ...
type ExtractLogItem struct {
	ID                string `json:"id"`
	DateInserted      string `json:"dateInserted"`
	ItemCountInserted int    `json:"itemCountInserted"`
	ExtractDate       string `json:"extractDate"`
}
