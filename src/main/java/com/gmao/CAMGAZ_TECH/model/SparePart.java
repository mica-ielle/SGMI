package com.gmao.CAMGAZ_TECH.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.ToString;

/**
 * Modèle pour spare_parts (table spare_parts).
 * Constructeur attendu par SparePartDAO:
 *   new SparePart(id, partCode, partName, recommendedQtyPerPump, notes)
 */

@Entity
@ToString
public class SparePart {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private String partCode;
    private String partName;
    private int recommendedQtyPerPump;
    private String notes;

    public SparePart(int id, String partCode, String partName, int recommendedQtyPerPump, String notes) {
        this.id = id;
        this.partCode = partCode;
        this.partName = partName;
        this.recommendedQtyPerPump = recommendedQtyPerPump;
        this.notes = notes;
    }

    // Getters / setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getPartCode() { return partCode; }
    public void setPartCode(String partCode) { this.partCode = partCode; }

    public String getPartName() { return partName; }
    public void setPartName(String partName) { this.partName = partName; }

    public int getRecommendedQtyPerPump() { return recommendedQtyPerPump; }
    public void setRecommendedQtyPerPump(int recommendedQtyPerPump) { this.recommendedQtyPerPump = recommendedQtyPerPump; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    @Override
    public String toString() {
        return partCode + " - " + partName + " (qty rec.: " + recommendedQtyPerPump + ")";
    }
}
