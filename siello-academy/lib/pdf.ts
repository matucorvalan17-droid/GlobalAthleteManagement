'use client';

export async function exportToPDF(elementId: string, filename: string): Promise<void> {
  const html2canvas = (await import('html2canvas')).default;
  const jsPDF = (await import('jspdf')).default;

  const element = document.getElementById(elementId);
  if (!element) throw new Error('Element not found');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#080808',
    logging: false,
    width: element.scrollWidth,
    height: element.scrollHeight,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
  } as any);

  const imgData = canvas.toDataURL('image/jpeg', 0.95);
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'px',
    format: [canvas.width / 2, canvas.height / 2],
    compress: true,
  });

  pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width / 2, canvas.height / 2);
  pdf.save(filename);
}
