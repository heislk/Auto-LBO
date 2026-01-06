export interface LBOAssumptions {
    
    revenue: number;
    revenueGrowth: number;
    ebitdaMargin: number;
    taxRate: number;

    
    entryMultiple: number;
    exitMultiple: number;
    transactionFees: number; 
    minCash: number; 

    
    seniorDebtMultiple: number;
    juniorDebtMultiple: number;

    
    seniorInterest: number; 
    juniorInterest: number; 
    seniorAmort: number; 

    
    mipPercent: number; 
}

export interface YearData {
    year: number;
    
    revenue: number;
    ebitda: number;
    depreciation: number;
    ebit: number;
    interestExpense: number;
    preTaxIncome: number;
    taxes: number;
    netIncome: number;

    
    plusDepreciation: number;
    lessCapex: number;
    lessNWC: number;
    mandatoryAmort: number;
    cashAvailableForSweep: number;
    optionalPrepay: number;
    totalDebtPaydown: number;

    
    cash: number;
    revolver: number;
    seniorDebt: number;
    juniorDebt: number;
    totalDebt: number;

    
    exitEV?: number;
    exitEquityValue?: number; 
    managementProceeds?: number;
    sponsorProceeds?: number; 
    moic?: number; 
    irr?: number; 
}

export interface SourcesAndUses {
    uses: {
        purchasePrice: number;
        fees: number;
        refinance: number;
        minCash: number;
        totalUses: number;
    };
    sources: {
        seniorDebt: number;
        juniorDebt: number;
        sponsorEquity: number;
        totalSources: number;
    };
}

export interface LBOOutputs {
    sourcesAndUses: SourcesAndUses;
    projections: YearData[];
    valuation: {
        entryMultiple: number;
        exitMultiple: number;
        entryEV: number;
        exitEV: number;
        exitEquityValue: number; 
        managementProceeds: number;
        sponsorProceeds: number; 
    };
    returns: {
        irr: number;
        moic: number;
    };
}

