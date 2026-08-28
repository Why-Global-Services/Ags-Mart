const PDFDocument = require("pdfkit");

async function generateOrderReportPDF(data) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => {
      const result = Buffer.concat(chunks);
      resolve(result); // ⬅️ Return PDF buffer
    });
    doc.on("error", (err) => reject(err));

    // Build your PDF
    doc.fontSize(20).text("Order Report", { align: "center" });
    doc.moveDown();

    const { stats, time, graphData } = data;

    doc.fontSize(14).text(`Time Range: ${time}`);
    doc.moveDown();

    doc.text(`Total Orders: ${stats.totalOrders}`);
    doc.text(`Total Sales: ${stats.totalSales}`);
    doc.text(`Average Order Value: ${stats.averageOrderValue.toFixed(2)}`);
    doc.text(`Cancelled: ${stats.orderCancelled}`);
    doc.text(`Delivered: ${stats.orderDelivered}`);
    doc.text(`Pending: ${stats.orderPending}`);

    doc.moveDown().text("Sales Overview:", { underline: true });
    graphData.forEach((entry) => {
      doc.text(
        `${entry.month} ${entry.year} - Sales: ${entry.Sales}, Orders: ${entry.Orders}, Returns: ${entry.Returns}`
      );
    });

    doc.end(); // Finalize
  });
}

module.exports = generateOrderReportPDF;
