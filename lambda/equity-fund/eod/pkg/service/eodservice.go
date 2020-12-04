package service

import (
	"time"

	"github.com/pwestlake/portal/lambda/equity-fund/eod/pkg/db"
	"github.com/pwestlake/portal/lambda/equity-fund/eod/pkg/domain"
)

// EndOfDayService ...
type EndOfDayService struct {
	endOfDayItemDaoDao db.EndOfDayItemDAO
}

// NewEndOfDayService ...
// Create function for an EndOfDayService
func NewEndOfDayService(endOfDayItemDaoDao db.EndOfDayItemDAO) EndOfDayService {
	return EndOfDayService{endOfDayItemDaoDao: endOfDayItemDaoDao}
}

// PutEndOfDayItems ...
// Service method to persist an array of EndOfDayItems in the database
func (s *EndOfDayService) PutEndOfDayItems(items *[]domain.EndOfDayItem) error {
	return s.endOfDayItemDaoDao.PutEndOfDayItems(items)
}

// PutEndOfDayItem ...
// Service method to persist an EndOfDayItem in the database
func (s *EndOfDayService) PutEndOfDayItem(item *domain.EndOfDayItem) error {
	return s.endOfDayItemDaoDao.PutEndOfDayItem(item)
}

// GetEndOfDayItems ...
// Service method to retrieve an array of EndOfDayItems according to the given id and from date
func (s *EndOfDayService) GetEndOfDayItems(id string, from time.Time) (*[]domain.EndOfDayItem, error) {
	return s.endOfDayItemDaoDao.GetEndOfDayItems(id, from)
}

// GetAllEndOfDayItemsByDate ...
// Service method to retrieve an array of EndOfDayItems according to the given date
func (s *EndOfDayService) GetAllEndOfDayItemsByDate(date time.Time) (*[]domain.EndOfDayItem, error) {
	return s.endOfDayItemDaoDao.GetAllEndOfDayItemsByDate(date)
}

// GetLatestItem ...
// Service method to retrieve the latest eod item for a given id
func (s *EndOfDayService) GetLatestItem(id string) (*domain.EndOfDayItem, error) {
	return s.endOfDayItemDaoDao.GetLatestItem(id)
}

// GetItem ...
// Service method to retrieve the eod item for a given id and date
func (s *EndOfDayService) GetItem(id string, date time.Time) (*domain.EndOfDayItem, error) {
	return s.endOfDayItemDaoDao.GetItem(id, date)
}
