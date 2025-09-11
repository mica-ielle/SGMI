package com.gmao.CAMGAZ_TECH.controller.gestion_stock;

import com.gmao.CAMGAZ_TECH.DTO.RequetCreateStock;
import com.gmao.CAMGAZ_TECH.DTO.SortieStock;
import com.gmao.CAMGAZ_TECH.model.gestion_stock.Stock;
import com.gmao.CAMGAZ_TECH.service.gestion_stock.GestionStockImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/stock")
@CrossOrigin(origins = "*", maxAge = 3600)
public class StockController {

    final static Logger logger = LoggerFactory.getLogger(StockController.class);

    @Autowired
    public GestionStockImpl service;


    @PostMapping("/create")
    public Stock create(@RequestBody RequetCreateStock requetCreateStock)
    {
        return service.createStock(requetCreateStock.getStock(),requetCreateStock.getPieceID());
    }

    @GetMapping("/get")
    public List<Stock> get()
    {
        List<Stock> stockList = service.findAllStocks();
        return stockList;
    }

    @PutMapping("/entree/{stockId}")
    public Stock entree(@PathVariable int stockId, @RequestBody int quantiteP)
    {
        return service.entreeStock(stockId,quantiteP);
    }
    @PutMapping("/sortie/{stockId}")
    public SortieStock sortie(@PathVariable int stockId, @RequestBody int quantiteM)
    {
        return service.sortieStock(stockId,quantiteM);
    }

    @PutMapping("/update/{stockId}")
    public Stock update(@PathVariable int stockId, @RequestBody Stock stock)
    {
        return service.updateStock(stockId, stock);
    }

    @DeleteMapping("/delete/{stockId}")
    public boolean delete(@PathVariable int stockId)
    {
        return service.deleteStock(stockId);
    }


}
