//+build wireinject

package service

import (
	"github.com/pwestlake/portal/lambda/equity-fund/equitycatalog/pkg/db"
	"github.com/google/wire"
)

func InitializeEquityCatalogService() EquityCatalogService {
	wire.Build(NewEquityCatalogService, db.NewEquityCatalogItemDAO)
	return EquityCatalogService{}
}
