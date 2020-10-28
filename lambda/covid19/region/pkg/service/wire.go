//+build wireinject

package service

import (
	"github.com/pwestlake/portal/lambda/covid19/region/pkg/db"
	"github.com/google/wire"
)

type dummyService struct {
	regionDao db.RegionDao
}

func InitializeRegionService() RegionServiceInterface {
	wire.Build(NewRegionService, db.NewRegionDao)
	return &dummyService{}
}

// GetRegionNames ...
// Dummy method
func (s *dummyService) GetRegionNames() (*[]string, error) {
	return nil, nil
}
