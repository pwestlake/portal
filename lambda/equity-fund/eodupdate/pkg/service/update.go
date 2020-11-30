package service

import (
	"time"
	"log"
	equitycatalog "github.com/pwestlake/portal/lambda/equity-fund/equitycatalog/pkg/service"
	eod "github.com/pwestlake/portal/lambda/equity-fund/eod/pkg/service"
	eoddomain "github.com/pwestlake/portal/lambda/equity-fund/eod/pkg/domain"
	catalogdomain "github.com/pwestlake/portal/lambda/equity-fund/equitycatalog/pkg/domain"
	news "github.com/pwestlake/portal/lambda/equity-fund/news/pkg/service"
)

// EODUpdateService ...
type EODUpdateService struct {
	equityCatalogService equitycatalog.EquityCatalogService
	endOfDayService eod.EndOfDayService
	yahooService YahooService
	newsService news.NewsService
	lseService LSEService
}

// NewEODUpdateService ...
// Function that creates an EODUpdateService
func NewEODUpdateService(
	equityCatalogService equitycatalog.EquityCatalogService,
	endOfDayService eod.EndOfDayService,
	yahooService YahooService,
	newsService news.NewsService,
	lseService LSEService,
	) EODUpdateService {
	return EODUpdateService {
		equityCatalogService: equityCatalogService,
		endOfDayService: endOfDayService,
		yahooService: yahooService,
		newsService: newsService,
		lseService: lseService,
	}
}

// UpdateWithLatest ...
// Update with latest EOD and News values
func (s *EODUpdateService) UpdateWithLatest() error {
	err := s.updateWithLatestFromYahoo()
	if err != nil {
		log.Printf("Failed to source data from yahoo")
	}

	err = s.fetchLatestNews()
	if err != nil {
		log.Printf("Failed to source news")
	}

	return nil
}

func (s *EODUpdateService) fetchLatestNews() error {
	catalogItems, err := s.equityCatalogService.GetAllEquityCatalogItems()
	if err != nil {
		log.Printf("Failed to get catalog items: %s", err)
		return err
	}

	for _, v := range *catalogItems {
		var date time.Time
		item, err := s.newsService.GetLatestItem(v.ID)
		if err != nil {
			log.Printf("Failed to fetch latest news item for %s. %s", v.Symbol, err.Error())
			
			// Set a date to fetch all available news items
			date = time.Now()
			date = date.AddDate(-1, 0, 0)
		} else {
			date = item.DateTime
		}

		newsItems, err := s.lseService.GetNewsFromDate(&v, date)
		if err != nil  {
			log.Printf("Failed to fetch news for %s. %s", v.Symbol, err.Error())
			break
		}

		plural := ""
		if len(*newsItems) > 1 ||  len(*newsItems) == 0{
			plural = "s"
		}

		log.Printf("Found %d news item%s for %s", len(*newsItems), plural, v.Symbol)

		// Source sentiment here

		err = s.newsService.PutNewsItems(newsItems)
		if (err != nil) {
			log.Printf("Failed to persist news items for %s. %s", v.Symbol, err.Error())
			return err
		}

	}

	return nil
}

func (s *EODUpdateService) updateWithLatestFromYahoo() error{
	catalogItems, err := s.equityCatalogService.GetEquityCatalogItemsByDatasource("yahoo")
	if err != nil {
		log.Printf("Failed to get catalog items: %s", err)
		return err
	}

	// Find the date of the last update and derive the 'from' date
	// Assume that all items were updated at the same time
	eodItem, err := s.endOfDayService.GetLatestItem((*catalogItems)[0].ID)
	if err != nil {
		log.Printf("Failed to get latest item for %s, %s. Aborting", (*catalogItems)[0].ID, err)
		return err
	}

	fromDate := eodItem.Date.AddDate(0, 0, 1)
	if fromDate.After(today()) || fromDate.Equal(today()) {
		log.Printf("All yahoo data is up to date.")
		return nil
	}

	current, err := s.endOfDayService.GetAllEndOfDayItemsByDate(eodItem.Date)
	if err != nil {
		log.Printf("Failed to retrieve current data: %s", err)
		return err
	}

	for _, v := range *catalogItems {
		source, err := s.yahooService.GetDataFromDate(v.Symbol, fromDate)
		if err != nil {
			log.Printf("Failed to source %s. Aborting: %s", v.Symbol, err.Error())
			return err
		}
		
		target := buildTarget(source, catalogItems, current)

		err = s.endOfDayService.PutEndOfDayItems(target)
		if err != nil {
			log.Printf("Failed to persist end of day data")
		}

		plural := ""
		if len(*target) > 1 ||  len(*target) == 0{
			plural = "s"
		}
		log.Printf("Found and persisted %d new eod item%s for %s", len(*target), plural, v.Symbol)
	}

	return nil
}

func today() time.Time {
	utc, _ := time.LoadLocation("UTC") 
	today := time.Now()
	today = time.Date(today.Year(), today.Month(), today.Day(), 0, 0, 0, 0, utc)
	return today
}

func buildTarget(source *[]eoddomain.EndOfDaySourceItem, 
	catalog *[]catalogdomain.EquityCatalogItem,
	current *[]eoddomain.EndOfDayItem) *[]eoddomain.EndOfDayItem {
	result := make([]eoddomain.EndOfDayItem, len(*source))

	idMap := make(map[string]string, len(*catalog))
	for _, v := range *catalog {
		idMap[v.Symbol] = v.ID
	}

	for i, v := range *source {
		previous := previousEndOfDayItem(v.Date.Time, v.Symbol, current)
		item := eoddomain.EndOfDayItem{
			ID: idMap[v.Symbol],
			Symbol: v.Symbol,
			Open: v.Open,
			High: v.High,
			Low: v.Low,
			Close: v.Close,
			CloseChg: v.Close - previous.Close,
			Volume: v.Volume,
			AdjHigh: v.AdjHigh,
			AdjLow: v.AdjLow,
			AdjClose: v.AdjClose,
			AdjOpen: v.AdjOpen,
			AdjVolume: v.AdjVolume,
			Exchange: v.Exchange,
			Date: v.Date.Time,
		}

		result[i] = item
	}

	return &result
}

func previousEndOfDayItem(date time.Time, symbol string, current *[]eoddomain.EndOfDayItem) *eoddomain.EndOfDayItem {
	eodItem := eoddomain.EndOfDayItem{
		Close: 0.0,
	}

	previousDate := (*current)[0].Date

	if current != nil {
		for _, v := range *current {
			if v.Date.Equal(previousDate) && v.Symbol == symbol {
				eodItem = v
				break
			}
		}
	}

	return &eodItem
}