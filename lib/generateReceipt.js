import jsPDF from "jspdf";

export async function generateReceipt(payment, project, creator) {
  const doc = new jsPDF();

  // Load logo
  const logo = await fetch("/logo.png")
    .then(res => res.blob())
    .then(blob => new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    }));

  // Header
  doc.addImage(logo, "PNG", 15, 10, 25, 25);
  doc.setFontSize(18);
  doc.text("Fundora", 45, 25);
  doc.setFontSize(10);
  doc.text("Fund ideas. Fuel innovation. Empower creators.", 45, 32);

  doc.line(15, 38, 195, 38);

  doc.setFontSize(16);
  doc.text("Payment Receipt", 15, 50);

  let y = 62;
  const row = (label, value) => {
    doc.text(`${label}:`, 15, y);
    doc.text(String(value || "-"), 60, y);
    y += 10;
  };

  row("Project", project?.title);
  row("Amount", `Rs${payment.amount}`);
  row("Status", payment.status);
  row("Payer Email", payment.payer_email);
  row("Creator", creator?.name);
  row("Creator Email", creator?.email);
  row("Payment ID", payment.id);
  row("Date", new Date(payment.created_at).toLocaleString());

  y += 10;
  doc.text("Thank you for supporting this project on Fundora.", 15, y);

  // ✅ RETURN BLOB (NOT save)
  return doc.output("blob");
}
