//+build wireinject

package service

import (
	"github.com/pwestlake/portal/lambda/equity-fund/news/pkg/db"
	"github.com/google/wire"
)

func InitializeNewsService() NewsService {
	wire.Build(NewNewsService, db.NewNewsItemDAO)
	return NewsService{}
}
