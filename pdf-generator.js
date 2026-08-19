function generateQuoteNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `Q-${year}${month}-${random}`;
}

function formatCurrency(amount) {
    return '$' + amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

function generatePDFQuote(formData, prices, pricing) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    
    const accentColor = [31, 41, 55];    // #1F2937
    const darkGray = [26, 26, 26];       // #1A1A1A
    const mediumGray = [90, 90, 90];     // #5A5A5A

    let y = margin;

    function checkPageBreak(neededSpace) {
        if (y + neededSpace > pageHeight - margin) {
            doc.addPage();
            y = margin;
        }
    }

    // Header
    let leftY = y;
    let rightY = y;

    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...darkGray);
    doc.text('Your Company Name', margin, leftY);
    leftY += 5;

    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(...mediumGray);
    doc.text('123 Main St', margin, leftY);
    leftY += 4;
    doc.text('Anytown, ST 00000', margin, leftY);
    leftY += 4;
    doc.text('Phone: (555) 123-4567', margin, leftY);
    leftY += 4;
    doc.text('Email: contact@yourcompany.com', margin, leftY);
    leftY += 4;

    const logoX = pageWidth - margin - 40;
    doc.setDrawColor(...accentColor);
    doc.setLineWidth(0.5);
    doc.rect(logoX, rightY, 40, 20);

    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...accentColor);
    doc.text('LOGO', logoX + 20, rightY + 11, { align: 'center' });
    rightY += 20 + 5;

    const quoteNumber = generateQuoteNumber();
    const quoteDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });

    doc.setFontSize(9);
    doc.setTextColor(...darkGray);

    const labelX = pageWidth - margin - 60;
    const valueX = pageWidth - margin;

    doc.setFont(undefined, 'bold');
    doc.text('Quote #', labelX, rightY);
    doc.setFont(undefined, 'normal');
    doc.text(quoteNumber, valueX, rightY, { align: 'right' });
    rightY += 5;

    doc.setFont(undefined, 'bold');
    doc.text('Quote date', labelX, rightY);
    doc.setFont(undefined, 'normal');
    doc.text(quoteDate, valueX, rightY, { align: 'right' });
    rightY += 5;

    y = Math.max(leftY, rightY) + 6;

    // Customer info and Meter Run Specifications
    let toY = y;
    let specY = y + 4;
    const specColX1 = margin + contentWidth / 2;
    const specColX2 = specColX1 + (pageWidth - margin - specColX1) / 2;

    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...darkGray);
    doc.text('To', margin, toY);
    toY += 6;

    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.text(formData.customerName || 'Customer Name', margin, toY);
    toY += 4;
    doc.text(`Attn: ${formData.contactName || 'Contact Name'}`, margin, toY);
    toY += 4;
    doc.text(formData.contactEmail || 'contact@email.com', margin, toY);
    toY += 4;
    doc.text(formData.contactPhone || 'Phone Number', margin, toY);
    toY += 4;
    if (formData.jobLocation) {
        doc.text(`Job Site: ${formData.jobLocation}`, margin, toY);
        toY += 4;
    }

    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...accentColor);
    doc.text('METER RUN SPECIFICATIONS', specColX1, specY);
    specY += 6;

    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(...darkGray);

    const VENDOR_NAMES = { canalta: 'Canalta', daniels: 'Daniels', tmco: 'TMCO', rj: 'RJ' };
    const ORIFICE_NAMES = { senior: 'Senior', simplex: 'Simplex' };
    const CONFIG_NAMES = { '2-piece': '2-Piece', '3-piece': '3-Piece' };

    const vendorName = VENDOR_NAMES[formData.vendorId] || formData.vendorId;
    const orificeName = ORIFICE_NAMES[formData.orificeType] || formData.orificeType;
    const configName = CONFIG_NAMES[formData.configuration] || formData.configuration;

    doc.text(`Vendor: ${vendorName}`, specColX1, specY);
    doc.text(`Schedule: ${formData.schedule}`, specColX2, specY);
    specY += 4;
    doc.text(`Size: ${formData.size}"`, specColX1, specY);
    doc.text(`Orifice Type: ${orificeName}`, specColX2, specY);
    specY += 4;
    doc.text(`Configuration: ${configName}`, specColX1, specY);
    if (formData.flangeRating) {
        doc.text(`Flange Rating: ${formData.flangeRating}#`, specColX2, specY);
    }
    specY += 4;
    doc.text(`Quantity: ${formData.quantity}`, specColX1, specY);
    specY += 4;

    y = Math.max(toY, specY) + 6;

    // Itemized components table
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...accentColor);
    doc.text('ITEMIZED COMPONENTS', margin, y);
    y += 8;

    const col1X = margin + 2;        // Description
    const col2X = pageWidth - 85;    // Unit Price
    const col3X = pageWidth - 50;    // Qty
    const col4X = pageWidth - margin - 2; // Amount

    function drawTableHeaderRow() {
        doc.setFillColor(...accentColor);
        doc.rect(margin, y, contentWidth, 7, 'F');

        doc.setFontSize(8);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(255, 255, 255); 

        doc.text('Description', col1X, y + 5);
        doc.text('Unit Price', col2X, y + 5, { align: 'right' });
        doc.text('Qty', col3X, y + 5, { align: 'right' });
        doc.text('Amount', col4X, y + 5, { align: 'right' });

        y += 7;
    }

    drawTableHeaderRow();

    const schedule = formData.schedule;
    const size = formData.size;
    const vendor = pricing.vendors[formData.vendorId];
    const scheduleData = vendor?.schedules?.[schedule];

    doc.setTextColor(...darkGray);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(8);

    let rowBg = true;
    const lineHeight = 4.5;

    function addRow(description, unitPrice, qty, amount) {
        if (y + lineHeight > pageHeight - margin) {
            doc.addPage();
            y = margin;
            rowBg = true;
            drawTableHeaderRow();
            doc.setTextColor(...darkGray);
            doc.setFont(undefined, 'normal');
            doc.setFontSize(8);
        }

        if (rowBg) {
            doc.setFillColor(248, 249, 250); // #f8f9fa
            doc.rect(margin, y, contentWidth, lineHeight, 'F');
        }
        rowBg = !rowBg;

        doc.text(description, col1X, y + 3.2);
        doc.text(formatCurrency(unitPrice), col2X, y + 3.2, { align: 'right' });
        doc.text(String(qty), col3X, y + 3.2, { align: 'right' });
        doc.text(formatCurrency(amount), col4X, y + 3.2, { align: 'right' });

        y += lineHeight;
    }

    // Orifice fitting
    const orificePrice = scheduleData?.orifice_fittings?.[formData.orificeType]?.[size] || 0;
    addRow(`${orificeName} Orifice Fitting (${size}")`, orificePrice, 1, orificePrice);

    // Flow conditioner
    if (formData.configuration === '2-piece' && formData.pinConditionerBrand && formData.pinConditionerType) {
        const condPrice = pricing.flow_conditioners?.[schedule]?.pin_type?.[formData.pinConditionerType]?.[formData.pinConditionerBrand]?.[size] || 0;
        addRow(`Pin-Type Flow Conditioner (${formData.pinConditionerType}, ${formData.pinConditionerBrand})`, condPrice, 1, condPrice);
    } else if (formData.configuration === '3-piece' && formData.flangeConditionerBrand) {
        const condPrice = pricing.flow_conditioners?.[schedule]?.flange_type?.[formData.flangeConditionerBrand]?.[size] || 0;
        addRow(`Flange-Type Flow Conditioner (${formData.flangeConditionerBrand})`, condPrice, 1, condPrice);
    }

    // Flanges
    if (formData.flangeBrand && formData.flangeRating && formData.flangeQuantity > 0) {
        const flangePrice = pricing.flanges?.[schedule]?.[formData.flangeBrand]?.[formData.flangeRating]?.[size] || 0;
        addRow(`Flange ${formData.flangeRating}# (${formData.flangeBrand})`, flangePrice, formData.flangeQuantity, flangePrice * formData.flangeQuantity);
    }

    // Pipe
    if (formData.pipeLength > 0) {
        const pipePrice = scheduleData?.components?.pipe_per_foot?.[size] || 0;
        addRow(`Pipe (${size}")`, pipePrice, formData.pipeLength, pipePrice * formData.pipeLength);
    }

    // TOLs
    const tolsPricing = scheduleData?.components?.tols || {};
    if (formData.tolsHalfInch > 0) {
        addRow('1/2" TOL', tolsPricing.half_inch || 0, formData.tolsHalfInch, (tolsPricing.half_inch || 0) * formData.tolsHalfInch);
    }
    if (formData.tolsThreeQuarterInch > 0) {
        addRow('3/4" TOL', tolsPricing.three_quarter || 0, formData.tolsThreeQuarterInch, (tolsPricing.three_quarter || 0) * formData.tolsThreeQuarterInch);
    }
    if (formData.tolsOneInch > 0) {
        addRow('1" TOL', tolsPricing.one_inch || 0, formData.tolsOneInch, (tolsPricing.one_inch || 0) * formData.tolsOneInch);
    }

    // Companion flange
    if (formData.companionFlangeQuantity > 0) {
        const companionPrice = scheduleData?.components?.companion_flange_600?.[size] || 0;
        addRow('Companion Flange 600#', companionPrice, formData.companionFlangeQuantity, companionPrice * formData.companionFlangeQuantity);
    }

    // Studs / Hex / Gaskets
    if (formData.studsQuantity > 0) {
        const studsPrice = scheduleData?.components?.studs?.[size] || 0;
        addRow('Studs', studsPrice, formData.studsQuantity, studsPrice * formData.studsQuantity);
    }
    if (formData.hexQuantity > 0) {
        const hexPrice = scheduleData?.components?.hex?.[size] || 0;
        addRow('Hex', hexPrice, formData.hexQuantity, hexPrice * formData.hexQuantity);
    }
    if (formData.gasketsQuantity > 0) {
        const gasketsPrice = scheduleData?.components?.gaskets?.[size] || 0;
        addRow('Gaskets', gasketsPrice, formData.gasketsQuantity, gasketsPrice * formData.gasketsQuantity);
    }

    // Accessories
    if (formData.tapValvesQuantity > 0) {
        const price = pricing.accessories?.tap_valves || 0;
        addRow('Tap Valves', price, formData.tapValvesQuantity, price * formData.tapValvesQuantity);
    }
    if (formData.sampleProbeQuantity > 0) {
        const price = pricing.accessories?.sample_probe?.[size] || 0;
        addRow('Sample Probe', price, formData.sampleProbeQuantity, price * formData.sampleProbeQuantity);
    }
    if (formData.thermowellQuantity > 0) {
        const price = pricing.accessories?.thermowell?.[size] || 0;
        addRow('Thermowell', price, formData.thermowellQuantity, price * formData.thermowellQuantity);
    }
    if (formData.testWellQuantity > 0) {
        const price = pricing.accessories?.test_well?.[size] || 0;
        addRow('Test Well', price, formData.testWellQuantity, price * formData.testWellQuantity);
    }
    if (formData.outerEndValvesQuantity > 0) {
        const price = pricing.accessories?.outer_end_valves?.[size] || 0;
        addRow('Outer End Valves', price, formData.outerEndValvesQuantity, price * formData.outerEndValvesQuantity);
    }
    if (formData.checkValvesQuantity > 0) {
        const price = pricing.accessories?.check_valves?.[size] || 0;
        addRow('Check Valves', price, formData.checkValvesQuantity, price * formData.checkValvesQuantity);
    }

    // Finishing labor (all hour fields combined into a single labor rate)
    const totalLaborHours = formData.grindingHours + formData.micHours + formData.assemblyHours +
        formData.hydroHours + formData.prepPaintHours + formData.paintPrimerHours +
        formData.laborPaintHours + formData.dressOutHours;
    if (totalLaborHours > 0) {
        const laborRate = pricing.finishing?.labor_rate || 55;
        addRow('Finishing Labor', laborRate, totalLaborHours, totalLaborHours * laborRate);
    }

    // Welding / labor cost
    if (formData.weldingLaborCost > 0) {
        addRow('Welding / Labor Cost', formData.weldingLaborCost, 1, formData.weldingLaborCost);
    }

    // Additional options
    if (formData.options.sandblasting) {
        const price = pricing.options?.sandblasting || 0;
        addRow('Sandblasting', price, 1, price);
    }
    if (formData.options.xray) {
        const price = pricing.options?.xray || 0;
        addRow('X-Ray', price, 1, price);
    }
    if (formData.options.mtr) {
        const price = pricing.options?.mtr || 0;
        addRow('MTR', price, 1, price);
    }
    if (formData.options.hydro) {
        const price = pricing.options?.hydro || 0;
        addRow('Hydro (4 Hours)', price, 1, price);
    }

    y += 3;

    checkPageBreak(26);

    // Totals section
    const totalsLabelX = pageWidth - 70;
    const totalsValueX = pageWidth - margin - 2;
    
    doc.setDrawColor(...accentColor);
    doc.setLineWidth(0.5);
    doc.line(margin, y - 2, pageWidth - margin, y - 2);
    y += 4;
    
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);

    const subtotalBeforeMarkup = prices.base + prices.options;
    doc.text('Subtotal', totalsLabelX, y);
    doc.text(formatCurrency(subtotalBeforeMarkup), totalsValueX, y, { align: 'right' });
    y += 6;
   
    if (formData.markup && pricing.markup_options[formData.markup]) {
        const markupPercent = (pricing.markup_options[formData.markup] * 100).toFixed(0);
        doc.text(`Markup (${markupPercent}%)`, totalsLabelX, y);
        doc.text(formatCurrency(prices.markup), totalsValueX, y, { align: 'right' });
        y += 6;
    }
   
    doc.setDrawColor(...accentColor);
    doc.setLineWidth(0.5);
    doc.line(margin, y - 2, pageWidth - margin, y - 2);
   
    doc.setFont(undefined, 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...accentColor);
    doc.text('Total (USD)', totalsLabelX, y + 4);
    doc.text(formatCurrency(prices.total), totalsValueX, y + 4, { align: 'right' });

    y += 10;
    
    checkPageBreak(30);

    // Notes and Terms with Signature inline 
    const closingColWidth = contentWidth * 0.62;
    let closingY = y;

    if (formData.notes) {
        const splitNotes = doc.splitTextToSize(formData.notes, closingColWidth);

        doc.setFontSize(9);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(...darkGray);
        doc.text('Additional Notes:', margin, closingY);
        closingY += 5;

        doc.setFont(undefined, 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...mediumGray);
        doc.text(splitNotes, margin, closingY);
        closingY += (splitNotes.length * 4);
        closingY += 5;
    }

    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...darkGray);
    doc.text('Terms and Conditions', margin, closingY);
    closingY += 5;

    doc.setFont(undefined, 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...mediumGray);

    const terms = [
        'This quote is valid for 30 days from the date of generation.',
        'Payment is due within 30 days of invoice date.',
        'Please make checks payable to Your Company Name.'
    ];

    terms.forEach(term => {
        doc.text(term, margin, closingY);
        closingY += 4;
    });

    // Signature line
    const sigX1 = margin + contentWidth * 0.7;
    const sigY = Math.max(closingY - 6, y + 10);
    doc.setDrawColor(...mediumGray);
    doc.setLineWidth(0.3);
    doc.line(sigX1, sigY, pageWidth - margin, sigY);

    doc.setFontSize(8);
    doc.setTextColor(...mediumGray);
    doc.text('Customer signature', pageWidth - margin, sigY + 4, { align: 'right' });

    y = Math.max(closingY, sigY + 4) + 6;

    // Footer
    const footerY = pageHeight - 15;
    doc.setFontSize(8);
    doc.setTextColor(...accentColor);
    doc.text('Your Company Name', pageWidth / 2, footerY, { align: 'center' });
    doc.text('www.yourcompany.com', pageWidth / 2, footerY + 4, { align: 'center' });
    
    // Save PDF
    const filename = `Quote_${quoteNumber}_${formData.customerName || 'Customer'}.pdf`;
    doc.save(filename);
    
    return quoteNumber;
}