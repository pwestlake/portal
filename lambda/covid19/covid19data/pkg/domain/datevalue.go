package domain

import (
	"time"
)

// DateValue ...
type DateValue struct {
	Date   time.Time `json:"date"`
	Value interface{} `json:"value"`
}
