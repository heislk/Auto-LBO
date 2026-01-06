import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { LBOAssumptions, LBOOutputs, calculateLBOProfessional } from "./lbo";

const R = {
    ASSUMP_GROWTH: 8,
    ASSUMP_MARGIN: 9,
    ASSUMP_TAX: 10,

    IS_REVENUE: 16,
    IS_GROWTH: 17,
    IS_EBITDA: 19,
    IS_MARGIN: 20,
    IS_DEPR: 21,
    IS_EBIT: 22,
    IS_INTEREST: 23,
    IS_EBT: 24,
    IS_TAXES: 25,
    IS_NET_INCOME: 26,

    CF_NET_INCOME: 31,
    CF_PLUS_DEPR: 32,
    CF_LESS_CAPEX: 33,
    CF_LESS_NWC: 34,
    CF_FCF: 35,
    CF_MAND_AMORT: 37,
    CF_AVAIL_SWEEP: 38,
    CF_REV_DRAW: 39,

    DEBT_REV_BOP: 47,
    DEBT_REV_DRAW: 48,
    DEBT_REV_EOP: 49,

    DEBT_SNR_BOP: 52,
    DEBT_SNR_AMORT: 53,
    DEBT_SNR_PREPAY: 54,
    DEBT_SNR_EOP: 55,

    DEBT_JNR_BOP: 58,
    DEBT_JNR_EOP: 59,

    DEBT_TOTAL: 61,
    DEBT_CASH: 62,
    DEBT_NET: 63,

    CREDIT_LEV: 67,
    CREDIT_COV: 68,
};

