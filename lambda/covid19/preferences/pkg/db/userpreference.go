package db

import (
	"time"
)

// UserPreference ...
// Domain struct for a UserPreference
type UserPreference struct {
	UserID       string    `json:"userid"`
	Key		     string    `json:"key"`
	Value        string    `json:"value"`
	DateCreated  time.Time `json:"datecreated"`
	LastModified time.Time `json:"lastmodified"`
}
