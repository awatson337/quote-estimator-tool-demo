function getRecentQuotes() {
    const quotes = JSON.parse(localStorage.getItem('quotes') || '[]');
    return quotes
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10);
}

function populateRecentQuotesDropdown() {
    const dropdown = elements.recentQuotes;

    dropdown.innerHTML = '<option value="">-- Select a recent quote --</option>';

    const recentQuotes = getRecentQuotes();

    recentQuotes.forEach((quote, index) => {
        const option = document.createElement('option');
        option.value = index;
        const displayText = `${quote.quoteNumber} - ${quote.customerName} - ${quote.jobLocation || 'No Location'}`;
        option.textContent = displayText;
        dropdown.appendChild(option);
    });
}

function loadRecentQuote() {
    const selectedIndex = elements.recentQuotes.value;
    if (!selectedIndex) return;

    const recentQuotes = getRecentQuotes();
    const quote = recentQuotes[selectedIndex];

    if (!quote) return;

    elements.customerName.value = quote.customerName || '';
    elements.jobLocation.value = quote.jobLocation || '';
    elements.contactName.value = quote.contactName || '';
    elements.contactEmail.value = quote.contactEmail || '';
    elements.contactPhone.value = quote.contactPhone || '';

    elements.schedule.value = quote.schedule || '';
    elements.size.value = quote.size || '';
    elements.orificeType.value = quote.orificeType || '';
    elements.vendor.value = quote.vendorId || '';
    elements.configuration.value = quote.configuration || '';

    handleConfigurationChange();

    elements.pinConditionerBrand.value = quote.pinConditionerBrand || '';
    elements.pinConditionerType.value = quote.pinConditionerType || '';
    elements.flangeConditionerBrand.value = quote.flangeConditionerBrand || '';

    elements.flangeBrand.value = quote.flangeBrand || '';
    elements.flangeRating.value = quote.flangeRating || '';
    elements.flangeQuantity.value = quote.flangeQuantity || 0;

    elements.pipeLength.value = quote.pipeLength || 0;
    elements.tolsHalfInch.value = quote.tolsHalfInch || 0;
    elements.tolsThreeQuarterInch.value = quote.tolsThreeQuarterInch || 0;
    elements.tolsOneInch.value = quote.tolsOneInch || 0;
    elements.companionFlangeQuantity.value = quote.companionFlangeQuantity || 0;
    elements.studsQuantity.value = quote.studsQuantity || 0;
    elements.hexQuantity.value = quote.hexQuantity || 0;
    elements.gasketsQuantity.value = quote.gasketsQuantity || 0;

    elements.tapValvesQuantity.value = quote.tapValvesQuantity || 0;
    elements.sampleProbeQuantity.value = quote.sampleProbeQuantity || 0;
    elements.thermowellQuantity.value = quote.thermowellQuantity || 0;
    elements.testWellQuantity.value = quote.testWellQuantity || 0;
    elements.outerEndValvesQuantity.value = quote.outerEndValvesQuantity || 0;
    elements.checkValvesQuantity.value = quote.checkValvesQuantity || 0;

    elements.grindingHours.value = quote.grindingHours || 0;
    elements.micHours.value = quote.micHours || 0;
    elements.assemblyHours.value = quote.assemblyHours || 0;
    elements.hydroHours.value = quote.hydroHours || 0;
    elements.prepPaintHours.value = quote.prepPaintHours || 0;
    elements.paintPrimerHours.value = quote.paintPrimerHours || 0;
    elements.laborPaintHours.value = quote.laborPaintHours || 0;
    elements.dressOutHours.value = quote.dressOutHours || 0;
    elements.weldingLaborCost.value = quote.weldingLaborCost || 0;

    elements.markup.value = quote.markup || '';
    elements.optionSandblasting.checked = quote.options?.sandblasting || false;
    elements.optionXray.checked = quote.options?.xray || false;
    elements.optionMtr.checked = quote.options?.mtr || false;
    elements.optionHydro.checked = quote.options?.hydro || false;
    elements.notes.value = quote.notes || '';

    updatePriceDisplay();

    showToast('Quote loaded successfully', 'success');
}

function saveQuoteToHistory(formData, quoteNumber) {
    const quotes = JSON.parse(localStorage.getItem('quotes') || '[]');

    const quote = {
        ...formData,
        quoteNumber: quoteNumber,
        createdAt: new Date().toISOString()
    };

    quotes.push(quote);

    if (quotes.length > 50) {
        quotes.splice(0, quotes.length - 50);
    }

    localStorage.setItem('quotes', JSON.stringify(quotes));
    populateRecentQuotesDropdown();
}
