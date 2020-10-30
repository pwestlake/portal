package db

import (
	"log"
	"time"
	"os"
	"github.com/pwestlake/portal/lambda/covid19/covid19update/pkg/domain"
	"testing"
)

func TestSaveItem(t *testing.T) {
	os.Setenv("DYNAMODB_ENDPOINT", "https://dynamodb.eu-west-2.amazonaws.com")
	os.Setenv("REGION", "eu-west-2")

	dao := NewExtractLogItemDao()
	item := domain.ExtractLogItem {
		ExtractDate: "20201029",
		ItemCountInserted: 212,
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