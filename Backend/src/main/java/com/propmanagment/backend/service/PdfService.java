package com.propmanagment.backend.service;

import java.io.ByteArrayOutputStream;
import java.util.Base64;

import org.springframework.stereotype.Service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfWriter;
import com.propmanagment.backend.model.RentAgreement;

@Service
public class PdfService {

    public byte[] generatePdf(RentAgreement ag) {
        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            Document document = new Document(PageSize.A4, 40, 40, 40, 40);
            PdfWriter.getInstance(document, out);
            document.open();

            // Fonts
            Font titleFont = new Font(Font.TIMES_ROMAN, 20, Font.BOLD);
            Font headingFont = new Font(Font.TIMES_ROMAN, 14, Font.BOLD);
            Font normal = new Font(Font.TIMES_ROMAN, 12);
            Font bold = new Font(Font.TIMES_ROMAN, 12, Font.BOLD);

            // ---------- TITLE ----------
            Paragraph title = new Paragraph("RENT AGREEMENT\n\n", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);

            // ---------- DATE ----------
            Paragraph datePara = new Paragraph(
                "This Rent Agreement is made and executed on this " +
                        ag.getStartDate() + " at " + ag.getCity() + ", " + ag.getState() + ".\n\n",
                normal
            );
            datePara.setAlignment(Element.ALIGN_JUSTIFIED);
            document.add(datePara);

            // ---------- BETWEEN SECTION ----------
            Paragraph between = new Paragraph("BETWEEN\n\n", headingFont);
            between.setAlignment(Element.ALIGN_CENTER);
            document.add(between);

            Paragraph landlordPara = new Paragraph(
                    "Mr./Mrs. " + ag.getLandlordName() + ", aged about ___ years, residing at " + ag.getCity() +
                            ", hereinafter referred to as the “Lessor / Landlord”.\n\n",
                    normal
            );
            landlordPara.setAlignment(Element.ALIGN_JUSTIFIED);
            document.add(landlordPara);

            Paragraph andPara = new Paragraph("AND\n\n", headingFont);
            andPara.setAlignment(Element.ALIGN_CENTER);
            document.add(andPara);

            Paragraph tenantPara = new Paragraph(
                    "Mr./Mrs. " + ag.getTenantName() + ", aged about " + ag.getTenantAge() + 
                            " years, residing at " + ag.getCity() +
                            ", hereinafter referred to as the “Lessee / Tenant”.\n\n",
                    normal
            );
            tenantPara.setAlignment(Element.ALIGN_JUSTIFIED);
            document.add(tenantPara);

            // ---------- WHEREAS ----------
            Paragraph whereAs = new Paragraph("WHEREAS\n\n", headingFont);
            whereAs.setAlignment(Element.ALIGN_CENTER);
            document.add(whereAs);

            Paragraph whereAsText = new Paragraph(
                    "The Lessor is the lawful owner of the premises located at: " +
                            ag.getPropertyAddress() + ". The Lessor has agreed to give the said premises on rent " +
                            "and the Lessee has agreed to accept the premises on rent subject to the following terms and conditions:\n\n",
                    normal
            );
            whereAsText.setAlignment(Element.ALIGN_JUSTIFIED);
            document.add(whereAsText);

            // ---------- TERMS ----------
            Paragraph termsTitle = new Paragraph("TERMS AND CONDITIONS\n\n", headingFont);
            termsTitle.setAlignment(Element.ALIGN_CENTER);
            document.add(termsTitle);

            // Terms list (each properly justified)
            addTerm(document, "1. Period of Tenancy", 
                    "The tenancy shall be for a period of " + ag.getAgreementPeriod() + 
                    ", commencing from " + ag.getStartDate() + " and ending on " + ag.getEndDate() + ".", normal);

            addTerm(document, "2. Rent", 
                    "The monthly rent shall be Rs. " + ag.getMonthlyRent() + "/-, payable monthly in advance.", normal);

            addTerm(document, "3. Security Deposit", 
                    "The Lessee has paid a refundable security deposit of Rs. " + ag.getSecurityDeposit() + "/- to the Lessor.", normal);

            addTerm(document, "4. Utilities", 
                    "The Lessee shall bear electricity, water, gas, and other applicable utility charges.", normal);

            addTerm(document, "5. Maintenance", 
                    "Routine maintenance shall be done by the Lessee while major repairs shall be borne by the Lessor.", normal);

            addTerm(document, "6. Use of Premises", 
                    "The premises shall be used strictly for residential purposes only.", normal);

            addTerm(document, "7. Termination", 
                    "Either party may terminate the agreement by giving one month's written notice.", normal);

            // ---------- SIGN BLOCK ----------
            Paragraph witness = new Paragraph("\nIN WITNESS WHEREOF, both parties affix their signatures below:\n\n", normal);
            witness.setAlignment(Element.ALIGN_JUSTIFIED);
            document.add(witness);

            // LANDLORD SIGN
            document.add(new Paragraph("Lessor / Landlord:", bold));

            if (ag.getLandlordSignatureBase64() != null) {
                byte[] sigBytes = Base64.getDecoder().decode(ag.getLandlordSignatureBase64());
                Image img = Image.getInstance(sigBytes);
                img.scaleAbsolute(120, 50);
                document.add(img);
            }
            document.add(new Paragraph("Name: " + ag.getLandlordName(), normal));
            document.add(new Paragraph("Mobile: " + ag.getLandlordMobile() + "\n\n", normal));

            // TENANT SIGN
            document.add(new Paragraph("Lessee / Tenant:", bold));

            if (ag.getTenantSignatureBase64() != null) {
                byte[] sigBytes2 = Base64.getDecoder().decode(ag.getTenantSignatureBase64());
                Image img2 = Image.getInstance(sigBytes2);
                img2.scaleAbsolute(120, 50);
                document.add(img2);
            }
            document.add(new Paragraph("Name: " + ag.getTenantName(), normal));
            document.add(new Paragraph("Mobile: " + ag.getTenantMobile() + "\n\n", normal));

            // WITNESSES
            document.add(new Paragraph("Witnesses:\n", bold));
            document.add(new Paragraph("1. ________________________\n", normal));
            document.add(new Paragraph("2. ________________________\n", normal));

            document.close();
            return out.toByteArray();

        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    private void addTerm(Document doc, String title, String text, Font font) throws Exception {
        Paragraph p = new Paragraph(title + ": ", new Font(Font.TIMES_ROMAN, 12, Font.BOLD));
        p.add(new Chunk(text, font));
        p.setSpacingAfter(10);
        p.setAlignment(Element.ALIGN_JUSTIFIED);
        doc.add(p);
    }
}
