//+build wireinject

package service

import (
	"github.com/pwestlake/portal/lambda/covid19/preferences/pkg/db"
	"github.com/google/wire"
)

type dummyService struct {
	userPreferenceDao db.UserPreferenceDao
}

func InitializeUserService() UserServiceInterface {
	wire.Build(NewUserService, db.NewUserPreferenceDao)
	return &dummyService{}
}

// GetUserPreference ...
// Dummy method
func (s *dummyService) GetUserPreference(userID string, key string, userPreference *db.UserPreference) error {
	return nil
}

// PutUserPreference ...
// Dummy method
func (s *dummyService) PutUserPreference(userPreference *db.UserPreference) error {
	return s.userPreferenceDao.PutUserPreference(userPreference)
}