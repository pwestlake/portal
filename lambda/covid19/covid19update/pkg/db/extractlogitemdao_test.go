package db

import (
	"log"
	"time"
	"os"
	"github.com/pwestlake/portal/lambda/covid19/covid19update/pkg/domain"
	"testing"
)

func SaveItem(t *testing.T) {
	os.Setenv("DYNAMODB_ENDPOINT", "")
	os.Setenv("REGION", "")

	dao := NewExtractLogItemDao()
	item := domain.ExtractLogItem {
		ExtractDate: "20060401",
		ItemCountInserted: 24,
	}
	err := dao.SaveItem(item)
	if err != nil {
		t.Errorf("SaveItem returned with error: %v", err)
	}
}

func GetItemsForExtractDate(t *testing.T) {
	os.Setenv("DYNAMODB_ENDPOINT", "")
	os.Setenv("REGION", "")

	dao := NewExtractLogItemDao()

	items, err := dao.GetItemsForExtractDate(time.Now())
	if err != nil {
		t.Errorf("GetItemsForExtractDate resturned with error: %v", err)
	}
	log.Printf("%d", len(*items))
}