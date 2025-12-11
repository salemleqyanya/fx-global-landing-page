/**
 * Assets Configuration
 * Centralized asset paths for the standalone application
 * 
 * Usage in HTML:
 * <script src="assets-config.js"></script>
 * Then access: ASSETS.images.education1
 */

(function() {
    'use strict';
    
    // Get static URL from window.STATIC_URL (set by template) or use default
    const staticUrl = (typeof window !== 'undefined' && window.STATIC_URL) || '/static/';
    const assetsBase = staticUrl + 'new_pac/assets/';
    
    // Asset paths configuration
    const ASSETS = {
        // Educational Membership Modal Images
        images: {
            education1: assetsBase + '565d8b9a48d1045d47ada6198ca92b488b64bd45.png',
            education2: assetsBase + '9c6be425213edb200602a4ea1d7c8b169100070f.png',
            education3: assetsBase + '5f05bd6817ebd94cc6afcc3126c3b643395b1f00.png'
        },
        
        // Image array for lightbox (in order)
        lightboxImages: [
            assetsBase + '565d8b9a48d1045d47ada6198ca92b488b64bd45.png',
            assetsBase + '9c6be425213edb200602a4ea1d7c8b169100070f.png',
            assetsBase + '5f05bd6817ebd94cc6afcc3126c3b643395b1f00.png'
        ],
        
        // Educational content metadata
        educationContent: [
            {
                id: 1,
                title: 'ابدأ رحلتك بثقة في عالم التداول',
                description: 'تعلم الأساسيات وتفهم كيف يتحرك السوق وتبني استراتيجية تداولك',
                icon: '📚',
                image: assetsBase + '565d8b9a48d1045d47ada6198ca92b488b64bd45.png',
                alt: 'محتوى تعليمي 1'
            },
            {
                id: 2,
                title: 'أساسيات التداول و أقسام الأسواق المالية - الجزء الأول',
                description: 'الوسطاء، حساب النقاط، إدارة رأس المال، وبرامج التدول',
                icon: '📈',
                image: assetsBase + '9c6be425213edb200602a4ea1d7c8b169100070f.png',
                alt: 'محتوى تعليمي 2'
            },
            {
                id: 3,
                title: 'أساسيات التداول و أقسام الأسواق المالية - الجزء الثاني',
                description: 'الفجوات السعرية، الأوردرات، مناطق الطلب، والتأكيدات',
                icon: '🎯',
                image: assetsBase + '5f05bd6817ebd94cc6afcc3126c3b643395b1f00.png',
                alt: 'محتوى تعليمي 3'
            }
        ],
        
        // Helper function to get image by ID
        getImageById: function(id) {
            const content = this.educationContent.find(item => item.id === id);
            return content ? content.image : null;
        },
        
        // Helper function to get all images
        getAllImages: function() {
            return this.lightboxImages;
        },
        
        // Helper function to get content by index
        getContentByIndex: function(index) {
            return this.educationContent[index] || null;
        }
    };
    
    // Expose to global scope
    if (typeof window !== 'undefined') {
        window.ASSETS = ASSETS;
    }
    
    // Also expose as module if supported
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = ASSETS;
    }
})();

