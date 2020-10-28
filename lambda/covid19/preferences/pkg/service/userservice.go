package service

import (
	"github.com/pwestlake/portal/lambda/covid19/preferences/pkg/db"

)

// UserServiceInterface ...
// UserService interface
type UserServiceInterface interface {
	GetUserPreference(userID string, key string, userPreference *db.UserPreference) error
	PutUserPreference(userPreference *db.UserPreference) error
}

// UserService ...
type userService struct {
	userPreferenceDao db.UserPreferenceDao
}

// NewUserService ...
// Create function for a NewUserService
func NewUserService(userPreferenceDao db.UserPreferenceDao) UserServiceInterface {
	return &userService{userPreferenceDao: userPreferenceDao}
}

// GetUserPreference ...
// Return the user preference that is described by the key
func (s *userService) GetUserPreference(userID string, key string, userPreference *db.UserPreference) error {
	return s.userPreferenceDao.GetUserPreference(userID, key, userPreference)
}

// PutUserPreference ...
// Service method to persist a new user preference in the database
func (s *userService) PutUserPreference(userPreference *db.UserPreference) error {
	return s.userPreferenceDao.PutUserPreference(userPreference)
}