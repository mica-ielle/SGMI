package com.gmao.CAMGAZ_TECH.service.gestion_site;

import com.gmao.CAMGAZ_TECH.model.gestion_equipements.Equipement;
import com.gmao.CAMGAZ_TECH.model.gestion_planning.OccurenceMainteance;
import com.gmao.CAMGAZ_TECH.model.gestion_site.EquipementInstalle;
import com.gmao.CAMGAZ_TECH.model.gestion_site.Site;
import com.gmao.CAMGAZ_TECH.repository.gestion_site.EquipementInstalleRepository;
import com.gmao.CAMGAZ_TECH.repository.gestion_site.SiteRepository;
import com.gmao.CAMGAZ_TECH.service.gestion_equipement.GestionEquipementsImpl;
import com.gmao.CAMGAZ_TECH.service.gestion_planning.GestionPlanningImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.crossstore.ChangeSetPersister;
import org.springframework.stereotype.Service;

import java.sql.Date;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class GestionSiteImpl implements GestionSite{

    private final SiteRepository siteRepository;
    private final EquipementInstalleRepository equipementInstalleRepository;

    @Autowired
    private GestionPlanningImpl gestionPlanning;

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


       // logger.info("Site ccc: "+site.getEquipementInstalles().size());
        logger.info("ei created: |||| "+equipementIdList.size());

        for (int equipementId:equipementIdList) {
            EquipementInstalle e = new EquipementInstalle();
            try {
                e.setSite(getSiteByID(s.getId_site()));
                Equipement currentEquipement = service_equipement.getEquipementByID(equipementId);
                e.setEquipement(currentEquipement);
                e.setDate_installation(dateInstall);
                e.setDerniere_maintenance(dateMap);

            } catch (ChangeSetPersister.NotFoundException ex) {
                throw new RuntimeException(ex);
            }

            OccurenceMainteance occurenceMainteanceSite = new OccurenceMainteance();
            occurenceMainteanceSite.setStatut(OccurenceMainteance.StatutMaintenance.PLANIFIEE);
            occurenceMainteanceSite.setDatePrevue(LocalDate.now());

            gestionPlanning.createOccurenceMainteance(occurenceMainteanceSite,equipementId);

            equipementInstalleRepository.save(e);
            logger.info("ei created: | ");
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
    public Site updateSite(int siteId, Site site, List<EquipementInstalle> nouveauxEquipementInstalle) {
        this.site = siteRepository.findById(siteId).get();

        this.site.setNom(site.getNom());
        this.site.setVille(site.getVille());
        this.site.setNom_contact(site.getNom_contact());
        this.site.setTel_contact(site.getTel_contact());


        for (EquipementInstalle equipementInstalle:nouveauxEquipementInstalle) {


            Optional<EquipementInstalle> existingEquipementInstalle = equipementInstalleRepository.findById(equipementInstalle.getId_equipementInstalle());

            if ((existingEquipementInstalle.isPresent())){

                EquipementInstalle equipementInstalleToUpdate = existingEquipementInstalle.get();

                updateEquipementInstalle(siteId, this.site, nouveauxEquipementInstalle);
                equipementInstalleRepository.save(equipementInstalleToUpdate);
            }else {
                equipementInstalleRepository.save(equipementInstalle);
            }
        }

        this.site.setEquipementInstalles(site.getEquipementInstalles());

        logger.info("site successfully updated ");

        return siteRepository.save(this.site);
    }


   public void updateEquipementInstalle(int siteID, Site site, List<EquipementInstalle> nouveauxEquipementsInstalles) {

        site.getEquipementInstalles().removeIf(existingEquipementInstalle ->
                nouveauxEquipementsInstalles.stream().noneMatch(

                        nouveauEquipementsInstalle -> nouveauEquipementsInstalle.getId_equipementInstalle() == existingEquipementInstalle.getId_equipementInstalle())
        );
        for (EquipementInstalle nouveauEquipementInstalle : nouveauxEquipementsInstalles){
            Optional<EquipementInstalle> existingEquipementInstalle = equipementInstalleRepository.findById(nouveauEquipementInstalle.getId_equipementInstalle());
            if (existingEquipementInstalle.isPresent()){
                try {

                    EquipementInstalle equipementInstalleToUpdate = existingEquipementInstalle.get();
                    equipementInstalleToUpdate.setDate_installation(nouveauEquipementInstalle.getDate_installation());
                    equipementInstalleToUpdate.setSite(getSiteByID(siteID));
                    equipementInstalleToUpdate.setEquipement(nouveauEquipementInstalle.getEquipement());
                    equipementInstalleToUpdate.setDerniere_maintenance(nouveauEquipementInstalle.getDerniere_maintenance());


                    equipementInstalleRepository.save(equipementInstalleToUpdate);
                } catch (ChangeSetPersister.NotFoundException e) {
                    throw new RuntimeException(e);
                }
            }else {
                nouveauEquipementInstalle.setSite(site);

                equipementInstalleRepository.save(nouveauEquipementInstalle);
                site.getEquipementInstalles().add(nouveauEquipementInstalle);
            }
        }

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

    @Override
    public List<EquipementInstalle> installEquipement(int siteId, List<Integer> equipementsId, List<Date> datesInstall) {

        List<EquipementInstalle> list = new ArrayList<>();

        int indice = 0;
        for (int id:equipementsId) {

            EquipementInstalle equipementInstalle = new EquipementInstalle();

            try {
                logger.info("id equipement a installer : "+id);
                Equipement equipement = service_equipement.getEquipementByID(id);

                equipementInstalle.setSite(siteRepository.findById(siteId).get());
                equipementInstalle.setDate_installation(datesInstall.get(indice));
                equipementInstalle.setEquipement(equipement);

            } catch (ChangeSetPersister.NotFoundException e) {
                throw new RuntimeException(e);
            }

            equipementInstalleRepository.save(equipementInstalle);
            list.add(equipementInstalle);

            indice++;
        }

        return list;
    }


}
