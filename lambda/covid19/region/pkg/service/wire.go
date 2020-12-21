//+build wireinject

package service

import (
	"github.com/pwestlake/portal/lambda/covid19/region/pkg/domain"
	"github.com/pwestlake/portal/lambda/covid19/region/pkg/db"
	"github.com/google/wire"
)

type dummyService struct {
	regionDao db.RegionDao
	covid19RegionJHDao db.Covid19RegionJHDao
}

func InitializeRegionService() RegionServiceInterface {
	wire.Build(NewRegionService, db.NewRegionDao, db.NewCovid19RegionJHDao)
	return &dummyService{}
}

// GetRegionNames ...
// Dummy method
func (s *dummyService) GetRegionNames() (*[]string, error) {
	return nil, nil
}

// GetRegions ...
// Dummy method
func (s *dummyService) GetRegions() (*[]domain.Region, error) {
	return nil, nil
}
