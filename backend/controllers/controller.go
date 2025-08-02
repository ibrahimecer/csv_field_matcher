package controllers

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

func CsvToJson(c *gin.Context) {
	var payload []map[string]interface{}

	if err := c.BindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Geçersiz JSON formatı",
			"details": err.Error(),
		})
		return
	}

	if len(payload) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Boş veri dizisi gönderildi",
		})
		return
	}

	for i, record := range payload {
		fmt.Printf("Kayıt %d: %+v\n", i+1, record)
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "CSV verisi başarıyla alındı ve işlendi",
	})
}
