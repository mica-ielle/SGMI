package com.gmao.CAMGAZ_TECH.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.ToString;

/**
 * Représente une ligne d'une checklist (table checklists_items).
 * Constructeur attendu par ChecklistDAO:
 *   new ChecklistItem(id, checklistName, itemOrder, item)
 */

@Entity
@ToString
public class ChecklistItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private String checklistName;
    private int itemOrder;
    private String item;

    public ChecklistItem(int id, String checklistName, int itemOrder, String item) {
        this.id = id;
        this.checklistName = checklistName;
        this.itemOrder = itemOrder;
        this.item = item;
    }

    // Getters / setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getChecklistName() { return checklistName; }
    public void setChecklistName(String checklistName) { this.checklistName = checklistName; }

    public int getItemOrder() { return itemOrder; }
    public void setItemOrder(int itemOrder) { this.itemOrder = itemOrder; }

    public String getItem() { return item; }
    public void setItem(String item) { this.item = item; }

}
