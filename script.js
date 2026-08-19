// calculations, display, form logic, event listeners, DOM elements
const elements = {
    // Customer Info
    customerSelect: document.getElementById('customerSelect'),
    customerName: document.getElementById('customerName'),
    jobLocation: document.getElementById('jobLocation'),
    contactSelectionSection: document.getElementById('contactSelectionSection'),
    contactSelect: document.getElementById('contactSelect'),
    contactName: document.getElementById('contactName'),
    contactEmail: document.getElementById('contactEmail'),
    contactPhone: document.getElementById('contactPhone'),
    saveButtons: document.getElementById('saveButtons'),
    saveCustomer: document.getElementById('saveCustomer'),
    saveContact: document.getElementById('saveContact'),
    deleteCustomerButtons: document.getElementById('deleteCustomerButtons'),
    deleteContactButtons: document.getElementById('deleteContactButtons'),
    deleteCustomer: document.getElementById('deleteCustomer'),
    deleteContact: document.getElementById('deleteContact'),

    // Meter Run Specifications
    schedule: document.getElementById('schedule'),
    size: document.getElementById('size'),
    orificeType: document.getElementById('orificeType'),
    vendor: document.getElementById('vendor'),
    configuration: document.getElementById('configuration'),

    // Flow Conditioner - Pin Type (2-piece)
    pinTypeSection: document.getElementById('pinTypeSection'),
    pinConditionerBrand: document.getElementById('pinConditionerBrand'),
    pinConditionerType: document.getElementById('pinConditionerType'),

    // Flow Conditioner - Flange Type (3-piece)
    flangeTypeSection: document.getElementById('flangeTypeSection'),
    flangeConditionerBrand: document.getElementById('flangeConditionerBrand'),

    // Flanges
    flangeBrand: document.getElementById('flangeBrand'),
    flangeRating: document.getElementById('flangeRating'),
    flangeQuantity: document.getElementById('flangeQuantity'),

    // Component Quantities
    pipeLength: document.getElementById('pipeLength'),
    tolsHalfInch: document.getElementById('tolsHalfInch'),
    tolsThreeQuarterInch: document.getElementById('tolsThreeQuarterInch'),
    tolsOneInch: document.getElementById('tolsOneInch'),
    companionFlangeQuantity: document.getElementById('companionFlangeQuantity'),
    studsQuantity: document.getElementById('studsQuantity'),
    hexQuantity: document.getElementById('hexQuantity'),
    gasketsQuantity: document.getElementById('gasketsQuantity'),

    // Accessories
    tapValvesQuantity: document.getElementById('tapValvesQuantity'),
    sampleProbeQuantity: document.getElementById('sampleProbeQuantity'),
    thermowellQuantity: document.getElementById('thermowellQuantity'),
    testWellQuantity: document.getElementById('testWellQuantity'),
    outerEndValvesQuantity: document.getElementById('outerEndValvesQuantity'),
    checkValvesQuantity: document.getElementById('checkValvesQuantity'),

    // Finishing (hours)
    grindingHours: document.getElementById('grindingHours'),
    micHours: document.getElementById('micHours'),
    assemblyHours: document.getElementById('assemblyHours'),
    hydroHours: document.getElementById('hydroHours'),
    prepPaintHours: document.getElementById('prepPaintHours'),
    paintPrimerHours: document.getElementById('paintPrimerHours'),
    laborPaintHours: document.getElementById('laborPaintHours'),
    dressOutHours: document.getElementById('dressOutHours'),
    weldingLaborCost: document.getElementById('weldingLaborCost'),

    // Additional Options
    quantity: document.getElementById('quantity'),
    markup: document.getElementById('markup'),
    optionSandblasting: document.getElementById('option_sandblasting'),
    optionXray: document.getElementById('option_xray'),
    optionMtr: document.getElementById('option_mtr'),
    optionHydro: document.getElementById('option_hydro'),
    notes: document.getElementById('notes'),

    // Output
    basePrice: document.getElementById('basePrice'),
    optionsPrice: document.getElementById('optionsPrice'),
    subtotal: document.getElementById('subtotal'),
    markupLabel: document.getElementById('markupLabel'),
    markupPrice: document.getElementById('markupPrice'),
    totalPrice: document.getElementById('totalPrice'),

    // Buttons
    generateQuote: document.getElementById('generateQuote'),
    clearForm: document.getElementById('clearForm'),

    // Recent Quotes
    recentQuotes: document.getElementById('recentQuotes')
};

