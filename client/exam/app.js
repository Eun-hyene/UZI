// Phone comparison application JavaScript

// Sample phone data for comparison results
const phoneData = {
  samsung: {
    low: [
      { model: "갤럭시 A24", price: "35만원부터", specs: ["50MP 카메라", "5000mAh 배터리", "128GB 저장공간"] },
      { model: "갤럭시 A34", price: "45만원부터", specs: ["48MP 카메라", "5000mAh 배터리", "256GB 저장공간"] }
    ],
    mid: [
      { model: "갤럭시 S24 FE", price: "85만원부터", specs: ["50MP 카메라", "4700mAh 배터리", "256GB 저장공간"] },
      { model: "갤럭시 A55", price: "65만원부터", specs: ["50MP 카메라", "5000mAh 배터리", "256GB 저장공간"] }
    ],
    high: [
      { model: "갤럭시 S25", price: "115만원부터", specs: ["50MP 카메라", "4000mAh 배터리", "256GB 저장공간"] },
      { model: "갤럭시 S25+", price: "135만원부터", specs: ["50MP 카메라", "4900mAh 배터리", "256GB 저장공간"] }
    ]
  },
  apple: {
    low: [],
    mid: [
      { model: "아이폰 SE 3세대", price: "75만원부터", specs: ["12MP 카메라", "2018mAh 배터리", "128GB 저장공간"] }
    ],
    high: [
      { model: "아이폰 15", price: "125만원부터", specs: ["48MP 카메라", "3349mAh 배터리", "256GB 저장공간"] },
      { model: "아이폰 15 Pro", price: "155만원부터", specs: ["48MP 카메라", "3274mAh 배터리", "256GB 저장공간"] }
    ]
  },
  other: {
    low: [
      { model: "샤오미 Redmi Note 13", price: "25만원부터", specs: ["108MP 카메라", "5000mAh 배터리", "128GB 저장공간"] }
    ],
    mid: [
      { model: "구글 픽셀 8a", price: "70만원부터", specs: ["64MP 카메라", "4492mAh 배터리", "128GB 저장공간"] }
    ],
    high: [
      { model: "구글 픽셀 8 Pro", price: "120만원부터", specs: ["50MP 카메라", "5050mAh 배터리", "256GB 저장공간"] }
    ]
  }
};

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    initializeSmoothScrolling();
});

// Initialize all event listeners
function initializeEventListeners() {
    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    if (hamburger) {
        hamburger.addEventListener('click', toggleMobileMenu);
    }

    // Search functionality
    const searchBtn = document.querySelector('.search-btn');
    const searchInput = document.querySelector('.search-input');
    
    if (searchBtn) {
        searchBtn.addEventListener('click', handleSearch);
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleSearch();
            }
        });
    }

    // Comparison tool
    const comparisonBtn = document.querySelector('.comparison-btn');
    if (comparisonBtn) {
        comparisonBtn.addEventListener('click', handleComparison);
    }

    // FAQ accordion
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', toggleFaqItem);
    });

    // Price alert form
    const alertForm = document.querySelector('.alert-form');
    if (alertForm) {
        alertForm.addEventListener('submit', handlePriceAlert);
    }

    // Hero CTA button
    const heroCtaBtn = document.querySelector('.hero__cta');
    if (heroCtaBtn) {
        heroCtaBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const comparisonSection = document.getElementById('comparison');
            if (comparisonSection) {
                comparisonSection.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    }

    // Phone comparison buttons in popular phones section
    const comparisonButtons = document.querySelectorAll('.phone-card .btn');
    comparisonButtons.forEach(btn => {
        btn.addEventListener('click', handlePhoneComparison);
    });
}

// Initialize smooth scrolling for navigation links
function initializeSmoothScrolling() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Mobile menu toggle
function toggleMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    if (!hamburger) return;
    
    hamburger.classList.toggle('active');
    
    // Toggle hamburger animation
    const spans = hamburger.querySelectorAll('span');
    spans.forEach((span, index) => {
        if (hamburger.classList.contains('active')) {
            if (index === 0) span.style.transform = 'rotate(45deg) translate(5px, 5px)';
            if (index === 1) span.style.opacity = '0';
            if (index === 2) span.style.transform = 'rotate(-45deg) translate(7px, -6px)';
        } else {
            span.style.transform = '';
            span.style.opacity = '';
        }
    });
}

