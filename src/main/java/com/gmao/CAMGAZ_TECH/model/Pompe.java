package com.gmao.CAMGAZ_TECH.model;

public class Pompe {

    // --- 1. Identification ---
    private String codeEquipement;   // ex: GPL-P-101
    private String fabricant;
    private String typeModele;       // pompe centrifuge, palettes, cryogénique…
    private String numeroSerie;
    private int anneeFabrication;
    private String localisation;     // sphère GPL, rack chargement…
    private String criticite;        // A, B, C

    // --- 2. Caractéristiques techniques ---
    private double debitNominal;     // m³/h
    private double pressionRefoulement; // bar
    private double pressionAspiration;  // NPSH dispo
    private int vitesseRotation;     // rpm
    private double puissanceMoteur;  // kW
    private double temperatureService; // °C
    private String classeATEX;
    private String materiauxContact;
    private String equipementAssocie;

    // --- 3. Lubrification & étanchéité ---
    private String typePalier;
    private String lubrifiant;
    private String frequenceLub;
    private String typeEtancheite;
    private String fluideBarriere;

    public Pompe() {}

    // Getters et setters
    public String getCodeEquipement() { return codeEquipement; }
    public void setCodeEquipement(String codeEquipement) { this.codeEquipement = codeEquipement; }

    public String getFabricant() { return fabricant; }
    public void setFabricant(String fabricant) { this.fabricant = fabricant; }

    public String getTypeModele() { return typeModele; }
    public void setTypeModele(String typeModele) { this.typeModele = typeModele; }

    public String getNumeroSerie() { return numeroSerie; }
    public void setNumeroSerie(String numeroSerie) { this.numeroSerie = numeroSerie; }

    public int getAnneeFabrication() { return anneeFabrication; }
    public void setAnneeFabrication(int anneeFabrication) { this.anneeFabrication = anneeFabrication; }

    public String getLocalisation() { return localisation; }
    public void setLocalisation(String localisation) { this.localisation = localisation; }

    public String getCriticite() { return criticite; }
    public void setCriticite(String criticite) { this.criticite = criticite; }

    public double getDebitNominal() { return debitNominal; }
    public void setDebitNominal(double debitNominal) { this.debitNominal = debitNominal; }

    public double getPressionRefoulement() { return pressionRefoulement; }
    public void setPressionRefoulement(double pressionRefoulement) { this.pressionRefoulement = pressionRefoulement; }

    public double getPressionAspiration() { return pressionAspiration; }
    public void setPressionAspiration(double pressionAspiration) { this.pressionAspiration = pressionAspiration; }

    public int getVitesseRotation() { return vitesseRotation; }
    public void setVitesseRotation(int vitesseRotation) { this.vitesseRotation = vitesseRotation; }

    public double getPuissanceMoteur() { return puissanceMoteur; }
    public void setPuissanceMoteur(double puissanceMoteur) { this.puissanceMoteur = puissanceMoteur; }

    public double getTemperatureService() { return temperatureService; }
    public void setTemperatureService(double temperatureService) { this.temperatureService = temperatureService; }

    public String getClasseATEX() { return classeATEX; }
    public void setClasseATEX(String classeATEX) { this.classeATEX = classeATEX; }

    public String getMateriauxContact() { return materiauxContact; }
    public void setMateriauxContact(String materiauxContact) { this.materiauxContact = materiauxContact; }

    public String getEquipementAssocie() { return equipementAssocie; }
    public void setEquipementAssocie(String equipementAssocie) { this.equipementAssocie = equipementAssocie; }

    public String getTypePalier() { return typePalier; }
    public void setTypePalier(String typePalier) { this.typePalier = typePalier; }

    public String getLubrifiant() { return lubrifiant; }
    public void setLubrifiant(String lubrifiant) { this.lubrifiant = lubrifiant; }

    public String getFrequenceLub() { return frequenceLub; }
    public void setFrequenceLub(String frequenceLub) { this.frequenceLub = frequenceLub; }

    public String getTypeEtancheite() { return typeEtancheite; }
    public void setTypeEtancheite(String typeEtancheite) { this.typeEtancheite = typeEtancheite; }

    public String getFluideBarriere() { return fluideBarriere; }
    public void setFluideBarriere(String fluideBarriere) { this.fluideBarriere = fluideBarriere; }
}