// show/hide flow conditioner sections
function handleConfigurationChange() {
    const config = elements.configuration.value;

    if (config === '2-piece') {
        elements.pinTypeSection.classList.remove('hidden');
        elements.flangeTypeSection.classList.add('hidden');

        elements.flangeConditionerBrand.value = '';

    } else if (config === '3-piece') {
        elements.pinTypeSection.classList.add('hidden');
        elements.flangeTypeSection.classList.remove('hidden');

        elements.pinConditionerBrand.value = '';
        elements.pinConditionerType.value = '';

    } else {
        elements.pinTypeSection.classList.add('hidden');
        elements.flangeTypeSection.classList.add('hidden');
    }

    updatePriceDisplay();
}

// calculation functions
function calculateBasePrice() {
    const schedule = elements.schedule.value;
    const size = elements.size.value;
    const orificeType = elements.orificeType.value;
    const vendorId = elements.vendor.value;
    const config = elements.configuration.value;
    const quantity = parseInt(elements.quantity.value) || 1;

    if (!size || !orificeType || !vendorId || !schedule) {
        return 0;
    }

    const vendor = PRICING.vendors[vendorId];
    const scheduleData = vendor?.schedules?.[schedule];
    if (!scheduleData) {
        return 0;
    }

    let totalCost = 0;
  
    const orificePrice = scheduleData.orifice_fittings?.[orificeType]?.[size] || 0;
    totalCost += orificePrice;


    if (config === '2-piece') {
        const pinBrand = elements.pinConditionerBrand.value;
        const pinType = elements.pinConditionerType.value;

        if (pinBrand && pinType) {
            const condPrice = PRICING.flow_conditioners?.[schedule]?.pin_type?.[pinType]?.[pinBrand]?.[size] || 0;
            totalCost += condPrice;
        }
    } else if (config === '3-piece') {
        const flangeBrand = elements.flangeConditionerBrand.value;
        if (flangeBrand) {
            const condPrice = PRICING.flow_conditioners?.[schedule]?.flange_type?.[flangeBrand]?.[size] || 0;
            totalCost += condPrice;
        }
    }

    const flangeBrand = elements.flangeBrand.value;
    const flangeRating = elements.flangeRating.value;
    const flangeQty = parseInt(elements.flangeQuantity.value) || 0;
    if (flangeBrand && flangeRating && flangeQty > 0) {
        const flangePrice = PRICING.flanges?.[schedule]?.[flangeBrand]?.[flangeRating]?.[size] || 0;
        totalCost += (flangePrice * flangeQty);
    }

    const pipeLength = parseInt(elements.pipeLength.value) || 0;
    if (pipeLength > 0) {
        const pipePrice = scheduleData.components?.pipe_per_foot?.[size] || 0;
        totalCost += (pipePrice * pipeLength);
    }

    const tolsHalf = parseInt(elements.tolsHalfInch.value) || 0;
    const tolsThreeQuarter = parseInt(elements.tolsThreeQuarterInch.value) || 0;
    const tolsOne = parseInt(elements.tolsOneInch.value) || 0;

    const tolsPricing = scheduleData.components?.tols || {};
    totalCost += (tolsPricing.half_inch || 0) * tolsHalf;
    totalCost += (tolsPricing.three_quarter || 0) * tolsThreeQuarter;
    totalCost += (tolsPricing.one_inch || 0) * tolsOne;

    const companionQty = parseInt(elements.companionFlangeQuantity.value) || 0;
    if (companionQty > 0) {
        const companionPrice = scheduleData.components?.companion_flange_600?.[size] || 0;
        totalCost += (companionPrice * companionQty);
    }

    const studsQty = parseInt(elements.studsQuantity.value) || 0;
    const hexQty = parseInt(elements.hexQuantity.value) || 0;
    const gasketsQty = parseInt(elements.gasketsQuantity.value) || 0;

    const studsPrice = scheduleData.components?.studs?.[size] || 0;
    const hexPrice = scheduleData.components?.hex?.[size] || 0;
    const gasketsPrice = scheduleData.components?.gaskets?.[size] || 0;

    totalCost += (studsPrice * studsQty);
    totalCost += (hexPrice * hexQty);
    totalCost += (gasketsPrice * gasketsQty);

    const tapValvesQty = parseInt(elements.tapValvesQuantity.value) || 0;
    const sampleProbeQty = parseInt(elements.sampleProbeQuantity.value) || 0;
    const thermowellQty = parseInt(elements.thermowellQuantity.value) || 0;
    const testWellQty = parseInt(elements.testWellQuantity.value) || 0;
    const outerEndValvesQty = parseInt(elements.outerEndValvesQuantity.value) || 0;
    const checkValvesQty = parseInt(elements.checkValvesQuantity.value) || 0;

    totalCost += (PRICING.accessories?.tap_valves || 0) * tapValvesQty;
    totalCost += (PRICING.accessories?.sample_probe?.[size] || 0) * sampleProbeQty;
    totalCost += (PRICING.accessories?.thermowell?.[size] || 0) * thermowellQty;
    totalCost += (PRICING.accessories?.test_well?.[size] || 0) * testWellQty;
    totalCost += (PRICING.accessories?.outer_end_valves?.[size] || 0) * outerEndValvesQty;
    totalCost += (PRICING.accessories?.check_valves?.[size] || 0) * checkValvesQty;

    const laborRate = PRICING.finishing?.labor_rate || 55;

    const grindingHours = parseFloat(elements.grindingHours.value) || 0;
    const micHours = parseFloat(elements.micHours.value) || 0;
    const assemblyHours = parseFloat(elements.assemblyHours.value) || 0;
    const hydroHours = parseFloat(elements.hydroHours.value) || 0;
    const prepPaintHours = parseFloat(elements.prepPaintHours.value) || 0;
    const paintPrimerHours = parseFloat(elements.paintPrimerHours.value) || 0;
    const laborPaintHours = parseFloat(elements.laborPaintHours.value) || 0;
    const dressOutHours = parseFloat(elements.dressOutHours.value) || 0;

    const totalLaborHours = grindingHours + micHours + assemblyHours + hydroHours + prepPaintHours + paintPrimerHours + laborPaintHours + dressOutHours;

    totalCost += (totalLaborHours * laborRate);

    const weldingCost = parseFloat(elements.weldingLaborCost.value) || 0;
    totalCost += weldingCost;

    totalCost *= quantity;

    return totalCost;
}

