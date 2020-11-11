//+build wireinject

package service

import (
	"github.com/pwestlake/portal/lambda/equity-fund/eod/pkg/db"
	"github.com/google/wire"
)

func InitializeEndOfDayService() EndOfDayService {
	wire.Build(NewEndOfDayService, db.NewEndOfDayItemDAO)
	return EndOfDayService{}
}
