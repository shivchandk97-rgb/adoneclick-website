/* ==========================================================================
   AdOneClick - Interactive Frontend Behaviors, Animations & Simulators
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initPageLoader();
    initScrollProgressBar();
    initStickyNavbar();
    initMobileMenu();
    initSlaTimers();
    initFeatureTabs();
    initWorkflowNodeInteractions();
    initWorkflowSimulator();
    initCustomFieldsInteractive();
    initFaqAccordion();
    initLiveLeadSimulator();
    initScrollToTop();
    initContactForm();
});

/* --------------------------------------------------------------------------
   Page Loader
   -------------------------------------------------------------------------- */
function initPageLoader() {
    const loader = document.querySelector('.loader');
    if (loader) {
        setTimeout(() => {
            loader.classList.add('hidden');
        }, 350);
    }
}

/* --------------------------------------------------------------------------
   Top Reading Progress Bar
   -------------------------------------------------------------------------- */
function initScrollProgressBar() {
    const progressBar = document.querySelector('.scroll-progress-bar');
    if (!progressBar) return;

    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (scrollTop / docHeight) * 100;
        progressBar.style.width = scrolled + '%';
    });
}

/* --------------------------------------------------------------------------
   Sticky Navbar & Mobile Menu
   -------------------------------------------------------------------------- */
function initStickyNavbar() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

function initMobileMenu() {
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('.nav-links a');

    if (mobileBtn && navbar) {
        mobileBtn.addEventListener('click', () => {
            navbar.classList.toggle('menu-open');
            const icon = mobileBtn.querySelector('i');
            if (icon) {
                if (navbar.classList.contains('menu-open')) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-times');
                } else {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navbar.classList.remove('menu-open');
                const icon = mobileBtn.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            });
        });
    }
}

/* --------------------------------------------------------------------------
   Live Speed-To-Lead SLA Countdown Timers
   -------------------------------------------------------------------------- */
function initSlaTimers() {
    const slaTimerElements = document.querySelectorAll('.sla-live-timer');
    if (!slaTimerElements.length) return;

    const timerData = [];
    slaTimerElements.forEach((el, index) => {
        let initialSeconds = 175 + (index * 95);
        timerData.push({ el, seconds: initialSeconds });
    });

    setInterval(() => {
        timerData.forEach(item => {
            if (item.seconds > 0) {
                item.seconds--;
            } else {
                item.seconds = 300;
            }
            const mins = Math.floor(item.seconds / 60);
            const secs = item.seconds % 60;
            item.el.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        });
    }, 1000);
}

/* --------------------------------------------------------------------------
   Feature Tabs Switching
   -------------------------------------------------------------------------- */
function initFeatureTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-content-panel');

    if (!tabButtons.length) return;

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-tab');

            tabButtons.forEach(b => b.classList.remove('active'));
            tabPanels.forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            const targetPanel = document.getElementById(targetId);
            if (targetPanel) {
                targetPanel.classList.add('active');
            }
        });
    });
}

/* --------------------------------------------------------------------------
   Visual Workflow Interactive Node Inspector
   -------------------------------------------------------------------------- */
function initWorkflowNodeInteractions() {
    const nodes = document.querySelectorAll('.wf-node');
    const detailBox = document.getElementById('workflowNodeDetail');

    if (!nodes.length || !detailBox) return;

    const nodeDescriptions = {
        'node-trigger': '🎯 <strong>Meta Ads Webhook:</strong> Ingests Facebook & Instagram lead submissions instantly with 256-bit signature validation in < 120ms.',
        'node-condition': '⚡ <strong>Smart Filter:</strong> Checks custom lead fields (Budget $5k+, target geography, email verification) before routing.',
        'node-roundrobin': '👥 <strong>Weighted Round-Robin:</strong> Dynamically checks sales rep availability, capacity, and active timezone to assign instantly.',
        'node-action-sms': '💬 <strong>Instant Multi-Channel Push:</strong> Fires personalized WhatsApp template + SMS with rep calendar booking link in under 15 seconds.',
        'node-action-crm': '🚀 <strong>CRM Pipeline Sync:</strong> Creates qualified contact in Kanban pipeline, starts 5-minute SLA countdown timer, and notifies Slack channel.'
    };

    nodes.forEach(node => {
        node.addEventListener('click', () => {
            nodes.forEach(n => n.classList.remove('card-active'));
            node.classList.add('card-active');

            const nodeId = node.id;
            if (nodeDescriptions[nodeId]) {
                detailBox.innerHTML = nodeDescriptions[nodeId];
            }
        });
    });
}