export async function generateExcelModel(
    ticker: string,
    assumptions: LBOAssumptions,
    outputs: LBOOutputs
) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Auto-LBO System";
    workbook.created = new Date();

    const fontStd = { name: "Arial", size: 9, color: { argb: "FF000000" } };
    const fontBold = { name: "Arial", size: 9, bold: true, color: { argb: "FF000000" } };
    const fontInput = { name: "Arial", size: 9, color: { argb: "FF0000FF" } };
    const fontTitle = { name: "Arial", size: 14, bold: true, color: { argb: "FF000000" } };

    const borderBottom = { bottom: { style: "thin" as const, color: { argb: "FF999999" } } };
    const borderAll = {
        top: { style: "thin" as const, color: { argb: "FFCCCCCC" } },
        left: { style: "thin" as const, color: { argb: "FFCCCCCC" } },
        bottom: { style: "thin" as const, color: { argb: "FFCCCCCC" } },
        right: { style: "thin" as const, color: { argb: "FFCCCCCC" } }
    };

    const alignRight = { horizontal: "right" as const };
    const alignCenter = { horizontal: "center" as const };

    const numFmtCurrency = '_(* #,##0.0_);_(* (#,##0.0);_(* "-"??_);_(@_)';
    const numFmtMultiple = '0.00x';
    const numFmtPercent = '0.0%';

    const wsSummary = workbook.addWorksheet("Executive Summary", {
        pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true }
    });
    wsSummary.views = [{ showGridLines: false }];

    wsSummary.getCell("B2").value = `PROJECT ${ticker} - LBO SUMMARY`;
    wsSummary.getCell("B2").font = fontTitle;

    wsSummary.getCell("B4").value = "Returns Profile (5-Year Exit)";
    wsSummary.getCell("B4").font = { name: "Arial", size: 10, bold: true };
    wsSummary.getCell("B4").border = borderBottom;

    wsSummary.getCell("B6").value = "Net Sponsor IRR";
    wsSummary.getCell("C6").value = outputs.returns.irr / 100;
    wsSummary.getCell("C6").numFmt = numFmtPercent;
    wsSummary.getCell("C6").font = fontBold;

    wsSummary.getCell("B7").value = "Net Sponsor MOIC";
    wsSummary.getCell("C7").value = outputs.returns.moic;
    wsSummary.getCell("C7").numFmt = numFmtMultiple;
    wsSummary.getCell("C7").font = fontBold;

    wsSummary.getCell("B10").value = "Sensitivity Analysis (Net IRR)";
    wsSummary.getCell("B10").font = { name: "Arial", size: 10, bold: true };
    wsSummary.getCell("B10").border = borderBottom;

    wsSummary.getCell("C12").value = "Exit Multiple ->";
    wsSummary.getCell("B13").value = "Growth %";

    const baseExit = assumptions.exitMultiple;
    const baseGrowth = assumptions.revenueGrowth;
    const steps = [-1, 0, 1];

    steps.forEach((step, i) => {
        wsSummary.getCell(12, 3 + i).value = `${(baseExit + step).toFixed(1)}x`;
        wsSummary.getCell(12, 3 + i).font = fontBold;
        wsSummary.getCell(12, 3 + i).alignment = alignCenter;
    });

    steps.forEach((gStep, rowIdx) => {
        const gVal = baseGrowth + gStep * 2;
        const r = 13 + rowIdx;
        wsSummary.getCell(r, 2).value = `${gVal.toFixed(1)}%`;
        wsSummary.getCell(r, 2).font = fontBold;

        steps.forEach((mStep, colIdx) => {
            const scenario = calculateLBOProfessional({
                ...assumptions,
                revenueGrowth: gVal,
                exitMultiple: baseExit + mStep
            });
            const cell = wsSummary.getCell(r, 3 + colIdx);
            cell.value = scenario.returns.irr / 100;
            cell.numFmt = numFmtPercent;
            cell.border = borderAll;

            if (scenario.returns.irr > 25) {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDFF0D8' } };
            } else if (scenario.returns.irr < 15) {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2DEDE' } };
            }
        });
    });

    wsSummary.getColumn("B").width = 25;
    wsSummary.getColumn("C").width = 15;
    wsSummary.getColumn("D").width = 15;
    wsSummary.getColumn("E").width = 15;


    const wsModel = workbook.addWorksheet("Model", {
        pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 }
    });
    wsModel.views = [{ showGridLines: false, state: 'frozen', xSplit: 0, ySplit: 5 }];

    const colYear = ['C', 'D', 'E', 'F', 'G', 'H'];
    const cell = (row: number, yr: number) => `${colYear[yr]}${row}`;
    const cellPrev = (row: number, yr: number) => yr === 0 ? null : `${colYear[yr - 1]}${row}`;

    wsModel.getCell("B2").value = `Detailed Operating Model`;
    wsModel.getCell("B2").font = fontTitle;

    const headerRow = wsModel.getRow(5);
    for (let i = 0; i <= 5; i++) {
        const c = wsModel.getCell(5, 3 + i);
        c.value = i === 0 ? "Entry" : `Year ${i}`;
        c.font = fontBold;
        c.border = { bottom: { style: 'medium' } };
        c.alignment = alignRight;
        wsModel.getColumn(3 + i).width = 14;
    }
    wsModel.getColumn("B").width = 35;

    const setRow = (row: number, label: string, fn: (i: number) => any, fmt: string, bold = false, indent = 0) => {
        const labelCell = wsModel.getCell(`B${row}`);
        labelCell.value = "  ".repeat(indent) + label;
        labelCell.font = bold ? fontBold : fontStd;

        for (let i = 0; i <= 5; i++) {
            const c = wsModel.getCell(row, 3 + i);
            const res = fn(i);
            if (typeof res === 'object' && res.formula) {
                c.value = res;
            } else {
                c.value = res;
            }
            c.numFmt = fmt;
            c.font = bold ? fontBold : fontStd;
            if (bold) c.border = { top: { style: 'thin' } };
        }
    };

    wsModel.getCell(`B${R.ASSUMP_GROWTH - 1}`).value = "I. General Assumptions";
    wsModel.getCell(`B${R.ASSUMP_GROWTH - 1}`).font = { ...fontBold, size: 10 };

    setRow(R.ASSUMP_GROWTH, "Revenue Growth %", (i) => i > 0 ? (outputs.projections[i].revenue / outputs.projections[i - 1].revenue - 1) : "-", numFmtPercent);
    wsModel.getRow(R.ASSUMP_GROWTH).font = fontInput;

    setRow(R.ASSUMP_MARGIN, "EBITDA Margin %", (i) => outputs.projections[i].ebitda / outputs.projections[i].revenue, numFmtPercent);
    wsModel.getRow(R.ASSUMP_MARGIN).font = fontInput;

    setRow(R.ASSUMP_TAX, "Tax Rate %", () => assumptions.taxRate / 100, numFmtPercent);
    wsModel.getRow(R.ASSUMP_TAX).font = fontInput;


    wsModel.getCell(`B${R.IS_REVENUE - 1}`).value = "II. Income Statement";
    wsModel.getCell(`B${R.IS_REVENUE - 1}`).font = { ...fontBold, size: 10 };

    setRow(R.IS_REVENUE, "Total Revenue", (i) => i === 0 ? outputs.projections[0].revenue : { formula: `${cellPrev(R.IS_REVENUE, i)}*(1+${cell(R.ASSUMP_GROWTH, i)})`, result: outputs.projections[i].revenue }, numFmtCurrency, true);

    setRow(R.IS_EBITDA, "EBITDA", (i) => ({ formula: `${cell(R.IS_REVENUE, i)}*${cell(R.ASSUMP_MARGIN, i)}`, result: outputs.projections[i].ebitda }), numFmtCurrency, true);

    setRow(R.IS_DEPR, "Less: D&A", (i) => ({ formula: `${cell(R.IS_REVENUE, i)}*0.02`, result: outputs.projections[i].depreciation }), numFmtCurrency);

    setRow(R.IS_EBIT, "EBIT", (i) => ({ formula: `${cell(R.IS_EBITDA, i)}-${cell(R.IS_DEPR, i)}`, result: outputs.projections[i].ebit }), numFmtCurrency, true);

    const rSnr = assumptions.seniorInterest / 100;
    const rJnr = assumptions.juniorInterest / 100;
    setRow(R.IS_INTEREST, "Less: Interest", (i) => ({
        formula: `(${cellPrev(R.DEBT_SNR_EOP, i)}*${rSnr}) + (${cellPrev(R.DEBT_JNR_EOP, i)}*${rJnr})`,
        result: outputs.projections[i].interestExpense
    }), numFmtCurrency);

    setRow(R.IS_EBT, "Pre-Tax Income", (i) => ({ formula: `${cell(R.IS_EBIT, i)}-${cell(R.IS_INTEREST, i)}`, result: outputs.projections[i].preTaxIncome }), numFmtCurrency);

    setRow(R.IS_TAXES, "Less: Taxes", (i) => ({ formula: `MAX(0,${cell(R.IS_EBT, i)}*${cell(R.ASSUMP_TAX, i)})`, result: outputs.projections[i].taxes }), numFmtCurrency);

    setRow(R.IS_NET_INCOME, "Net Income", (i) => ({ formula: `${cell(R.IS_EBT, i)}-${cell(R.IS_TAXES, i)}`, result: outputs.projections[i].netIncome }), numFmtCurrency, true);


    wsModel.getCell(`B${R.CF_NET_INCOME - 1}`).value = "III. Cash Flow Waterfall";
    wsModel.getCell(`B${R.CF_NET_INCOME - 1}`).font = { ...fontBold, size: 10 };

    setRow(R.CF_NET_INCOME, "Net Income", (i) => ({ formula: cell(R.IS_NET_INCOME, i) }), numFmtCurrency, true);
    setRow(R.CF_PLUS_DEPR, "Plus: D&A", (i) => ({ formula: cell(R.IS_DEPR, i) }), numFmtCurrency);
    setRow(R.CF_LESS_CAPEX, "Less: Capex", (i) => ({ formula: `-${cell(R.IS_REVENUE, i)}*0.02` }), numFmtCurrency);
    setRow(R.CF_LESS_NWC, "Less: NWC", (i) => ({ formula: `-${cell(R.IS_REVENUE, i)}*0.01` }), numFmtCurrency);

    setRow(R.CF_FCF, "Free Cash Flow", (i) => ({ formula: `SUM(${cell(R.CF_NET_INCOME, i)}:${cell(R.CF_LESS_NWC, i)})` }), numFmtCurrency, true);

    wsModel.getCell(`B${R.DEBT_REV_BOP - 1}`).value = "IV. Debt Schedule";
    wsModel.getCell(`B${R.DEBT_REV_BOP - 1}`).font = { ...fontBold, size: 10 };

    setRow(R.DEBT_SNR_BOP, "Senior BoP", (i) => i === 0 ? "-" : { formula: cellPrev(R.DEBT_SNR_EOP, i) }, numFmtCurrency);
    setRow(R.DEBT_SNR_EOP, "Senior EoP", (i) => i === 0 ? outputs.projections[0].seniorDebt : { formula: `MAX(0, ${cell(R.DEBT_SNR_BOP, i)} - MAX(0, ${cell(R.CF_FCF, i)}))` }, numFmtCurrency, true);

    setRow(R.DEBT_JNR_BOP, "Junior BoP", (i) => i === 0 ? "-" : { formula: cellPrev(R.DEBT_JNR_EOP, i) }, numFmtCurrency);
    setRow(R.DEBT_JNR_EOP, "Junior EoP", (i) => i === 0 ? outputs.projections[0].juniorDebt : { formula: cell(R.DEBT_JNR_BOP, i) }, numFmtCurrency, true);

    setRow(R.DEBT_TOTAL, "Total Debt", (i) => ({ formula: `${cell(R.DEBT_SNR_EOP, i)}+${cell(R.DEBT_JNR_EOP, i)}` }), numFmtCurrency, true);
    setRow(R.DEBT_CASH, "Cash Balance", (i) => i === 0 ? outputs.projections[0].cash : 5.0, numFmtCurrency);


    wsModel.getCell(`B${R.CREDIT_LEV - 1}`).value = "V. Credit Statistics";
    wsModel.getCell(`B${R.CREDIT_LEV - 1}`).font = { ...fontBold, size: 10 };

    setRow(R.CREDIT_LEV, "Net Leverage", (i) => ({
        formula: `MAX(0, (${cell(R.DEBT_TOTAL, i)} - ${cell(R.DEBT_CASH, i)}) / ${cell(R.IS_EBITDA, i)})`,
        result: 0
    }), numFmtMultiple, true);

    setRow(R.CREDIT_COV, "Interest Coverage", (i) => ({
        formula: `IF(${cell(R.IS_INTEREST, i)}=0, 0, ${cell(R.IS_EBITDA, i)} / ${cell(R.IS_INTEREST, i)})`,
        result: 0
    }), numFmtMultiple);

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(blob, `LBO_${ticker}_model.xlsx`);
}
