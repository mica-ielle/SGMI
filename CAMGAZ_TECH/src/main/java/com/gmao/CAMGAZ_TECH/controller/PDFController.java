package com.gmao.CAMGAZ_TECH.controller;

import com.gmao.CAMGAZ_TECH.controller.gestion_equipement.EquipementController;
import com.gmao.CAMGAZ_TECH.model.gestion_planning.FicheIntervention;
import com.gmao.CAMGAZ_TECH.repository.gestion_planning.FicheInterventionRepository;
import com.gmao.CAMGAZ_TECH.service.gestion_site.GestionSiteImpl;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import com.itextpdf.text.pdf.draw.LineSeparator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.net.URL;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@RestController
@CrossOrigin(origins = "*", maxAge = 3600)
public class PDFController {

    final static Logger logger = LoggerFactory.getLogger(PDFController.class);


    @Autowired
    private FicheInterventionRepository ficheRepo;
    @Autowired
    private GestionSiteImpl gestionSite;

    // Constantes pour les couleurs de l'entreprise
    private static final BaseColor PRIMARY_COLOR = new BaseColor(30, 58, 138); // Dark Blue #1e3a8a
    private static final BaseColor SECONDARY_COLOR = new BaseColor(139, 69, 19); // Brown
    private static final BaseColor ACCENT_COLOR = new BaseColor(6, 182, 212); // Cyan #06b6d4
    private static final BaseColor GRAY_COLOR = new BaseColor(100, 116, 139); // Gray #64748b