/* --------------------------------------------------------------------------
   Interactive Lead Ingestion Simulation Runner
   -------------------------------------------------------------------------- */
function initWorkflowSimulator() {
    const simBtn = document.getElementById('btnRunSimulation');
    const detailBox = document.getElementById('workflowNodeDetail');
    const nodes = [
        document.getElementById('node-trigger'),
        document.getElementById('node-condition'),
        document.getElementById('node-roundrobin'),
        document.getElementById('node-action-sms'),
        document.getElementById('node-action-crm')
    ];

    if (!simBtn || !detailBox) return;

    let isRunning = false;

    simBtn.addEventListener('click', () => {
        if (isRunning) return;
        isRunning = true;
        simBtn.disabled = true;
        simBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Simulating Ingestion...';

        const steps = [
            {
                index: 0,
                text: '⚡ <strong>[Step 1/5 - Trigger]:</strong> New Meta Instant Form submitted by "Chloe Davenport" (Captured in 38ms)!'
            },
            {
                index: 1,
                text: '🔍 <strong>[Step 2/5 - Condition]:</strong> Validated custom field: Budget = $15,000 (&ge; $5k requirement met).'
            },
            {
                index: 2,
                text: '👥 <strong>[Step 3/5 - Assignment]:</strong> Round-robin matched active rep: Sarah Jenkins (Online & under quota).'
            },
            {
                index: 3,
                text: '💬 <strong>[Step 4/5 - Multi-Channel]:</strong> WhatsApp booking message dispatched in 1.2s!'
            },
            {
                index: 4,
                text: '🎯 <strong>[Step 5/5 - Pipeline Sync]:</strong> Lead placed into Kanban stage "Qualified" with 5m SLA timer active!'
            }
        ];

        let currentStep = 0;

        function runStep() {
            if (currentStep < steps.length) {
                const s = steps[currentStep];
                nodes.forEach(n => {
                    if (n) n.classList.remove('card-active');
                });

                if (nodes[s.index]) {
                    nodes[s.index].classList.add('card-active');
                }

                detailBox.innerHTML = s.text;
                currentStep++;
                setTimeout(runStep, 1100);
            } else {
                detailBox.innerHTML = '🎉 <strong>Simulation Complete:</strong> Lead ingested, filtered, assigned to rep, and queued in CRM in 1.4 seconds total.';
                simBtn.disabled = false;
                simBtn.innerHTML = '<i class="fas fa-redo"></i> Re-Run Simulation';
                isRunning = false;
            }
        }

        runStep();
    });
}

/* --------------------------------------------------------------------------
   Custom Fields Interactive Showcase Switcher
   -------------------------------------------------------------------------- */
