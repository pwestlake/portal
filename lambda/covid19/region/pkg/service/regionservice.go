package service

import (
	"github.com/pwestlake/portal/lambda/covid19/region/pkg/db"

)

// RegionServiceInterface ...
// RegionService interface
type RegionServiceInterface interface {
	GetRegionNames() (*[]string, error)
}

// RegionService ...
type regionService struct {
	regionDao db.RegionDao
}

// NewRegionService ...
// Create function for a NewRegionService
func NewRegionService(regionDao db.RegionDao) RegionServiceInterface {
	return &regionService{regionDao: regionDao}
}

// GetRegionNames ...
// Return all region names
func (s *regionService) GetRegionNames() (*[]string, error) {
	return s.regionDao.GetRegionNames()
}