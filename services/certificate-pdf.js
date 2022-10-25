
const PDFDocument = require('pdfkit');
const debug  = require('debug')('ultraresult:certificate-pdf');

const dateY = 550


// othter fonts: Courier, ...
function createPdf(data, dataCallback, endCallback) {
  const doc = new PDFDocument({bufferPages: true, font: 'Helvetica', size: 'A4'});

  doc.on('data', dataCallback);
  doc.on('end', endCallback);

  doc.fontSize(72).text('URKUNDE', 100, 50, { align: 'center'});
  doc.image(data.cert_logo, {
    cover: [395, 395],
    align: 'center',
  });

  // data.cert_year  
  doc.fontSize(28).text(data.cert_date, 100, dateY, { align: 'center'})

  doc.fontSize(32).text(data.name, 100, dateY + 60, {align: 'center'})
  doc.fontSize(8).moveDown();
  doc.fontSize(32).text(data.time, {align: 'center'});
  doc.fontSize(8).moveDown();
  doc.fontSize(32).text(data.rank, {align: 'center'});

  doc.end();
  debug("create PDF end");
}

module.exports = { createPdf };