function initCustomFieldsInteractive() {
    const fieldPills = document.querySelectorAll('.cf-pill');
    const cfDisplay = document.getElementById('cfFieldDisplay');

    if (!fieldPills.length || !cfDisplay) return;

    const cfData = {
        'budget': {
            title: 'Projected Budget (Currency Field)',
            badge: 'Currency Field',
            sample: '$15,000 / month',
            metaMapping: 'meta.form_answers.monthly_spend',
            crmProperty: 'deal.budget_amount',
            rule: 'If Budget &ge; $10k ➔ Route to Senior Account Exec'
        },
        'timeline': {
            title: 'Implementation Timeline (Dropdown Field)',
            badge: 'Single-Select Dropdown',
            sample: 'Immediately (< 2 weeks)',
            metaMapping: 'meta.form_answers.purchase_timeline',
            crmProperty: 'lead.buying_timeline',
            rule: 'If "Immediately" ➔ Set Urgent SLA (3 minutes)'
        },
        'team_size': {
            title: 'Company Size (Number / Select)',
            badge: 'Number Field',
            sample: '25 - 50 Seats',
            metaMapping: 'meta.form_answers.employee_count',
            crmProperty: 'account.team_size',
            rule: 'If Size &ge; 50 ➔ Tag "Enterprise Scale Account"'
        },
        'preferred_channel': {
            title: 'Preferred Communication (Multi-Select)',
            badge: 'Multi-Select Checkboxes',
            sample: 'WhatsApp, Phone Call',
            metaMapping: 'meta.form_answers.contact_preference',
            crmProperty: 'contact.contact_channels',
            rule: 'Automatically trigger WhatsApp template if selected'
        }
    };

    fieldPills.forEach(pill => {
        pill.addEventListener('click', () => {
            fieldPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');

            const key = pill.getAttribute('data-field') || 'budget';
            const data = cfData[key] || cfData['budget'];

            cfDisplay.innerHTML = `
                <div style="background: rgba(15, 23, 42, 0.95); border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 12px; padding: 20px; color: white;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.08); padding-bottom: 8px;">
                        <strong style="color: #60A5FA; font-size: 0.95rem;">${data.title}</strong>
                        <span style="background: rgba(79, 70, 229, 0.25); color: #A5B4FC; font-size: 0.72rem; padding: 2px 8px; border-radius: 12px;">${data.badge}</span>
                    </div>
                    <div class="cf-grid-cols" style="margin-bottom: 12px;">
                        <div>
                            <span style="color: #94A3B8; display: block; font-size: 0.75rem;">Meta Form Source:</span>
                            <code style="color: #38BDF8; font-family: monospace; word-break: break-all;">${data.metaMapping}</code>
                        </div>
                        <div>
                            <span style="color: #94A3B8; display: block; font-size: 0.75rem;">CRM Property Destination:</span>
                            <code style="color: #34D399; font-family: monospace; word-break: break-all;">${data.crmProperty}</code>
                        </div>
                    </div>
                    <div style="background: rgba(255, 255, 255, 0.05); padding: 10px 14px; border-radius: 6px; font-size: 0.8rem; margin-bottom: 10px;">
                        <span style="color: #94A3B8;">Sample Ingested Value: </span>
                        <strong style="color: #FFFFFF;">${data.sample}</strong>
                    </div>
                    <div style="color: #FBBF24; font-size: 0.78rem;">
                        <i class="fas fa-bolt"></i> <strong>Automation Trigger:</strong> ${data.rule}
                    </div>
                </div>
            `;
        });
    });
}

/* --------------------------------------------------------------------------
   FAQ Accordion
   -------------------------------------------------------------------------- */
function initFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    if (!faqItems.length) return;

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        if (!question) return;

        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            faqItems.forEach(i => i.classList.remove('active'));

            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
}

/* --------------------------------------------------------------------------
   Simulated Live Lead Ingestion Notification Toast
   -------------------------------------------------------------------------- */
function initLiveLeadSimulator() {
    const toast = document.querySelector('.floating-notification-toast');
    if (!toast) return;

    const leadSources = [
        { name: 'Sarah Jenkins', source: 'Facebook Lead Ad', deal: '$14,500', rep: 'Marcus V.' },
        { name: 'David Chen', source: 'Instagram Story Form', deal: '$28,000', rep: 'Sarah K.' },
        { name: 'Chloe Davenport', source: 'Meta Instant Form', deal: '$19,200', rep: 'David L.' },
        { name: 'Michael Sterling', source: 'Facebook Retargeting', deal: '$32,000', rep: 'Emma W.' }
    ];

    let currentIndex = 0;

    setInterval(() => {
        currentIndex = (currentIndex + 1) % leadSources.length;
        const lead = leadSources[currentIndex];

        const titleEl = toast.querySelector('h5');
        const descEl = toast.querySelector('p');

        if (titleEl && descEl) {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';

            setTimeout(() => {
                titleEl.textContent = `New Meta Lead: ${lead.name} (${lead.source})`;
                descEl.textContent = `Routed to ${lead.rep} • Deal value: ${lead.deal} • 2s ago`;
                toast.style.opacity = '1';
                toast.style.transform = 'translateY(0)';
            }, 300);
        }
    }, 12000);
}

