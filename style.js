// ============================================
// Navigation Controls
// ============================================
(function () {
    [...document.querySelectorAll(".control")].forEach(button => {
        button.addEventListener("click", function() {
            document.querySelector(".active-btn").classList.remove("active-btn");
            this.classList.add("active-btn");
            document.querySelector(".active").classList.remove("active");
            document.getElementById(button.dataset.id).classList.add("active");
        })
    });
    document.querySelector(".theme-btn").addEventListener("click", () => {
        document.body.classList.toggle("light-mode");
    })
})();

// ============================================
// Typing Animation (Hero Section)
// ============================================
function initTyped() {
    if (typeof Typed !== 'undefined' && document.getElementById('typed-output')) {
        new Typed('#typed-output', {
            strings: [
                'A Cyber Security Expert.',
                'SOC L1 Analyst.',
                'CEH Certified.',
                'Bug Bounty Hunter.',
                'Digital Forensics Specialist.'
            ],
            typeSpeed: 50,
            backSpeed: 30,
            backDelay: 2000,
            loop: true,
            showCursor: true,
            cursorChar: '|'
        });
    }
}

// ============================================
// Blog System - Fetch from data/blogs.json
// ============================================
const fallbackBlogs = [
    {
        id: 1,
        title: "Understanding SOC: A Beginner's Guide",
        image: "img/port1.jpg",
        link: "",
        content: "A Security Operations Center (SOC) is the backbone of any organization's cybersecurity defense. SOC analysts monitor networks 24/7, analyze security alerts, and respond to incidents."
    },
    {
        id: 2,
        title: "Top 10 OWASP Vulnerabilities Explained",
        image: "img/blog1.jpg",
        link: "",
        content: "The OWASP Top 10 lists the most critical web security risks. From Injection attacks and Broken Authentication to Cross-Site Scripting (XSS) and Security Misconfigurations."
    },
    {
        id: 3,
        title: "Getting Started with Bug Bounty Hunting",
        image: "img/blog2.jpg",
        link: "",
        content: "Bug bounty hunting lets you earn rewards by finding security flaws in companies' systems. Start with platforms like HackerOne and Bugcrowd."
    },
    {
        id: 4,
        title: "Wireshark for Beginners: Packet Analysis 101",
        image: "img/blog3.jpg",
        link: "",
        content: "Wireshark is a powerful network protocol analyzer used for capturing and analyzing network traffic. Learn how to capture packets, apply display filters, and follow TCP streams."
    },
    {
        id: 5,
        title: "Incident Response: From Alert to Resolution",
        image: "img/port6.jpg",
        link: "",
        content: "Incident Response (IR) is the structured approach to handling and managing security breaches. From preparation and identification to containment, eradication, and recovery."
    },
    {
        id: 6,
        title: "Digital Forensics: Investigating Cyber Crimes",
        image: "img/port3.jpg",
        link: "",
        content: "Digital forensics involves collecting, preserving, and analyzing digital evidence from devices and networks. From disk imaging and memory analysis to log correlation."
    }
];

function initBlogs() {
    // Try fetching from data/blogs.json first, fallback to hardcoded
    fetch('data/blogs.json')
        .then(response => {
            if (!response.ok) throw new Error('File not found');
            return response.json();
        })
        .then(blogs => {
            renderBlogs(blogs);
        })
        .catch(err => {
            console.log('Loading fallback blogs:', err.message);
            renderBlogs(fallbackBlogs);
        });
}

function renderBlogs(blogs) {
    const blogList = document.getElementById('blog-list');
    if (!blogList) return;

    if (!blogs || blogs.length === 0) {
        blogList.innerHTML = '<p style="text-align:center; color: var(--color-grey-2); grid-column: 1 / -1; padding: 3rem 0;">No blogs yet. Check back soon!</p>';
        return;
    }

    blogList.innerHTML = blogs.map(blog => `
        <div class="blog">
            <img src="${blog.image}" alt="${blog.title}">
            <div class="blog-text">
                <h4>${blog.link ? `<a href="${blog.link}" target="_blank" rel="noopener noreferrer">${blog.title}</a>` : blog.title}</h4>
                <p>${blog.content}</p>
            </div>
        </div>
    `).join('');
}

// Run immediately (script is at bottom of body, DOM is already ready)
initBlogs();
initTyped();

// ============================================
// Contact Form - Formsubmit.co (AJAX submission)
// ============================================
const contactForm = document.getElementById('contact-form');
const resultEl = document.querySelector('.result');

if (contactForm && resultEl) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const formData = new FormData(contactForm);
        resultEl.innerHTML = "Sending...";
        resultEl.style.opacity = 1;
        resultEl.style.color = "#f0f0f0";

        fetch(contactForm.action, {
            method: "POST",
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                resultEl.innerHTML = "✅ Message sent successfully!";
                resultEl.style.color = "#27ae60";
                contactForm.reset();
            } else {
                resultEl.innerHTML = "❌ Something went wrong. Please try again.";
                resultEl.style.color = "#e74c3c";
            }
            resultEl.style.opacity = 1;
            setTimeout(() => { resultEl.style.opacity = 0; }, 5000);
        })
        .catch(error => {
            resultEl.innerHTML = "❌ Failed to send. Check your internet connection.";
            resultEl.style.color = "#e74c3c";
            resultEl.style.opacity = 1;
            setTimeout(() => { resultEl.style.opacity = 0; }, 5000);
        });
    });
}