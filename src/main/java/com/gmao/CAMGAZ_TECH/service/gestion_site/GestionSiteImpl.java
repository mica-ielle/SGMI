package com.gmao.CAMGAZ_TECH.service.gestion_site;

import com.gmao.CAMGAZ_TECH.model.gestion_equipements.Equipement;
import com.gmao.CAMGAZ_TECH.model.gestion_site.EquipementInstalle;
import com.gmao.CAMGAZ_TECH.model.gestion_site.Site;
import com.gmao.CAMGAZ_TECH.repository.gestion_site.EquipementInstalleRepository;
import com.gmao.CAMGAZ_TECH.repository.gestion_site.SiteRepository;
import com.gmao.CAMGAZ_TECH.service.gestion_equipement.GestionEquipementsImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.crossstore.ChangeSetPersister;
import org.springframework.stereotype.Service;

import java.sql.Date;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class GestionSiteImpl implements GestionSite{

    private final SiteRepository siteRepository;
    private final EquipementInstalleRepository equipementInstalleRepository;

    private Site site;

    final static Logger logger = LoggerFactory.getLogger(GestionSiteImpl.class);


    @Autowired
    public GestionEquipementsImpl service_equipement;
    @Autowired
    public GestionSiteImpl(SiteRepository siteRepository, EquipementInstalleRepository equipementInstalleRepository) {
        this.siteRepository = siteRepository;
        this.equipementInstalleRepository = equipementInstalleRepository;
    }


    @Override
    public Site createSite(Site site, List<Integer> equipementIdList, Date dateInstall, Map<Integer,Date> dateMap) {

        Site s = siteRepository.save(site);


        logger.info("Site ccc: "+site.getEquipementInstalles().size());

        EquipementInstalle e = new EquipementInstalle();
        for (int equipementId:equipementIdList) {
            try {
                e.setSite(getSiteByID(s.getId_site()));
                Equipement currentEquipement = service_equipement.getEquipementByID(equipementId);
                e.setEquipement(currentEquipement);
                e.setDate_installation(dateInstall);
                e.setDerniere_maintenance(dateMap);

            } catch (ChangeSetPersister.NotFoundException ex) {
                throw new RuntimeException(ex);
            }
            equipementInstalleRepository.save(e);
        }

        logger.info("Site successfully created: "+site.toString());
        return s;
    }

    @Override
    public Site getSiteByID(int siteID) throws ChangeSetPersister.NotFoundException {
        //check if a site with this id exist
        boolean check=siteRepository.existsById(siteID);
        if(check) {
            logger.info("All sites successfully loaded ");
            return siteRepository.findById(siteID).get();
        }
        else {
            logger.info("No site was found ");
            throw new ChangeSetPersister.NotFoundException();
        }
    }

    @Override
    public boolean updateSite(int siteId, Site site, Map<Integer,Date> dateMap) {
        boolean check=siteRepository.existsById(siteId);
        if(check) {
            //get the site
            this.site = siteRepository.findById(siteId).get();

            this.site.setNom(site.getNom());
            this.site.setVille(site.getVille());
            this.site.setNom_contact(site.getNom_contact());
            this.site.setTel_contact(site.getTel_contact());

            List<EquipementInstalle> equipementInstalleList = new ArrayList<>();

            try {
                for (EquipementInstalle e:getSiteByID(siteId).getEquipementInstalles()) {
                    equipementInstalleList.add(
                            updateEquipementInstalle(
                                    e.getId_equipementInstalle(),
                                    siteId,
                                    e.getEquipement().getId_equipement(),
                                    e.getDate_installation(),
                                    dateMap
                            )
                    );
                }
            } catch (ChangeSetPersister.NotFoundException e) {
                throw new RuntimeException(e);
            }

            this.site.setEquipementInstalles(equipementInstalleList);

            logger.info("site successfully updated ");
            //save modifications
            siteRepository.save(this.site);
        }
        return check;
    }


   public EquipementInstalle updateEquipementInstalle(int id_equipementInstalle, int siteID, int equipementID, Date dateInstall, Map<Integer,Date> dateMap) {
        EquipementInstalle ei = equipementInstalleRepository.findById(id_equipementInstalle).get();

        try {
            ei.setSite(getSiteByID(siteID));
            ei.setEquipement(service_equipement.getEquipementByID(equipementID));
            ei.setDate_installation(dateInstall);

            ei.setDerniere_maintenance(dateMap);


        } catch (ChangeSetPersister.NotFoundException e) {
            throw new RuntimeException(e);
        }

        logger.info("EquipementInstalle successfully updated ");
        //save modifications
        return equipementInstalleRepository.save(ei);

    }

    @Override
    public boolean deleteSite(int siteId) {
        boolean check1=siteRepository.existsById(siteId);
        if(check1) {
            try {
                site = getSiteByID(siteId);

                for (EquipementInstalle equipementInstalle:site.getEquipementInstalles()) {
                    equipementInstalleRepository.deleteById(equipementInstalle.getId_equipementInstalle());
                }

                siteRepository.deleteById(siteId);

                logger.info("site was successfully deleted ");
                return true;

            } catch (ChangeSetPersister.NotFoundException e) {
                throw new RuntimeException(e);
            }

        }
        else {
            logger.info("site does not exist ");
            return false;
        }
    }

    @Override
    public List<Site> findAllSites() {
        return siteRepository.findAll();
    }
}
