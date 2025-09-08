package com.gmao.CAMGAZ_TECH.model.gestion_stock;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class Stock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id_stock;

    private int quantite;
    private int seuil_critique;

    @ManyToOne
    @JoinColumn(name = "id_piece")
    private Piece piece;

    public int getId_stock() {
        return id_stock;
    }

    public void setId_stock(int id_stock) {
        this.id_stock = id_stock;
    }

    public int getQuantite() {
        return quantite;
    }

    public void setQuantite(int quantite) {
        this.quantite = quantite;
    }

    public int getSeuil_critique() {
        return seuil_critique;
    }

    public void setSeuil_critique(int seuil_critique) {
        this.seuil_critique = seuil_critique;
    }

    public Piece getPiece() {
        return piece;
    }

    public void setPiece(Piece piece) {
        this.piece = piece;
    }
}
