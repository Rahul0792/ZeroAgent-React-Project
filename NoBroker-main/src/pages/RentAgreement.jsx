import React, { useState, useRef } from "react";
import SignaturePad from "react-signature-canvas";

export default function RentAgreement() {
  const [tenantSignature, setTenantSignature] = useState(null);
  const [landlordSignature, setLandlordSignature] = useState(null);

  const [form, setForm] = useState({
    tenantName: "",
    tenantMobile: "",
    tenantEmail: "",
    tenantAge: "",
    tenantAadharNumber: "",
    tenantPanNumber: "",
    landlordName: "",
    landlordMobile: "",
    landlordEmail: "",
    landlordAadharNumber: "",
    propertyAddress: "",
    propertyType: "",
    agreementPeriod: "",
    startDate: "",
    endDate: "",
    monthlyRent: "",
    securityDeposit: "",
    city: "",
    state: "",
  });

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  const tenantRef = useRef();
  const landlordRef = useRef();

  const extractBase64 = (str) => {
    if (!str) return null;
    return str.split("base64,")[1];
  };

  const handleGenerate = async () => {
    try {
      const payload = {
        ...form,
        tenantAge: Number(form.tenantAge || 0),
        monthlyRent: Number(form.monthlyRent || 0),
        securityDeposit: Number(form.securityDeposit || 0),
        tenantSignatureBase64: tenantSignature,
        landlordSignatureBase64: landlordSignature,
      };

      const resp = await fetch(
        "http://172.20.10.5:8080/api/rent-agreement/create",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!resp.ok) {
        const err = await resp.text();
        alert("Error: " + err);
        return;
      }

      const data = await resp.json();

      if (!data.pdfBase64) {
        alert("No PDF returned");
        return;
      }

      const link = document.createElement("a");
      link.href = `data:application/pdf;base64,${data.pdfBase64}`;
      link.download = `rent_agreement_${data.id}.pdf`;
      link.click();

      alert("PDF downloaded successfully!");
    } catch (error) {
      console.log("PDF Error:", error);
      alert("PDF generation failed");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-gray-100">
      <h1 className="text-3xl font-bold text-center mb-6">Rent Agreement</h1>

      {/* FORM FIELDS */}
      {Object.keys(form).map((key) => (
        <div key={key} className="mb-3">
          <label className="font-semibold block mb-1">
            {key.replace(/([A-Z])/g, " $1")}
          </label>
          <input
            className="border border-gray-300 w-full rounded-lg px-3 py-2 bg-white"
            value={form[key]}
            onChange={(e) => handleChange(key, e.target.value)}
          />
        </div>
      ))}

      {/* SIGNATURE AREA */}
      <div className="mb-6">
        <label className="font-semibold mb-2 block">Tenant Signature</label>
        <SignaturePad
          ref={tenantRef}
          canvasProps={{
            className: "border w-full h-32 bg-white rounded-md",
          }}
          onEnd={() => {
            const base64 = tenantRef.current
              .getTrimmedCanvas()
              .toDataURL("image/png");
            setTenantSignature(extractBase64(base64));
          }}
        />
        <button
          onClick={() => {
            tenantRef.current.clear();
            setTenantSignature(null);
          }}
          className="mt-2 px-3 py-2 bg-gray-600 text-white rounded"
        >
          Clear
        </button>
      </div>

      <div className="mb-6">
        <label className="font-semibold mb-2 block">Landlord Signature</label>
        <SignaturePad
          ref={landlordRef}
          canvasProps={{
            className: "border w-full h-32 bg-white rounded-md",
          }}
          onEnd={() => {
            const base64 = landlordRef.current
              .getTrimmedCanvas()
              .toDataURL("image/png");
            setLandlordSignature(extractBase64(base64));
          }}
        />
        <button
          onClick={() => {
            landlordRef.current.clear();
            setLandlordSignature(null);
          }}
          className="mt-2 px-3 py-2 bg-gray-600 text-white rounded"
        >
          Clear
        </button>
      </div>

      <button
        onClick={handleGenerate}
        className="w-full bg-red-600 text-white py-3 rounded-lg font-bold"
      >
        Generate PDF
      </button>
    </div>
  );
}