    @GetMapping("/download-pdf/{id}")
    public ResponseEntity<InputStreamResource> generatePdf(@PathVariable int id) throws Exception {
        FicheIntervention fiche = ficheRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Fiche non trouvée"));

        File pdfFile = File.createTempFile("fiche_intervention_" + id, ".pdf");

        try (FileOutputStream fos = new FileOutputStream(pdfFile)) {
            Document document = new Document(PageSize.A4, 40, 40, 80, 50);
            PdfWriter writer = PdfWriter.getInstance(document, fos);

            // Ajouter un événement pour l'en-tête et le pied de page
            writer.setPageEvent(new HeaderFooterPageEvent());

            document.open();

            // Polices personnalisées
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 24, PRIMARY_COLOR);
            Font subtitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, PRIMARY_COLOR);
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, BaseColor.WHITE);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 11, BaseColor.BLACK);
            Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, BaseColor.BLACK);
            Font smallFont = FontFactory.getFont(FontFactory.HELVETICA, 9, GRAY_COLOR);

            // === EN-TÊTE PRINCIPAL ===
            addCompanyHeader(document, titleFont, normalFont);

            // Espacement
            document.add(new Paragraph(" ", normalFont));

            // === TITRE DU DOCUMENT ===
            Paragraph title = new Paragraph("FICHE D'INTERVENTION", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);

            // === INFORMATIONS GÉNÉRALES ===
            addGeneralInfo(document, fiche, subtitleFont, normalFont, boldFont);

            // === DÉTAILS DE L'ÉQUIPEMENT ===
            if (fiche.getEquipement() != null) {
                addEquipmentDetails(document, fiche, subtitleFont, normalFont, boldFont);
            }

            // === DÉTAILS DE L'INTERVENTION ===
            addInterventionDetails(document, fiche, subtitleFont, normalFont, boldFont);

            // === MATÉRIAUX ET PIÈCES UTILISÉES ===
            if (fiche.getPiecesRemplacees() != null && !fiche.getPiecesRemplacees().isEmpty()) {
                addUsedParts(document, fiche, subtitleFont, normalFont, boldFont, headerFont);
            }

            // === INTERVENANTS ===
            if (fiche.getNomsIntervenants() != null && !fiche.getNomsIntervenants().isEmpty()) {
                addIntervenants(document, fiche, subtitleFont, normalFont, boldFont);
            }

            // === RÉSULTATS ET CONCLUSIONS ===
            addResults(document, fiche, subtitleFont, normalFont, boldFont);

            // === SIGNATURES ===
            addSignatureSection(document, subtitleFont, normalFont);

            // === PIED DE PAGE INFORMATIF ===
            addFooterInfo(document, smallFont);

            document.close();
        }

        logger.info("Gooooooood");

        InputStreamResource resource = new InputStreamResource(new FileInputStream(pdfFile));
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=fiche_intervention_" + id + "_CAMGAZ_TECH.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .contentLength(pdfFile.length())
                .body(resource);
    }

    private void addCompanyHeader(Document document, Font titleFont, Font normalFont) throws DocumentException {
        // Tableau pour l'en-tête de l'entreprise
        PdfPTable headerTable = new PdfPTable(2);
        headerTable.setWidthPercentage(100);
        headerTable.setWidths(new float[]{1, 3});

        // Logo CAMGAZ-TECH
        PdfPCell logoCell = new PdfPCell();
        logoCell.setBorder(Rectangle.NO_BORDER);
        logoCell.setFixedHeight(65);
        logoCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        logoCell.setHorizontalAlignment(Element.ALIGN_CENTER);

        // Gradient background pour le logo
        logoCell.setBackgroundColor(PRIMARY_COLOR);

        try {
            // Tentative de chargement du logo depuis les assets
            String[] possiblePaths = {
                    "static/images/logo.jpg"
            };

            boolean logoLoaded = false;
            for (String logoPath : possiblePaths) {
                try {
                    ClassPathResource logoResource = new ClassPathResource(logoPath);
                    if (logoResource.exists()) {
                        Image logo = Image.getInstance(logoResource.getURL());
                        logo.scaleToFit(55, 55);
                        logo.setAlignment(Element.ALIGN_CENTER);
                        logoCell.addElement(logo);
                        logoLoaded = true;
                        break;
                    }
                } catch (Exception e) {
                    // Continue vers le chemin suivant
                }
            }

            if (!logoLoaded) {
                // Design élégant avec typographie moderne
                PdfPTable logoTable = new PdfPTable(1);
                logoTable.setWidthPercentage(100);

                // Partie CAMGAZ
                PdfPCell camgazCell = new PdfPCell();
                camgazCell.setBorder(Rectangle.NO_BORDER);
                camgazCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                Paragraph camgaz = new Paragraph("CAMGAZ", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, BaseColor.WHITE));
                camgaz.setAlignment(Element.ALIGN_CENTER);
                camgazCell.addElement(camgaz);
                logoTable.addCell(camgazCell);

                // Ligne séparatrice stylée
                PdfPCell separatorCell = new PdfPCell();
                separatorCell.setBorder(Rectangle.NO_BORDER);
                separatorCell.setFixedHeight(2);
                separatorCell.setBackgroundColor(ACCENT_COLOR);
                logoTable.addCell(separatorCell);

                // Partie TECH
                PdfPCell techCell = new PdfPCell();
                techCell.setBorder(Rectangle.NO_BORDER);
                techCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                Paragraph tech = new Paragraph("TECH", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, ACCENT_COLOR));
                tech.setAlignment(Element.ALIGN_CENTER);
                techCell.addElement(tech);
                logoTable.addCell(techCell);

                logoCell.addElement(logoTable);
            }

        } catch (Exception e) {
            // Fallback ultime avec design minimal mais élégant
            PdfPTable fallbackTable = new PdfPTable(1);
            fallbackTable.setWidthPercentage(100);

            PdfPCell fallbackCell = new PdfPCell();
            fallbackCell.setBorder(Rectangle.NO_BORDER);
            fallbackCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            fallbackCell.setVerticalAlignment(Element.ALIGN_MIDDLE);

            Paragraph initials = new Paragraph("GT", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 24, BaseColor.WHITE));
            initials.setAlignment(Element.ALIGN_CENTER);
            fallbackCell.addElement(initials);

            Paragraph subtitle = new Paragraph("MAINTENANCE", FontFactory.getFont(FontFactory.HELVETICA, 8, ACCENT_COLOR));
            subtitle.setAlignment(Element.ALIGN_CENTER);
            fallbackCell.addElement(subtitle);

            fallbackTable.addCell(fallbackCell);
            logoCell.addElement(fallbackTable);
        }

        headerTable.addCell(logoCell);

        // Informations de l'entreprise
        PdfPCell companyCell = new PdfPCell();
        companyCell.setBorder(Rectangle.NO_BORDER);
        companyCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        companyCell.setPaddingLeft(15);

        Paragraph companyName = new Paragraph("CAMGAZ-TECH", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, PRIMARY_COLOR));
        companyName.setSpacingAfter(3);

        Paragraph companySubtitle = new Paragraph("Système de Gestion de Maintenance d'Équipements Industriels", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, ACCENT_COLOR));
        companySubtitle.setSpacingAfter(5);

        Paragraph companyInfo = new Paragraph("📍 Adresse: Zone Industrielle, Douala | 📞 Tél: +237 6XX XX XX XX | 📧 Email: contact@camgaz-tech.cm", FontFactory.getFont(FontFactory.HELVETICA, 9, GRAY_COLOR));

        companyCell.addElement(companyName);
        companyCell.addElement(companySubtitle);
        companyCell.addElement(companyInfo);
        headerTable.addCell(companyCell);

        document.add(headerTable);

        // Ligne de séparation
        LineSeparator separator = new LineSeparator();
        separator.setLineColor(PRIMARY_COLOR);
        separator.setLineWidth(2);
        document.add(new Chunk(separator));
        document.add(new Paragraph(" "));
    }

    private void addGeneralInfo(Document document, FicheIntervention fiche, Font subtitleFont, Font normalFont, Font boldFont) throws DocumentException {
        Paragraph sectionTitle = new Paragraph("📋 INFORMATIONS GÉNÉRALES", subtitleFont);
        sectionTitle.setSpacingBefore(15);
        sectionTitle.setSpacingAfter(10);
        document.add(sectionTitle);

        PdfPTable infoTable = new PdfPTable(4);
        infoTable.setWidthPercentage(100);
        infoTable.setWidths(new float[]{1, 1, 1, 1});

        addInfoRow(infoTable, "N° Fiche", String.valueOf(fiche.getId_ficheIntervention()), "Type", fiche.getType().toString(), boldFont, normalFont);
        addInfoRow(infoTable, "Date/Heure", fiche.getDateHeureIntervention() != null ? fiche.getDateHeureIntervention().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")) : "N/A",
                "Statut", fiche.getResultat() != null ? fiche.getResultat().toString() : "En cours", boldFont, normalFont);

        document.add(infoTable);
        document.add(new Paragraph(" "));
    }

    private void addEquipmentDetails(Document document, FicheIntervention fiche, Font subtitleFont, Font normalFont, Font boldFont) throws DocumentException {
        Paragraph sectionTitle = new Paragraph("⚙️ DÉTAILS DE L'ÉQUIPEMENT", subtitleFont);
        sectionTitle.setSpacingBefore(15);
        sectionTitle.setSpacingAfter(10);
        document.add(sectionTitle);

        PdfPTable equipTable = new PdfPTable(2);
        equipTable.setWidthPercentage(100);
        equipTable.setWidths(new float[]{1, 2});

        addDetailRow(equipTable, "Nom de l'équipement", fiche.getEquipement().getNom(), boldFont, normalFont);
        addDetailRow(equipTable, "Modèle", fiche.getEquipement().getReference() != null ? fiche.getEquipement().getReference() : "N/A", boldFont, normalFont);
        addDetailRow(equipTable, "Type d'équipement", fiche.getEquipement().getType() != null ? fiche.getEquipement().getType().toString() : "N/A", boldFont, normalFont);
        addDetailRow(equipTable, "Fournisseur", fiche.getEquipement().getFournisseur() != null ? fiche.getEquipement().getFournisseur() : "N/A", boldFont, normalFont);
        addDetailRow(equipTable, "Site d'installation", gestionSite.findSiteByEi(fiche.getEquipement().getId_equipement())  != null ? gestionSite.findSiteByEi(fiche.getEquipement().getId_equipement()).getNom() : "N/A", boldFont, normalFont);

        document.add(equipTable);
        document.add(new Paragraph(" "));
    }

    private void addInterventionDetails(Document document, FicheIntervention fiche, Font subtitleFont, Font normalFont, Font boldFont) throws DocumentException {
        Paragraph sectionTitle = new Paragraph("🔧 DÉTAILS DE L'INTERVENTION", subtitleFont);
        sectionTitle.setSpacingBefore(15);
        sectionTitle.setSpacingAfter(10);
        document.add(sectionTitle);

        PdfPTable detailsTable = new PdfPTable(1);
        detailsTable.setWidthPercentage(100);

        // Description
        PdfPCell descCell = new PdfPCell();
        descCell.setBorder(Rectangle.BOX);
        descCell.setPadding(8);
        descCell.addElement(new Paragraph("Description de l'intervention:", boldFont));
        descCell.addElement(new Paragraph(fiche.getDescriptionIntervention() != null ? fiche.getDescriptionIntervention() : "Aucune description", normalFont));
        detailsTable.addCell(descCell);

        // Travaux effectués
        PdfPCell workCell = new PdfPCell();
        workCell.setBorder(Rectangle.BOX);
        workCell.setPadding(8);
        workCell.addElement(new Paragraph("Travaux effectués:", boldFont));
        workCell.addElement(new Paragraph(fiche.getTravauxEffectues() != null ? fiche.getTravauxEffectues() : "Aucun travail spécifié", normalFont));
        detailsTable.addCell(workCell);

        document.add(detailsTable);
        document.add(new Paragraph(" "));
    }

    private void addUsedParts(Document document, FicheIntervention fiche, Font subtitleFont, Font normalFont, Font boldFont, Font headerFont) throws DocumentException {
        Paragraph sectionTitle = new Paragraph("🔩 MATÉRIAUX ET PIÈCES UTILISÉES", subtitleFont);
        sectionTitle.setSpacingBefore(15);
        sectionTitle.setSpacingAfter(10);
        document.add(sectionTitle);

        PdfPTable partsTable = new PdfPTable(4);
        partsTable.setWidthPercentage(100);
        partsTable.setWidths(new float[]{2, 1, 1, 1});

        // En-têtes
        addTableHeader(partsTable, "Pièce", headerFont);
        addTableHeader(partsTable, "Quantité", headerFont);
        addTableHeader(partsTable, "Prix unitaire", headerFont);
        addTableHeader(partsTable, "Total", headerFont);

        // Données (simulation car la structure exacte des pièces n'est pas claire)
        fiche.getPiecesRemplacees().forEach(piece -> {
            addTableCell(partsTable, piece.toString(), normalFont);
            addTableCell(partsTable, "1", normalFont); // Quantité par défaut
            addTableCell(partsTable, "€ 0.00", normalFont); // Prix par défaut
            addTableCell(partsTable, "€ 0.00", normalFont); // Total par défaut
        });

        document.add(partsTable);
        document.add(new Paragraph(" "));
    }

    private void addIntervenants(Document document, FicheIntervention fiche, Font subtitleFont, Font normalFont, Font boldFont) throws DocumentException {
        Paragraph sectionTitle = new Paragraph("👥 INTERVENANTS", subtitleFont);
        sectionTitle.setSpacingBefore(15);
        sectionTitle.setSpacingAfter(10);
        document.add(sectionTitle);

        PdfPTable interventTable = new PdfPTable(1);
        interventTable.setWidthPercentage(100);

        String intervenants = String.join(", ", fiche.getNomsIntervenants());
        PdfPCell interventCell = new PdfPCell();
        interventCell.setBorder(Rectangle.BOX);
        interventCell.setPadding(8);
        interventCell.addElement(new Paragraph("Liste des intervenants:", boldFont));
        interventCell.addElement(new Paragraph(intervenants, normalFont));
        interventTable.addCell(interventCell);

        document.add(interventTable);
        document.add(new Paragraph(" "));
    }

    private void addResults(Document document, FicheIntervention fiche, Font subtitleFont, Font normalFont, Font boldFont) throws DocumentException {
        Paragraph sectionTitle = new Paragraph("📊 RÉSULTATS ET CONCLUSIONS", subtitleFont);
        sectionTitle.setSpacingBefore(15);
        sectionTitle.setSpacingAfter(10);
        document.add(sectionTitle);

        PdfPTable resultsTable = new PdfPTable(2);
        resultsTable.setWidthPercentage(100);
        resultsTable.setWidths(new float[]{1, 1});

        addDetailRow(resultsTable, "Coût total", (Double.valueOf(fiche.getCoutTotal())) != null ? (fiche.getCoutTotal()+" FCFA") : "0.00 FCFA", boldFont, normalFont);
        addDetailRow(resultsTable, "Résultat", fiche.getResultat() != null ? fiche.getResultat().toString() : "En attente", boldFont, normalFont);

        document.add(resultsTable);

        // Commentaires
        if (fiche.getCommentairesAdditionnels() != null && !fiche.getCommentairesAdditionnels().trim().isEmpty()) {
            PdfPTable commentsTable = new PdfPTable(1);
            commentsTable.setWidthPercentage(100);
            commentsTable.setSpacingBefore(10);

            PdfPCell commentCell = new PdfPCell();
            commentCell.setBorder(Rectangle.BOX);
            commentCell.setPadding(8);
            commentCell.addElement(new Paragraph("Commentaires additionnels:", boldFont));
            commentCell.addElement(new Paragraph(fiche.getCommentairesAdditionnels(), normalFont));
            commentsTable.addCell(commentCell);

            document.add(commentsTable);
        }

        document.add(new Paragraph(" "));
    }

    private void addSignatureSection(Document document, Font subtitleFont, Font normalFont) throws DocumentException {
        Paragraph sectionTitle = new Paragraph("✍️ SIGNATURES", subtitleFont);
        sectionTitle.setSpacingBefore(20);
        sectionTitle.setSpacingAfter(15);
        document.add(sectionTitle);

        PdfPTable signatureTable = new PdfPTable(2);
        signatureTable.setWidthPercentage(100);
        signatureTable.setWidths(new float[]{1, 1});

        // Signature technicien
        PdfPCell techCell = new PdfPCell();
        techCell.setBorder(Rectangle.BOX);
        techCell.setPadding(8);
        techCell.setFixedHeight(80);
        techCell.addElement(new Paragraph("Signature du technicien:", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10)));
        techCell.addElement(new Paragraph(" "));
        techCell.addElement(new Paragraph("Date: ___________", normalFont));
        signatureTable.addCell(techCell);

        // Signature responsable
        PdfPCell respCell = new PdfPCell();
        respCell.setBorder(Rectangle.BOX);
        respCell.setPadding(8);
        respCell.setFixedHeight(80);
        respCell.addElement(new Paragraph("Signature du responsable:", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10)));
        respCell.addElement(new Paragraph(" "));
        respCell.addElement(new Paragraph("Date: ___________", normalFont));
        signatureTable.addCell(respCell);

        document.add(signatureTable);
    }

    private void addFooterInfo(Document document, Font smallFont) throws DocumentException {
        document.add(new Paragraph(" "));
        document.add(new Paragraph(" "));

        LineSeparator separator = new LineSeparator();
        separator.setLineColor(GRAY_COLOR);
        separator.setLineWidth(1);
        document.add(new Chunk(separator));

        // Informations de pied de page sur deux lignes
        Paragraph footer1 = new Paragraph("Document généré automatiquement par CAMGAZ-TECH • " +
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy à HH:mm")) +
                " • Version 1.0", smallFont);
        footer1.setAlignment(Element.ALIGN_CENTER);
        footer1.setSpacingBefore(5);
        document.add(footer1);

        Paragraph footer2 = new Paragraph("CONFIDENTIEL - Système de Gestion de Maintenance Industrielle • www.camgaz-tech.cm",
                FontFactory.getFont(FontFactory.HELVETICA, 8, GRAY_COLOR));
        footer2.setAlignment(Element.ALIGN_CENTER);
        footer2.setSpacingBefore(2);
        document.add(footer2);
    }

    // Méthodes utilitaires
    private void addInfoRow(PdfPTable table, String label1, String value1, String label2, String value2, Font boldFont, Font normalFont) {
        addTableCell(table, label1 + ":", boldFont);
        addTableCell(table, value1, normalFont);
        addTableCell(table, label2 + ":", boldFont);
        addTableCell(table, value2, normalFont);
    }

    private void addDetailRow(PdfPTable table, String label, String value, Font boldFont, Font normalFont) {
        PdfPCell labelCell = new PdfPCell(new Phrase(label + ":", boldFont));
        labelCell.setBorder(Rectangle.BOX);
        labelCell.setPadding(5);
        labelCell.setBackgroundColor(new BaseColor(248, 250, 252));
        table.addCell(labelCell);

        PdfPCell valueCell = new PdfPCell(new Phrase(value, normalFont));
        valueCell.setBorder(Rectangle.BOX);
        valueCell.setPadding(5);
        table.addCell(valueCell);
    }

    private void addTableHeader(PdfPTable table, String text, Font headerFont) {
        PdfPCell cell = new PdfPCell(new Phrase(text, headerFont));
        cell.setBackgroundColor(PRIMARY_COLOR);
        cell.setBorder(Rectangle.BOX);
        cell.setPadding(8);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        table.addCell(cell);
    }

    private void addTableCell(PdfPTable table, String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBorder(Rectangle.BOX);
        cell.setPadding(5);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        table.addCell(cell);
    }

    // Classe pour gérer l'en-tête et le pied de page
    class HeaderFooterPageEvent extends PdfPageEventHelper {
        @Override
        public void onEndPage(PdfWriter writer, Document document) {
            try {
                // Numéro de page
                Font pageFont = FontFactory.getFont(FontFactory.HELVETICA, 8, GRAY_COLOR);
                Phrase pagePhrase = new Phrase("Page " + writer.getPageNumber(), pageFont);
                ColumnText.showTextAligned(writer.getDirectContent(), Element.ALIGN_RIGHT, pagePhrase,
                        document.right(), document.bottom() - 10, 0);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }


}