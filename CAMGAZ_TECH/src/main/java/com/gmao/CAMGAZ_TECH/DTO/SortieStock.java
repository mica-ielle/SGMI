package com.gmao.CAMGAZ_TECH.DTO;

import com.gmao.CAMGAZ_TECH.model.gestion_stock.Stock;

public class SortieStock {

    private Stock stock;

    private boolean alerte;

    public SortieStock(Stock stock, boolean alerte) {
        this.stock = stock;
        this.alerte = alerte;
    }

    public Stock getStock() {
        return stock;
    }

    public void setStock(Stock stock) {
        this.stock = stock;
    }

    public boolean isAlerte() {
        return alerte;
    }

    public void setAlerte(boolean alerte) {
        this.alerte = alerte;
    }
}
