package service

import (
	"github.com/pwestlake/portal/lambda/equity-fund/news/pkg/domain"
	"github.com/pwestlake/portal/lambda/equity-fund/news/pkg/db"

)

// NewsService ...
type NewsService struct {
	newsItemDao db.NewsItemDAO
}

// NewNewsService ...
// Create function for an NewsService
func NewNewsService(newsItemDao db.NewsItemDAO) NewsService {
	return NewsService{newsItemDao: newsItemDao}
}

// PutNewsItems ...
// Service method to persist an array of NewsItems in the database
func (s *NewsService) PutNewsItems(items *[]domain.NewsItem) error {
	return s.newsItemDao.PutNewsItems(items)
}

// GetLatestItem ...
// Service method to retrieve the latest eod item for a given id
func (s *NewsService) GetLatestItem(id string) (*domain.NewsItem, error) {
	return s.newsItemDao.GetLatestItem(id)
}

// GetNewsItems ...
func (s *NewsService) GetNewsItems(count int, offset *domain.NewsItem, id *string) (*[]domain.NewsItem, error) {
	return s.newsItemDao.GetNewsItems(count, offset, id)
}

// GetItem ...
func (s *NewsService) GetItem(id string) (*domain.NewsItem, error) {
	return s.newsItemDao.GetItem(id)
}
