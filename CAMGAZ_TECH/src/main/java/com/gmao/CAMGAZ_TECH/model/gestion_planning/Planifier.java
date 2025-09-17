package com.gmao.CAMGAZ_TECH.model.gestion_planning;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.gmao.CAMGAZ_TECH.model.gestion_site.Site;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@ToString(exclude = {"tachePlanifie"})
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"tachePlanifie"})
public class Planifier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id_Planifier;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_site")
    private Site site;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_tachePlanifie")
    @JsonIgnore
    private TachePlanifie tachePlanifie;

    // ✅ ANNOTATION POUR FORCER LA SÉRIALISATION AU FORMAT ISO
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate datePlanifie;


    public int getId_Planifier() {
        return id_Planifier;
    }

    public void setId_Planifier(int id_Planifier) {
        this.id_Planifier = id_Planifier;
    }

    public Site getSite() {
        return site;
    }

    public void setSite(Site site) {
        this.site = site;
    }

    public TachePlanifie getTachePlanifie() {
        return tachePlanifie;
    }

    public void setTachePlanifie(TachePlanifie tachePlanifie) {
        this.tachePlanifie = tachePlanifie;
    }

    public LocalDate getDatePlanifie() {
        return datePlanifie;
    }

    public void setDatePlanifie(LocalDate datePlanifie) {
        this.datePlanifie = datePlanifie;
    }
}
