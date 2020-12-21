package service

import (
	"github.com/pwestlake/portal/lambda/covid19/region/pkg/domain"
	"github.com/pwestlake/portal/lambda/covid19/region/pkg/db"

)

// RegionServiceInterface ...
// RegionService interface
type RegionServiceInterface interface {
	GetRegionNames() (*[]string, error)
	GetRegions() (*[]domain.Region, error)
}

// RegionService ...
type regionService struct {
	regionDao db.RegionDao
	covid19RegionJHDao db.Covid19RegionJHDao
}

// NewRegionService ...
// Create function for a NewRegionService
func NewRegionService(regionDao db.RegionDao, covid19RegionJHDao db.Covid19RegionJHDao) RegionServiceInterface {
	return &regionService{regionDao: regionDao, covid19RegionJHDao: covid19RegionJHDao}
}

// GetRegionNames ...
// Return all region names
func (s *regionService) GetRegionNames() (*[]string, error) {
	return s.regionDao.GetRegionNames()
}

// GetRegions ...
// Return all regions
func (s *regionService) GetRegions() (*[]domain.Region, error) {
	return s.covid19RegionJHDao.GetRegions()
}