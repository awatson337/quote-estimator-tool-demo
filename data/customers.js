// Customers are stored in localStorage for this demo; in production this would be a database, accessed via an API instead
const INITIAL_CUSTOMERS = [
    {
        id: "customer_001",
        customerName: "Test Customer 1",
        contacts: [
            {
                name: "Test Name 1",
                email: "name1@test.com",
                phone: "(123) 456-7891"
            },
            {
                name: "Test Name 2",
                email: "name2@test.com",
                phone: "(123) 456-7892"
            }
        ],
        createdAt: "2026-01-15T10:00:00.000Z"
    },
    {
        id: "customer_002",
        customerName: "Test Customer 2",
        contacts: [
            {
                name: "Test Name 3",
                email: "name3@test.com",
                phone: "(123) 456-7893"
            }
        ],
        createdAt: "2026-01-20T14:30:00.000Z"
    },
    {
        id: "customer_003",
        customerName: "Test Customer 3",
        contacts: [
            {
                name: "Test Name 4",
                email: "name4@test.com",
                phone: "(123) 456-7894"
            }
        ],
        createdAt: "2026-02-01T09:15:00.000Z"
    }
];

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    const digitsOnly = phone.replace(/\D/g, '');
    return digitsOnly.length === 10;
}

function formatPhoneNumber(phone) {
    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length === 10) {
        return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6)}`;
    }
    return phone;
}

function getCustomers() {
    return JSON.parse(localStorage.getItem('customers')) || [];
}

function saveCustomers(customers) {
    localStorage.setItem('customers', JSON.stringify(customers));
}

function initializeCustomers() {
    const isInitialized = localStorage.getItem('customersInitialized');

    if (!isInitialized && typeof INITIAL_CUSTOMERS !== 'undefined') {
        saveCustomers(INITIAL_CUSTOMERS);
        localStorage.setItem('customersInitialized', 'true');
        console.log(`Loaded ${INITIAL_CUSTOMERS.length} initial customers`);
    }
}

function populateCustomerDropdown() {
    const customers = getCustomers();
    const dropdown = elements.customerSelect;

    dropdown.innerHTML = `
        <option value="">-- Select a customer --</option>
        <option value="new">+ Add New Customer</option>
    `;

    customers.forEach(customer => {
        const option = document.createElement('option');
        option.value = customer.id;
        option.textContent = customer.customerName;
        dropdown.appendChild(option);
    });
}

function handleCustomerSelection() {
    const selectedValue = elements.customerSelect.value;

    if (selectedValue === 'new') {
        elements.customerName.value = '';
        elements.customerName.removeAttribute('readonly');
        elements.customerName.focus();
        elements.contactSelectionSection.classList.add('hidden');
        elements.saveButtons.classList.remove('hidden');
        elements.saveCustomer.classList.remove('hidden');
        elements.saveContact.classList.add('hidden');
        elements.deleteCustomerButtons.classList.add('hidden');
        elements.deleteContactButtons.classList.add('hidden');
        elements.contactName.value = '';
        elements.contactEmail.value = '';
        elements.contactPhone.value = '';
        elements.contactName.removeAttribute('readonly');
        elements.contactEmail.removeAttribute('readonly');
        elements.contactPhone.removeAttribute('readonly');

    } else if (selectedValue) {
        const customers = getCustomers();
        const customer = customers.find(c => c.id === selectedValue);

        if (customer) {
            elements.customerName.value = customer.customerName;
            elements.customerName.setAttribute('readonly', true);
            elements.contactSelectionSection.classList.remove('hidden');
            elements.saveButtons.classList.add('hidden');
            elements.deleteCustomerButtons.classList.remove('hidden');
            elements.deleteContactButtons.classList.add('hidden');
            populateContactDropdown(customer.contacts);
            elements.contactName.value = '';
            elements.contactEmail.value = '';
            elements.contactPhone.value = '';
        }
    } else {
        elements.customerName.value = '';
        elements.customerName.removeAttribute('readonly');
        elements.contactSelectionSection.classList.add('hidden');
        elements.saveButtons.classList.add('hidden');
        elements.deleteCustomerButtons.classList.add('hidden');
        elements.deleteContactButtons.classList.add('hidden');

        elements.contactName.value = '';
        elements.contactEmail.value = '';
        elements.contactPhone.value = '';

        elements.contactName.removeAttribute('readonly');
        elements.contactEmail.removeAttribute('readonly');
        elements.contactPhone.removeAttribute('readonly');
    }
}

function populateContactDropdown(contacts) {
    elements.contactSelect.innerHTML = `
        <option value="">-- Select a contact --</option>
        <option value="new">+ Add New Contact</option>
    `;

    if (contacts && contacts.length > 0) {
        contacts.forEach((contact, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = contact.name;
            elements.contactSelect.appendChild(option);
        });
    }
}

function handleContactSelection() {
    const selectedValue = elements.contactSelect.value;
    const customerValue = elements.customerSelect.value;

    if (selectedValue === 'new') {
        elements.contactName.value = '';
        elements.contactEmail.value = '';
        elements.contactPhone.value = '';
        elements.contactName.removeAttribute('readonly');
        elements.contactEmail.removeAttribute('readonly');
        elements.contactPhone.removeAttribute('readonly');
        elements.saveButtons.classList.remove('hidden');
        elements.saveCustomer.classList.add('hidden');
        elements.saveContact.classList.remove('hidden');
        elements.deleteCustomerButtons.classList.add('hidden');
        elements.deleteContactButtons.classList.add('hidden');
        elements.contactName.focus();

    } else if (selectedValue !== '') {
        const customers = getCustomers();
        const customer = customers.find(c => c.id === customerValue);

        if (customer && customer.contacts && customer.contacts[selectedValue]) {
            const contact = customer.contacts[selectedValue];
            elements.contactName.value = contact.name;
            elements.contactEmail.value = contact.email;
            elements.contactPhone.value = contact.phone;

            elements.contactName.setAttribute('readonly', true);
            elements.contactEmail.setAttribute('readonly', true);
            elements.contactPhone.setAttribute('readonly', true);

            elements.saveButtons.classList.add('hidden');
            elements.deleteCustomerButtons.classList.add('hidden');
            elements.deleteContactButtons.classList.remove('hidden');
        }
    } else {
        elements.contactName.value = '';
        elements.contactEmail.value = '';
        elements.contactPhone.value = '';
        elements.saveButtons.classList.add('hidden');
        elements.deleteCustomerButtons.classList.remove('hidden');
        elements.deleteContactButtons.classList.add('hidden');
    }
}

function saveNewCustomer() {
    const customerName = elements.customerName.value.trim();
    const contactName = elements.contactName.value.trim();
    const contactEmail = elements.contactEmail.value.trim();
    const contactPhone = elements.contactPhone.value.trim();

    if (!customerName) {
        showToast('Please enter customer name', 'error');
        elements.customerName.focus();
        return;
    }

    if (!contactName) {
        showToast('Please enter contact name', 'error');
        elements.contactName.focus();
        return;
    }

    if (!contactEmail) {
        showToast('Please enter contact email', 'error');
        elements.contactEmail.focus();
        return;
    }

    if (!isValidEmail(contactEmail)) {
        showToast('Please enter a valid email address', 'error');
        elements.contactEmail.focus();
        return;
    }

    if (!contactPhone) {
        showToast('Please enter contact phone number', 'error');
        elements.contactPhone.focus();
        return;
    }

    if (!isValidPhone(contactPhone)) {
        showToast('Please enter a valid 10-digit phone number', 'error');
        elements.contactPhone.focus();
        return;
    }

    const customers = getCustomers();

    if (customers.some(c => c.customerName.toLowerCase() === customerName.toLowerCase())) {
        showToast('Customer already exists', 'error');
        return;
    }

    const newCustomer = {
        id: 'customer_' + Date.now(),
        customerName: customerName,
        contacts: [
            {
                name: contactName,
                email: contactEmail,
                phone: formatPhoneNumber(contactPhone)
            }
        ],
        createdAt: new Date().toISOString()
    };

    customers.push(newCustomer);
    saveCustomers(customers);

    populateCustomerDropdown();

    elements.customerSelect.value = newCustomer.id;

    elements.customerName.setAttribute('readonly', true);

    elements.saveButtons.classList.add('hidden');

    elements.contactSelectionSection.classList.remove('hidden');
    populateContactDropdown(newCustomer.contacts);
    elements.contactSelect.value = '0';

    elements.contactName.setAttribute('readonly', true);
    elements.contactEmail.setAttribute('readonly', true);
    elements.contactPhone.setAttribute('readonly', true);

    showToast('Customer saved successfully', 'success');
}

function saveNewContact() {
    const customerValue = elements.customerSelect.value;
    const contactName = elements.contactName.value.trim();
    const contactEmail = elements.contactEmail.value.trim();
    const contactPhone = elements.contactPhone.value.trim();

    if (!contactName) {
        showToast('Please enter contact name', 'error');
        elements.contactName.focus();
        return;
    }

    if (!contactEmail) {
        showToast('Please enter contact email', 'error');
        elements.contactEmail.focus();
        return;
    }

    if (!isValidEmail(contactEmail)) {
        showToast('Please enter a valid email address', 'error');
        elements.contactEmail.focus();
        return;
    }

    if (!contactPhone) {
        showToast('Please enter contact phone number', 'error');
        elements.contactPhone.focus();
        return;
    }

    if (!isValidPhone(contactPhone)) {
        showToast('Please enter a valid 10-digit phone number', 'error');
        elements.contactPhone.focus();
        return;
    }

    const customers = getCustomers();
    const customerIndex = customers.findIndex(c => c.id === customerValue);

    if (customerIndex === -1) {
        showToast('Customer not found', 'error');
        return;
    }

    const newContact = {
        name: contactName,
        email: contactEmail,
        phone: formatPhoneNumber(contactPhone)
    };

    customers[customerIndex].contacts.push(newContact);

    saveCustomers(customers);

    populateContactDropdown(customers[customerIndex].contacts);

    const newContactIndex = customers[customerIndex].contacts.length - 1;
    elements.contactSelect.value = newContactIndex;

    elements.contactName.setAttribute('readonly', true);
    elements.contactEmail.setAttribute('readonly', true);
    elements.contactPhone.setAttribute('readonly', true);

    elements.saveButtons.classList.add('hidden');

    showToast('Contact added successfully', 'success');
}

function deleteContact() {
    const customerValue = elements.customerSelect.value;
    const contactValue = elements.contactSelect.value;

    if (!customerValue || customerValue === 'new') {
        showToast('Please select a customer first', 'error');
        return;
    }

    if (!contactValue || contactValue === 'new') {
        showToast('Please select a contact to delete', 'error');
        return;
    }

    const customers = getCustomers();
    const customer = customers.find(c => c.id === customerValue);

    if (!customer) {
        showToast('Customer not found', 'error');
        return;
    }

    const contactIndex = parseInt(contactValue);
    const contact = customer.contacts[contactIndex];

    if (!contact) {
        showToast('Contact not found', 'error');
        return;
    }

    if (!confirm(`Delete contact "${contact.name}"?\n\nThis cannot be undone.`)) {
        return;
    }

    if (customer.contacts.length === 1) {
        showToast('This is the customer\'s last contact and can\'t be removed. Add a new contact first, then delete this one — or delete the customer entirely.', 'error');
        return;
    }

    customer.contacts.splice(contactIndex, 1);

    saveCustomers(customers);

    populateContactDropdown(customer.contacts);

    elements.contactSelect.value = '';
    elements.contactName.value = '';
    elements.contactEmail.value = '';
    elements.contactPhone.value = '';
    elements.contactName.removeAttribute('readonly');
    elements.contactEmail.removeAttribute('readonly');
    elements.contactPhone.removeAttribute('readonly');

    elements.deleteContactButtons.classList.add('hidden');
    elements.deleteCustomerButtons.classList.remove('hidden');

    showToast('Contact deleted successfully', 'success');
}

function deleteCustomer() {
    const customerValue = elements.customerSelect.value;

    if (!customerValue || customerValue === 'new') {
        showToast('Please select a customer to delete', 'error');
        return;
    }

    const customers = getCustomers();
    const customer = customers.find(c => c.id === customerValue);

    if (!customer) {
        showToast('Customer not found', 'error');
        return;
    }

    const contactCount = customer.contacts.length;
    const contactText = contactCount === 1 ? '1 contact' : `${contactCount} contacts`;

    if (!confirm(`Delete "${customer.customerName}" and ${contactText}?\n\nThis cannot be undone.`)) {
        return;
    }

    const updatedCustomers = customers.filter(c => c.id !== customerValue);

    saveCustomers(updatedCustomers);

    populateCustomerDropdown();

    elements.customerSelect.value = '';
    elements.customerName.value = '';
    elements.customerName.removeAttribute('readonly');
    elements.contactSelectionSection.classList.add('hidden');
    elements.contactName.value = '';
    elements.contactEmail.value = '';
    elements.contactPhone.value = '';

    elements.deleteCustomerButtons.classList.add('hidden');
    elements.deleteContactButtons.classList.add('hidden');

    showToast('Customer deleted successfully', 'success');
}