export function calculateLBOProfessional(assumptions: LBOAssumptions): LBOOutputs {
    const {
        revenue,
        revenueGrowth,
        ebitdaMargin,
        taxRate,
        entryMultiple,
        exitMultiple,
        transactionFees,
        minCash,
        seniorDebtMultiple,
        juniorDebtMultiple,
        seniorInterest,
        juniorInterest,
        seniorAmort,
        mipPercent,
    } = assumptions;

    
    const initialEbitda = revenue * (ebitdaMargin / 100);
    const purchasePrice = initialEbitda * entryMultiple;
    const fees = purchasePrice * (transactionFees / 100);
    const totalUses = purchasePrice + fees + minCash;

    const initialSeniorDebt = initialEbitda * seniorDebtMultiple;
    const initialJuniorDebt = initialEbitda * juniorDebtMultiple;
    const totalDebt = initialSeniorDebt + initialJuniorDebt;

    const sponsorEquity = Math.max(0, totalUses - totalDebt);

    const sourcesAndUses: SourcesAndUses = {
        uses: { purchasePrice, fees, refinance: 0, minCash, totalUses },
        sources: { seniorDebt: initialSeniorDebt, juniorDebt: initialJuniorDebt, sponsorEquity, totalSources: totalUses }
    };

    
    let projections: YearData[] = [];
    const ITERATIONS = 10;

    for (let iter = 0; iter < ITERATIONS; iter++) {
        projections = [];

        
        projections.push({
            year: 0,
            revenue: revenue,
            ebitda: initialEbitda,
            depreciation: 0,
            ebit: initialEbitda,
            interestExpense: 0,
            preTaxIncome: 0,
            taxes: 0,
            netIncome: 0,
            plusDepreciation: 0,
            lessCapex: 0,
            lessNWC: 0,
            mandatoryAmort: 0,
            cashAvailableForSweep: 0,
            optionalPrepay: 0,
            totalDebtPaydown: 0,
            cash: minCash,
            revolver: 0,
            seniorDebt: initialSeniorDebt,
            juniorDebt: initialJuniorDebt,
            totalDebt: initialSeniorDebt + initialJuniorDebt,
            
            exitEV: purchasePrice,
            exitEquityValue: sponsorEquity,
            managementProceeds: 0,
            sponsorProceeds: sponsorEquity,
            moic: 1.0,
            irr: 0,
        });

        let currentSeniorDebt = initialSeniorDebt;
        let currentJuniorDebt = initialJuniorDebt;
        let currentRevolver = 0;

        
        for (let year = 1; year <= 5; year++) {
            const prev = projections[year - 1];

            
            const projRevenue = prev.revenue * (1 + revenueGrowth / 100);
            const ebitda = projRevenue * (ebitdaMargin / 100);
            const depreciation = projRevenue * 0.02;
            const capex = projRevenue * 0.02;
            const nwcChange = projRevenue * 0.01;
            const ebit = ebitda - depreciation;

            
            const boSenior = prev.seniorDebt;
            const boJunior = prev.juniorDebt;
            const boRevolver = prev.revolver;

            const revolverInterestRate = seniorInterest + 1.0;

            const snrInt = boSenior * (seniorInterest / 100);
            const jnrInt = boJunior * (juniorInterest / 100);
            const revInt = boRevolver * (revolverInterestRate / 100);

            const interestExpense = snrInt + jnrInt + revInt;

            
            const preTaxIncome = ebit - interestExpense;
            const taxes = Math.max(0, preTaxIncome * (taxRate / 100));
            const netIncome = preTaxIncome - taxes;

            
            const cfo = netIncome + depreciation - nwcChange;
            const fcf = cfo - capex;

            
            const mandAmortAmount = initialSeniorDebt * (seniorAmort / 100);
            let actMandAmort = Math.min(mandAmortAmount, boSenior);

            let cashForSweep = fcf - actMandAmort;

            let drawRevolver = 0;
            let payRevolver = 0;
            let optPrepaySenior = 0;

            if (cashForSweep < 0) {
                drawRevolver = -cashForSweep;
                cashForSweep = 0;
            } else {
                payRevolver = Math.min(cashForSweep, boRevolver);
                cashForSweep -= payRevolver;

                optPrepaySenior = Math.min(Math.max(0, boSenior - actMandAmort), cashForSweep);
                cashForSweep -= optPrepaySenior;
            }

            
            currentRevolver = boRevolver + drawRevolver - payRevolver;
            currentSeniorDebt = boSenior - actMandAmort - optPrepaySenior;
            currentJuniorDebt = boJunior;

            const endTotalDebt = currentSeniorDebt + currentJuniorDebt + currentRevolver;

            
            const impliedExitEV = ebitda * exitMultiple; 
            const impliedExitEquity = Math.max(0, impliedExitEV - (endTotalDebt - minCash));

            const mgmtProceeds = impliedExitEquity * (mipPercent / 100);
            const sponsorProceeds = Math.max(0, impliedExitEquity - mgmtProceeds);

            let impliedMoic = 0;
            let impliedIrr = 0;

            if (sponsorEquity > 0) {
                impliedMoic = sponsorProceeds / sponsorEquity;
                if (sponsorProceeds > 0) {
                    impliedIrr = (Math.pow(impliedMoic, 1 / year) - 1) * 100;
                }
            }

            projections.push({
                year,
                revenue: projRevenue,
                ebitda,
                depreciation,
                ebit,
                interestExpense,
                preTaxIncome,
                taxes,
                netIncome,
                plusDepreciation: depreciation,
                lessCapex: capex,
                lessNWC: nwcChange,
                mandatoryAmort: actMandAmort,
                cashAvailableForSweep: fcf,
                optionalPrepay: optPrepaySenior,
                totalDebtPaydown: (actMandAmort + optPrepaySenior + payRevolver) - drawRevolver,
                cash: minCash,
                revolver: currentRevolver,
                seniorDebt: currentSeniorDebt,
                juniorDebt: currentJuniorDebt,
                totalDebt: endTotalDebt,

                
                exitEV: impliedExitEV,
                exitEquityValue: impliedExitEquity,
                managementProceeds: mgmtProceeds,
                sponsorProceeds: sponsorProceeds,
                moic: impliedMoic,
                irr: impliedIrr
            });
        }
    }

    
    const finalYear = projections[5];

    return {
        sourcesAndUses,
        projections,
        valuation: {
            entryMultiple,
            exitMultiple,
            entryEV: purchasePrice,
            exitEV: finalYear.exitEV || 0,
            exitEquityValue: finalYear.exitEquityValue || 0,
            managementProceeds: finalYear.managementProceeds || 0,
            sponsorProceeds: finalYear.sponsorProceeds || 0
        },
        returns: {
            irr: finalYear.irr || 0,
            moic: finalYear.moic || 0
        }
    };
}

export const calculateLBOV2 = calculateLBOProfessional;