/* --------------------------------------------------------------------------
   Scroll to Top Button
   -------------------------------------------------------------------------- */
function initScrollToTop() {
    const scrollTopBtn = document.querySelector('.scroll-top');
    if (!scrollTopBtn) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
            scrollTopBtn.classList.add('show');
        } else {
            scrollTopBtn.classList.remove('show');
        }
    });

    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

/* --------------------------------------------------------------------------
   Contact & Inquiry Form API Integration (AdOneClick Utility API)
   -------------------------------------------------------------------------- */
function initContactForm() {
    const forms = document.querySelectorAll('#contact-form, #inquiry-form');
    if (!forms.length) return;

    forms.forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = form.querySelector('button[type="submit"]');
            let successMsg = form.querySelector('.success-message');
            let errorMsg = form.querySelector('.error-message');

            if (!successMsg) {
                successMsg = document.createElement('div');
                successMsg.className = 'success-message';
                form.appendChild(successMsg);
            }
            if (!errorMsg) {
                errorMsg = document.createElement('div');
                errorMsg.className = 'error-message';
                form.appendChild(errorMsg);
            }

            // Hide previous notifications
            successMsg.style.display = 'none';
            errorMsg.style.display = 'none';

            // Extract input values
            const fullName = (form.querySelector('[name="fullName"], [name="name"], #fullName, #name')?.value || '').trim();
            const workEmail = (form.querySelector('[name="workEmail"], [name="email"], #email, #contactEmail')?.value || '').trim();
            const phone = (form.querySelector('[name="phone"], #phone, #contactPhone')?.value || '').trim();
            const message = (form.querySelector('[name="message"], #message, #contactMessage')?.value || '').trim();

            if (!fullName || !workEmail || !message) {
                errorMsg.style.display = 'block';
                errorMsg.textContent = 'Please fill out all required fields (Full Name, Work Email, and Message).';
                return;
            }

            // Button loading state
            const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.style.opacity = '0.75';
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin" style="margin-right: 8px;"></i><span>Submitting Enquiry...</span>';
            }

            try {
                // Submit to AdOneClick Utility Enquiry API
                const response = await fetch('https://api.adoneclick.com/api/utility/enquiries', {
                    method: 'POST',
                    headers: {
                        'Accept': 'text/plain',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        fullName: fullName,
                        workEmail: workEmail,
                        phone: phone,
                        message: message
                    })
                });

                if (response.ok) {
                    form.reset();
                    successMsg.style.display = 'block';
                    successMsg.innerHTML = `🎉 <strong>Thank you, ${escapeHtml(fullName)}!</strong> Your enquiry has been submitted successfully. Our team will reach out to <em>${escapeHtml(workEmail)}</em> shortly.`;
                    setTimeout(() => {
                        successMsg.style.display = 'none';
                    }, 8000);
                } else {
                    const errData = await response.text().catch(() => '');
                    throw new Error(errData || `Server returned status ${response.status}`);
                }
            } catch (err) {
                console.error('Enquiry submission error:', err);
                errorMsg.style.display = 'block';
                errorMsg.innerHTML = '⚠️ We were unable to submit your enquiry at this moment. Please email us directly at <a href="mailto:rirtshivchandra@gmail.com" style="color: inherit; text-decoration: underline; font-weight: 700;">rirtshivchandra@gmail.com</a> or call <a href="tel:+918210196406" style="color: inherit; text-decoration: underline; font-weight: 700;">+91-8210196406</a>.';
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.style.opacity = '1';
                    submitBtn.innerHTML = originalBtnHtml;
                }
            }
        });
    });
}

function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
