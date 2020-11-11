package service

import (
	"github.com/pwestlake/portal/lambda/equity-fund/equitycatalog/pkg/domain"
	"github.com/pwestlake/portal/lambda/equity-fund/equitycatalog/pkg/db"
	

)

// EquityCatalogService ...
type EquityCatalogService struct {
	equityCatalogItemDao db.EquityCatalogItemDAO
}

// NewEquityCatalogService ...
// Create function for a NewUserService
func NewEquityCatalogService(equityCatalogItemDao db.EquityCatalogItemDAO) EquityCatalogService {
	return EquityCatalogService{equityCatalogItemDao: equityCatalogItemDao}
}

// GetEquityCatalogItem ...
// Service method to retrieve an item with the given id from the database
func (s *EquityCatalogService) GetEquityCatalogItem(id string, equityCatalogItem *domain.EquityCatalogItem) error {
	return s.equityCatalogItemDao.GetEquityCatalogItem(id, equityCatalogItem)
}

// GetEquityCatalogItemsBySymbol ...
// Service method to retrieve all items with the given symbol from the database
func (s *EquityCatalogService) GetEquityCatalogItemsBySymbol(symbol string) (*[]domain.EquityCatalogItem, error) {
	return s.equityCatalogItemDao.GetEquityCatalogItemsBySymbol(symbol)
}

// GetAllEquityCatalogItems ...
// Service method to return an array of user ID's
func (s *EquityCatalogService) GetAllEquityCatalogItems() (*[]domain.EquityCatalogItem, error) {
	return s.equityCatalogItemDao.GetEquityCatalogItems()
}

// GetEquityCatalogItemsByDatasource ...
// Service method to return an array of user ID's
func (s *EquityCatalogService) GetEquityCatalogItemsByDatasource(datasource string) (*[]domain.EquityCatalogItem, error) {
	return s.equityCatalogItemDao.GetEquityCatalogItemsByDatasource(datasource)
}

// PutEquityCatalogItem ...
// Service method to persist a new user in the database
func (s *EquityCatalogService) PutEquityCatalogItem(equityCatalogItem *domain.EquityCatalogItem) error {
	return s.equityCatalogItemDao.PutEquityCatalogItem(equityCatalogItem)
}