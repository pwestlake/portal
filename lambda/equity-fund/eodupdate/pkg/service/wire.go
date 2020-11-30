//+build wireinject

package service

import (
	"github.com/google/wire"
	equitycatalog "github.com/pwestlake/portal/lambda/equity-fund/equitycatalog/pkg/service"
	equitycatalogdao "github.com/pwestlake/portal/lambda/equity-fund/equitycatalog/pkg/db"
	eod "github.com/pwestlake/portal/lambda/equity-fund/eod/pkg/service"
	eoddao "github.com/pwestlake/portal/lambda/equity-fund/eod/pkg/db"
	news "github.com/pwestlake/portal/lambda/equity-fund/news/pkg/service"
	newsdao "github.com/pwestlake/portal/lambda/equity-fund/news/pkg/db"
)

func InitializeEODUpdateService() EODUpdateService {
	wire.Build(
		NewEODUpdateService, 
		equitycatalog.NewEquityCatalogService, 
		equitycatalogdao.NewEquityCatalogItemDAO,
		eod.NewEndOfDayService,
		eoddao.NewEndOfDayItemDAO,
		NewYahooService,
		news.NewNewsService,
		newsdao.NewNewsItemDAO,
		NewLSEService,
	)
	return EODUpdateService{}
}

func InitializeYahooService() YahooService {
	wire.Build(NewYahooService)
	return YahooService{}
}

func InitializeLSEService() LSEService {
	wire.Build(NewLSEService)
	return LSEService{}
}

func InitializeNLPService() NLPService {
	wire.Build(NewNLPService)
	return NLPService{}
}