// Handle search functionality
function handleSearch() {
    const searchInput = document.querySelector('.search-input');
    if (!searchInput) return;
    
    const query = searchInput.value.trim();
    if (query) {
        showNotification(`"${query}" 검색 결과를 찾고 있습니다. (데모 버전)`, 'info');
        searchInput.value = '';
    } else {
        showNotification('검색어를 입력해주세요.', 'warning');
    }
}

// Handle phone comparison
function handleComparison() {
    const brandSelect = document.getElementById('brand-select');
    const priceSelect = document.getElementById('price-select');
    const featureSelect = document.getElementById('feature-select');
    const comparisonBtn = document.querySelector('.comparison-btn');
    const comparisonResults = document.getElementById('comparison-results');
    const resultsContainer = document.getElementById('results-container');

    if (!brandSelect || !priceSelect || !comparisonBtn || !comparisonResults || !resultsContainer) {
        console.error('Required elements not found for comparison');
        return;
    }

    const brand = brandSelect.value;
    const priceRange = priceSelect.value;
    const feature = featureSelect ? featureSelect.value : '';

    if (!brand || !priceRange) {
        showNotification('브랜드와 가격대를 선택해주세요.', 'warning');
        return;
    }

    // Show loading state
    const originalText = comparisonBtn.textContent;
    comparisonBtn.textContent = '검색 중...';
    comparisonBtn.disabled = true;

    // Simulate API call delay
    setTimeout(() => {
        const results = getComparisonResults(brand, priceRange, feature);
        displayComparisonResults(results, resultsContainer, comparisonResults);
        
        // Reset button
        comparisonBtn.textContent = originalText;
        comparisonBtn.disabled = false;
    }, 1000);
}

// Get comparison results based on filters
function getComparisonResults(brand, priceRange, feature) {
    let results = [];
    
    if (phoneData[brand] && phoneData[brand][priceRange]) {
        results = [...phoneData[brand][priceRange]];
    }

    // Filter by feature if specified
    if (feature && results.length > 0) {
        const featureKeywords = {
            camera: ['카메라', 'MP'],
            battery: ['배터리', 'mAh'],
            gaming: ['저장공간', 'GB']
        };
        
        const keywords = featureKeywords[feature];
        if (keywords) {
            results = results.filter(phone => 
                phone.specs.some(spec => 
                    keywords.some(keyword => spec.includes(keyword))
                )
            );
        }
    }

    return results;
}

// Display comparison results
function displayComparisonResults(results, resultsContainer, comparisonResults) {
    if (!resultsContainer || !comparisonResults) return;

    if (results.length === 0) {
        resultsContainer.innerHTML = `
            <div class="result-card">
                <h4>검색 결과가 없습니다</h4>
                <p>다른 조건으로 다시 검색해보세요.</p>
            </div>
        `;
    } else {
        resultsContainer.innerHTML = results.map(phone => `
            <div class="result-card">
                <h4>${phone.model}</h4>
                <div class="phone-price" style="color: var(--color-primary); font-weight: var(--font-weight-bold); margin: var(--space-8) 0;">
                    ${phone.price}
                </div>
                <ul style="list-style: none; padding: 0; margin: var(--space-12) 0;">
                    ${phone.specs.map(spec => `
                        <li style="margin-bottom: var(--space-4); font-size: var(--font-size-sm); color: var(--color-text-secondary);">
                            ✓ ${spec}
                        </li>
                    `).join('')}
                </ul>
                <button class="btn btn--primary btn--sm" style="width: 100%; margin-top: var(--space-12);" onclick="showPhoneDetails('${phone.model}', '${phone.price}')">
                    상세 정보 보기
                </button>
            </div>
        `).join('');
    }

    // Show results
    comparisonResults.classList.remove('hidden');
    
    // Scroll to results
    setTimeout(() => {
        comparisonResults.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }, 100);
}

// Show phone details (for result cards)
function showPhoneDetails(model, price) {
    showNotification(`${model} (${price}) 상세 정보를 확인하고 있습니다.`, 'info');
}

// Handle individual phone comparison from popular phones section
function handlePhoneComparison(e) {
    e.preventDefault();
    const phoneCard = e.target.closest('.phone-card');
    if (!phoneCard) return;
    
    const modelElement = phoneCard.querySelector('.phone-card__model');
    const priceElement = phoneCard.querySelector('.phone-card__price');
    
    if (modelElement && priceElement) {
        const model = modelElement.textContent;
        const price = priceElement.textContent;
        showNotification(`${model} (${price}) 가격 비교 정보를 확인하고 있습니다.`, 'info');
    }
}

