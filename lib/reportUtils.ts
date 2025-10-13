
import { ReportData } from '../types';

// These functions assume the jsPDF and xlsx libraries are loaded from the CDN in index.html
declare const jsPDF: any;
declare const XLSX: any;

const SCHOOL_NAME = "Advent Reformed Institute";

export const exportToExcel = (data: ReportData[], filename: string) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Payments");
    XLSX.writeFile(workbook, `${filename}.xlsx`);
};

export const exportToPdf = (data: ReportData[], title: string, filename: string) => {
    const doc = new jsPDF.default();
    
    doc.setFontSize(18);
    doc.text(SCHOOL_NAME, 14, 22);
    doc.setFontSize(12);
    doc.text(title, 14, 30);

    const tableColumn = ["Student Name", "Station", "Date", "Status", "Amount"];
    const tableRows: any[] = [];

    data.forEach(item => {
        const rowData = [
            item.studentName,
            item.stationName,
            item.date,
            item.status,
            item.amount.toFixed(2),
        ];
        tableRows.push(rowData);
    });

    doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 40,
        theme: 'grid',
        headStyles: { fillColor: [38, 128, 235] },
    });
    
    doc.save(`${filename}.pdf`);
};
