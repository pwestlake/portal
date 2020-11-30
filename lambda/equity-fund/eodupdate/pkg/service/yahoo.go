package service

import (
	"os"
	"strconv"
	"io"
	"strings"
	"net/http"
	"fmt"
	"time"
	"log"
	eoddomain "github.com/pwestlake/portal/lambda/equity-fund/eod/pkg/domain"
)

// YahooService ...
// Service providing access to the Yahoo api
type YahooService struct {
	endpoint string
}

// NewYahooService ...
// Create function for a YahooService
func NewYahooService() YahooService {
	return YahooService{
		endpoint: os.Getenv("YAHOO_ENDPOINT")}
}

// GetDataFromDate ...
// Get data for the given symbols and from the given date
func (s *YahooService) GetDataFromDate(symbol string, date time.Time) (*[]eoddomain.EndOfDaySourceItem, error) {
	result := []eoddomain.EndOfDaySourceItem{}
	var err error

	fromSeconds := date.Unix()
	utc, _ := time.LoadLocation("UTC") 
	today := time.Now()
	today = time.Date(today.Year(), today.Month(), today.Day(), 0, 0, 0, 0, utc)
	toSeconds := today.Unix()
	url := fmt.Sprintf("%s%s?period1=%d&period2=%d&interval=1d&events=history", s.endpoint, symbol, fromSeconds, toSeconds)

	resp, err := http.Get(url)
	if err != nil {
		return nil, err;
	}
	
	buffer := strings.Builder{}
	_, err = io.Copy(&buffer, resp.Body)
	if err != nil {
		log.Printf("Failed to read url. %s", err.Error())
		return nil, err
	}
	
	lines := strings.Split(buffer.String(), "\n")
	for i, v := range lines {
		if i == 0 {
			continue
		}
		row := strings.Split(v, ",")
		if len(row) != 7 {
			return nil, fmt.Errorf("Expected: Date,Open,High,Low,Close,Adj Close,Volume, found: %s", v)
		}

		dt, _ := time.Parse("2006-01-02", row[0])
		open, err := strconv.ParseFloat(row[1], 32)
		if err != nil {
			log.Printf("Unable to parse %s of %s, ignoring", row[1], row)
			continue
		}

		high, err := strconv.ParseFloat(row[2], 32)
		if err != nil {
			log.Printf("Unable to parse %s of %s, ignoring", row[2], row)
			continue
		}

		low, err := strconv.ParseFloat(row[3], 32)
		if err != nil {
			log.Printf("Unable to parse %s of %s, ignoring", row[3], row)
			continue
		}

		close, err := strconv.ParseFloat(row[4], 32)
		if err != nil {
			log.Printf("Unable to parse %s of %s, ignoring", row[4], row)
			continue
		}

		adjClose, err := strconv.ParseFloat(row[5], 32)
		if err != nil {
			log.Printf("Unable to parse %s of %s, ignoring", row[5], row)
			continue
		}

		volume, err := strconv.ParseFloat(row[6], 32)
		if err != nil {
			log.Printf("Unable to parse %s of %s, ignoring", row[6], row)
			continue
		}
		
		item := eoddomain.EndOfDaySourceItem{
			Date: eoddomain.SourceTime{Time: dt},
			Open: float32(open),
			High: float32(high),
			Low: float32(low),
			Close: float32(close),
			AdjClose: float32(adjClose),
			Volume: float32(volume),
			Symbol: symbol,
			Exchange: "L",
		}

		result = append(result, item)
	}
	return &result, err
}