// Toggle FAQ items
function toggleFaqItem(e) {
    e.preventDefault();
    const faqItem = e.target.closest('.faq-item');
    if (!faqItem) return;
    
    const answer = faqItem.querySelector('.faq-answer');
    if (!answer) return;
    
    const isActive = answer.classList.contains('active');

    // Close all FAQ items first
    document.querySelectorAll('.faq-answer').forEach(item => {
        item.classList.remove('active');
    });

    // Toggle current item
    if (!isActive) {
        answer.classList.add('active');
        answer.style.display = 'block';
    } else {
        answer.style.display = 'none';
    }
}

// Handle price alert form submission
function handlePriceAlert(e) {
    e.preventDefault();
    const emailInput = e.target.querySelector('input[type="email"]');
    const submitBtn = e.target.querySelector('button[type="submit"]');
    
    if (!emailInput || !submitBtn) return;
    
    const email = emailInput.value.trim();

    if (!email) {
        showNotification('이메일 주소를 입력해주세요.', 'warning');
        return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showNotification('올바른 이메일 주소를 입력해주세요.', 'warning');
        return;
    }

    // Show loading state
    const originalText = submitBtn.textContent;
    submitBtn.textContent = '등록 중...';
    submitBtn.disabled = true;

    // Simulate API call
    setTimeout(() => {
        showNotification(`${email}로 가격 알림이 등록되었습니다!`, 'success');
        emailInput.value = '';
        
        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }, 1000);
}

// Utility function to show notifications
function showNotification(message, type = 'info') {
    // Remove any existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    
    // Set notification styles based on type
    let bgColor, textColor, borderColor;
    switch (type) {
        case 'success':
            bgColor = 'var(--color-success)';
            textColor = 'var(--color-white)';
            borderColor = 'var(--color-success)';
            break;
        case 'warning':
            bgColor = 'var(--color-warning)';
            textColor = 'var(--color-white)';
            borderColor = 'var(--color-warning)';
            break;
        case 'error':
            bgColor = 'var(--color-error)';
            textColor = 'var(--color-white)';
            borderColor = 'var(--color-error)';
            break;
        default:
            bgColor = 'var(--color-surface)';
            textColor = 'var(--color-text)';
            borderColor = 'var(--color-primary)';
    }
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${bgColor};
        color: ${textColor};
        padding: var(--space-16);
        border-radius: var(--radius-base);
        border: 2px solid ${borderColor};
        box-shadow: var(--shadow-lg);
        z-index: 1000;
        max-width: 350px;
        font-weight: var(--font-weight-medium);
        animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;

    // Add to DOM
    document.body.appendChild(notification);

    // Remove after 4 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }
    }, 4000);
}

// Add notification animations to document
if (!document.querySelector('#notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// Handle window resize for responsive behavior
window.addEventListener('resize', function() {
    // Reset mobile menu state on resize
    const hamburger = document.querySelector('.hamburger');
    if (window.innerWidth >= 768 && hamburger) {
        hamburger.classList.remove('active');
        const spans = hamburger.querySelectorAll('span');
        spans.forEach(span => {
            span.style.transform = '';
            span.style.opacity = '';
        });
    }
});

// Intersection Observer for scroll animations
if ('IntersectionObserver' in window) {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements that should animate on scroll
    const animateElements = document.querySelectorAll('.feature-card, .phone-card, .testimonial-card, .insight-card');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(el);
    });
}

// Performance optimization: Debounce scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Add scroll-based header styling
const debouncedScroll = debounce(function() {
    const header = document.querySelector('.header');
    if (header) {
        if (window.scrollY > 100) {
            header.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
            header.style.backdropFilter = 'blur(10px)';
        } else {
            header.style.backgroundColor = 'var(--color-surface)';
            header.style.backdropFilter = 'none';
        }
    }
}, 10);

window.addEventListener('scroll', debouncedScroll);

// Add keyboard navigation support
document.addEventListener('keydown', function(e) {
    const hamburger = document.querySelector('.hamburger');
    const searchInput = document.querySelector('.search-input');
    
    // ESC key to close mobile menu
    if (e.key === 'Escape' && hamburger && hamburger.classList.contains('active')) {
        toggleMobileMenu();
    }
    
    // Enter key for search
    if (e.key === 'Enter' && document.activeElement === searchInput) {
        handleSearch();
    }
});

// Error handling for any uncaught errors
window.addEventListener('error', function(e) {
    console.error('Application error:', e.error);
    showNotification('일시적인 오류가 발생했습니다. 페이지를 새로고침해주세요.', 'error');
});

// Initialize application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Phone comparison app initialized');
    });
} else {
    console.log('Phone comparison app initialized');
}