function calculateOptionsPrice() {
    let optionsTotal = 0;

    if (elements.optionSandblasting.checked) {
        optionsTotal += PRICING.options.sandblasting;
    }

    if (elements.optionXray.checked) {
        optionsTotal += PRICING.options.xray;
    }

    if (elements.optionMtr.checked) {
        optionsTotal += PRICING.options.mtr;
    }

    if (elements.optionHydro.checked) {
        optionsTotal += PRICING.options.hydro;
    }

    return optionsTotal;
}

function calculateTotal() {
    const basePrice = calculateBasePrice();
    const optionsPrice = calculateOptionsPrice();
    const markupSelection = elements.markup.value;

    const subtotalBeforeMarkup = basePrice + optionsPrice;

    let markupAmount = 0;
    if (markupSelection && PRICING.markup_options[markupSelection]) {
        markupAmount = subtotalBeforeMarkup * PRICING.markup_options[markupSelection];
    }

    const total = subtotalBeforeMarkup + markupAmount;

    return {
        base: basePrice,
        options: optionsPrice,
        markup: markupAmount,
        total: total
    };
}

// display functions
function showToast(message, type = 'error') {
    const toast = document.createElement('div');
    toast.textContent = message;
    const bg = type === 'success' ? '#2e7d32' : '#c0392b';
    toast.style.cssText = `position:fixed;top:40px;left:50%;transform:translateX(-50%);background:${bg};color:white;padding:14px 20px;border-radius:6px;z-index:99999;font-size:0.95rem;font-weight:500;box-shadow:0 4px 12px rgba(0,0,0,0.3);max-width:360px;`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
}

function formatCurrency(amount) {
    return '$' + amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

function updatePriceDisplay() {
    const prices = calculateTotal();
    const markupSelection = elements.markup.value;

    elements.basePrice.textContent = formatCurrency(prices.base);
    elements.optionsPrice.textContent = formatCurrency(prices.options);
    elements.subtotal.textContent = formatCurrency(prices.base + prices.options);

    if (markupSelection && PRICING.markup_options[markupSelection]) {
        const markupPercent = (PRICING.markup_options[markupSelection] * 100).toFixed(0);
        elements.markupLabel.textContent = `Markup (${markupPercent}%):`;
        elements.markupPrice.textContent = formatCurrency(prices.markup);
    } else {
        elements.markupLabel.textContent = 'Markup:';
        elements.markupPrice.textContent = '$0.00';
    }

    elements.totalPrice.textContent = formatCurrency(prices.total);
}

// quote generation 
function downloadQuote() {
    if (!elements.schedule.value || !elements.size.value || !elements.orificeType.value || !elements.vendor.value) {
        showToast('Please select schedule, size, orifice type, and vendor before generating a quote.');
        return;
    }

    showLoading();

    setTimeout(() => {
        try {
            const formData = {
                customerName: elements.customerName.value,
                jobLocation: elements.jobLocation.value,
                contactName: elements.contactName.value,
                contactEmail: elements.contactEmail.value,
                contactPhone: elements.contactPhone.value,

                schedule: elements.schedule.value,
                size: elements.size.value,
                orificeType: elements.orificeType.value,
                vendorId: elements.vendor.value,
                configuration: elements.configuration.value,

                pinConditionerBrand: elements.pinConditionerBrand.value,
                pinConditionerType: elements.pinConditionerType.value,
                flangeConditionerBrand: elements.flangeConditionerBrand.value,

                flangeBrand: elements.flangeBrand.value,
                flangeRating: elements.flangeRating.value,
                flangeQuantity: parseInt(elements.flangeQuantity.value) || 0,

                pipeLength: parseFloat(elements.pipeLength.value) || 0,
                tolsHalfInch: parseInt(elements.tolsHalfInch.value) || 0,
                tolsThreeQuarterInch: parseInt(elements.tolsThreeQuarterInch.value) || 0,
                tolsOneInch: parseInt(elements.tolsOneInch.value) || 0,
                companionFlangeQuantity: parseInt(elements.companionFlangeQuantity.value) || 0,
                studsQuantity: parseInt(elements.studsQuantity.value) || 0,
                hexQuantity: parseInt(elements.hexQuantity.value) || 0,
                gasketsQuantity: parseInt(elements.gasketsQuantity.value) || 0,

                tapValvesQuantity: parseInt(elements.tapValvesQuantity.value) || 0,
                sampleProbeQuantity: parseInt(elements.sampleProbeQuantity.value) || 0,
                thermowellQuantity: parseInt(elements.thermowellQuantity.value) || 0,
                testWellQuantity: parseInt(elements.testWellQuantity.value) || 0,
                outerEndValvesQuantity: parseInt(elements.outerEndValvesQuantity.value) || 0,
                checkValvesQuantity: parseInt(elements.checkValvesQuantity.value) || 0,

                grindingHours: parseFloat(elements.grindingHours.value) || 0,
                micHours: parseFloat(elements.micHours.value) || 0,
                assemblyHours: parseFloat(elements.assemblyHours.value) || 0,
                hydroHours: parseFloat(elements.hydroHours.value) || 0,
                prepPaintHours: parseFloat(elements.prepPaintHours.value) || 0,
                paintPrimerHours: parseFloat(elements.paintPrimerHours.value) || 0,
                laborPaintHours: parseFloat(elements.laborPaintHours.value) || 0,
                dressOutHours: parseFloat(elements.dressOutHours.value) || 0,
                weldingLaborCost: parseFloat(elements.weldingLaborCost.value) || 0,

                quantity: parseInt(elements.quantity.value) || 1,
                markup: elements.markup.value,
                notes: elements.notes.value,
                options: {
                    sandblasting: elements.optionSandblasting.checked,
                    xray: elements.optionXray.checked,
                    mtr: elements.optionMtr.checked,
                    hydro: elements.optionHydro.checked
                }
            };

            const prices = calculateTotal();

            const quoteNumber = generatePDFQuote(formData, prices, PRICING);

            saveQuoteToHistory(formData, quoteNumber);

            setTimeout(() => {
                hideLoading();
            }, 500);

        } catch (error) {
            hideLoading();
            showToast('Error generating quote. Please try again.');
            console.error('Quote generation error:', error);
        }
    }, 100);
}

function clearForm() {
    if (confirm('Are you sure you want to clear the form? All entered data will be lost.')) {
        elements.customerSelect.value = '';
        elements.customerName.value = '';
        elements.jobLocation.value = '';
        elements.contactName.value = '';
        elements.contactEmail.value = '';
        elements.contactPhone.value = '';

        elements.contactSelectionSection.classList.add('hidden');
        elements.saveButtons.classList.add('hidden');

        elements.customerName.removeAttribute('readonly');

        elements.schedule.value = '';
        elements.size.value = '';
        elements.orificeType.value = '';
        elements.vendor.value = '';
        elements.configuration.value = '';

        elements.pinConditionerBrand.value = '';
        elements.pinConditionerType.value = '';
        elements.flangeConditionerBrand.value = '';

        elements.pinTypeSection.classList.add('hidden');
        elements.flangeTypeSection.classList.add('hidden');

        elements.flangeBrand.value = '';
        elements.flangeRating.value = '';
        elements.flangeQuantity.value = '0';

        elements.pipeLength.value = '0';
        elements.tolsHalfInch.value = '0';
        elements.tolsThreeQuarterInch.value = '0';
        elements.tolsOneInch.value = '0';
        elements.companionFlangeQuantity.value = '0';
        elements.studsQuantity.value = '0';
        elements.hexQuantity.value = '0';
        elements.gasketsQuantity.value = '0';

        elements.tapValvesQuantity.value = '0';
        elements.sampleProbeQuantity.value = '0';
        elements.thermowellQuantity.value = '0';
        elements.testWellQuantity.value = '0';
        elements.outerEndValvesQuantity.value = '0';
        elements.checkValvesQuantity.value = '0';

        elements.grindingHours.value = '0';
        elements.micHours.value = '0';
        elements.assemblyHours.value = '0';
        elements.hydroHours.value = '0';
        elements.prepPaintHours.value = '0';
        elements.paintPrimerHours.value = '0';
        elements.laborPaintHours.value = '0';
        elements.dressOutHours.value = '0';
        elements.weldingLaborCost.value = '0';

        elements.quantity.value = '1';
        elements.markup.value = '';
        elements.optionSandblasting.checked = false;
        elements.optionXray.checked = false;
        elements.optionMtr.checked = false;
        elements.optionHydro.checked = false;
        elements.notes.value = '';

        elements.recentQuotes.value = '';

        updatePriceDisplay();

        showToast('Form cleared successfully', 'success');

        elements.customerSelect.focus();
    }
}

function showLoading() {
    document.getElementById('loadingOverlay').classList.add('active');
}

function hideLoading() {
    document.getElementById('loadingOverlay').classList.remove('active');
}

// event listeners
elements.schedule.addEventListener('change', updatePriceDisplay);
elements.size.addEventListener('change', updatePriceDisplay);
elements.orificeType.addEventListener('change', updatePriceDisplay);
elements.vendor.addEventListener('change', updatePriceDisplay);
elements.configuration.addEventListener('change', handleConfigurationChange);

elements.pinConditionerBrand.addEventListener('change', updatePriceDisplay);
elements.pinConditionerType.addEventListener('change', updatePriceDisplay);
elements.flangeConditionerBrand.addEventListener('change', updatePriceDisplay);

elements.flangeBrand.addEventListener('change', updatePriceDisplay);
elements.flangeRating.addEventListener('change', updatePriceDisplay);
elements.flangeQuantity.addEventListener('input', updatePriceDisplay);

elements.pipeLength.addEventListener('input', updatePriceDisplay);
elements.tolsHalfInch.addEventListener('input', updatePriceDisplay);
elements.tolsThreeQuarterInch.addEventListener('input', updatePriceDisplay);
elements.tolsOneInch.addEventListener('input', updatePriceDisplay);
elements.companionFlangeQuantity.addEventListener('input', updatePriceDisplay);
elements.studsQuantity.addEventListener('input', updatePriceDisplay);
elements.hexQuantity.addEventListener('input', updatePriceDisplay);
elements.gasketsQuantity.addEventListener('input', updatePriceDisplay);

elements.tapValvesQuantity.addEventListener('input', updatePriceDisplay);
elements.sampleProbeQuantity.addEventListener('input', updatePriceDisplay);
elements.thermowellQuantity.addEventListener('input', updatePriceDisplay);
elements.testWellQuantity.addEventListener('input', updatePriceDisplay);
elements.outerEndValvesQuantity.addEventListener('input', updatePriceDisplay);
elements.checkValvesQuantity.addEventListener('input', updatePriceDisplay);

elements.grindingHours.addEventListener('input', updatePriceDisplay);
elements.micHours.addEventListener('input', updatePriceDisplay);
elements.assemblyHours.addEventListener('input', updatePriceDisplay);
elements.hydroHours.addEventListener('input', updatePriceDisplay);
elements.prepPaintHours.addEventListener('input', updatePriceDisplay);
elements.paintPrimerHours.addEventListener('input', updatePriceDisplay);
elements.laborPaintHours.addEventListener('input', updatePriceDisplay);
elements.dressOutHours.addEventListener('input', updatePriceDisplay);
elements.weldingLaborCost.addEventListener('input', updatePriceDisplay);

elements.quantity.addEventListener('input', updatePriceDisplay);
elements.markup.addEventListener('change', updatePriceDisplay);
elements.optionSandblasting.addEventListener('change', updatePriceDisplay);
elements.optionXray.addEventListener('change', updatePriceDisplay);
elements.optionMtr.addEventListener('change', updatePriceDisplay);
elements.optionHydro.addEventListener('change', updatePriceDisplay);

elements.customerSelect.addEventListener('change', handleCustomerSelection);
elements.contactSelect.addEventListener('change', handleContactSelection);
elements.saveCustomer.addEventListener('click', saveNewCustomer);
elements.saveContact.addEventListener('click', saveNewContact);

elements.deleteCustomer.addEventListener('click', deleteCustomer);
elements.deleteContact.addEventListener('click', deleteContact);

elements.generateQuote.addEventListener('click', downloadQuote);
elements.clearForm.addEventListener('click', clearForm);

elements.recentQuotes.addEventListener('change', loadRecentQuote);

updatePriceDisplay();
initializeCustomers();
populateCustomerDropdown();
populateRecentQuotesDropdown();