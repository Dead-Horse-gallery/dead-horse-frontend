/**
 * Accessibility audit utilities for Dead Horse Gallery
 * Scans components for WCAG compliance issues
 */

import { getContrastRatio, meetsWCAGStandard, CONTRAST_RATIOS } from './accessibility';
import { logger } from './logger';

export interface AccessibilityIssue {
  type: 'contrast' | 'focus' | 'alt-text' | 'aria' | 'keyboard' | 'semantic';
  severity: 'error' | 'warning' | 'info';
  element: string;
  description: string;
  recommendation: string;
  wcagReference?: string;
}

export interface AccessibilityAuditResult {
  passed: boolean;
  score: number; // 0-100
  issues: AccessibilityIssue[];
  summary: {
    errors: number;
    warnings: number;
    info: number;
  };
}

/**
 * Comprehensive accessibility audit for components
 */
export class AccessibilityAuditor {
  private issues: AccessibilityIssue[] = [];

  /**
   * Audit a DOM element and its children for accessibility issues
   */
  public async audit(element: HTMLElement): Promise<AccessibilityAuditResult> {
    this.issues = [];
    
    logger.info('Starting accessibility audit', { elementTag: element.tagName });

    // Run all audit checks
    this.auditColorContrast(element);
    this.auditFocusIndicators(element);
    this.auditImageAltText(element);
    this.auditAriaLabels(element);
    this.auditKeyboardNavigation(element);
    this.auditSemanticStructure(element);

    const summary = this.generateSummary();
    const score = this.calculateScore(summary);

    const result: AccessibilityAuditResult = {
      passed: summary.errors === 0,
      score,
      issues: this.issues,
      summary,
    };

    logger.info('Accessibility audit completed', {
      score,
      issues: summary,
      passed: result.passed,
    });

    return result;
  }

  /**
   * Audit color contrast ratios
   */
  private auditColorContrast(element: HTMLElement): void {
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_ELEMENT,
      {
        acceptNode: (node) => {
          const el = node as HTMLElement;
          const text = el.textContent?.trim();
          return text && text.length > 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
        },
      }
    );

    const textElements: HTMLElement[] = [];
    let currentNode = walker.nextNode();
    
    while (currentNode) {
      textElements.push(currentNode as HTMLElement);
      currentNode = walker.nextNode();
    }

    textElements.forEach(el => {
      const styles = window.getComputedStyle(el);
      const color = styles.color;
      const backgroundColor = styles.backgroundColor;
      
      // Skip if transparent background - check parent elements
      let bgColor = backgroundColor;
      let parent = el.parentElement;
      
      while (parent && (bgColor === 'rgba(0, 0, 0, 0)' || bgColor === 'transparent')) {
        bgColor = window.getComputedStyle(parent).backgroundColor;
        parent = parent.parentElement;
      }

      if (bgColor === 'rgba(0, 0, 0, 0)' || bgColor === 'transparent') {
        bgColor = '#ffffff'; // Default to white
      }

      try {
        const colorHex = this.rgbToHex(color);
        const bgHex = this.rgbToHex(bgColor);
        
        if (colorHex && bgHex) {
          const contrast = getContrastRatio(colorHex, bgHex);
          const fontSize = parseFloat(styles.fontSize);
          const isLargeText = fontSize >= 18 || (fontSize >= 14 && styles.fontWeight === 'bold');
          
          if (!meetsWCAGStandard(colorHex, bgHex, 'AA', isLargeText)) {
            this.addIssue({
              type: 'contrast',
              severity: 'error',
              element: this.getElementSelector(el),
              description: `Text contrast ratio ${contrast.toFixed(2)}:1 does not meet WCAG AA standards`,
              recommendation: `Increase contrast to at least ${isLargeText ? CONTRAST_RATIOS.AA_LARGE : CONTRAST_RATIOS.AA_NORMAL}:1`,
              wcagReference: 'WCAG 2.1 1.4.3 Contrast (Minimum)',
            });
          } else if (!meetsWCAGStandard(colorHex, bgHex, 'AAA', isLargeText)) {
            this.addIssue({
              type: 'contrast',
              severity: 'warning',
              element: this.getElementSelector(el),
              description: `Text contrast ratio ${contrast.toFixed(2)}:1 meets AA but not AAA standards`,
              recommendation: `Consider increasing contrast to ${isLargeText ? CONTRAST_RATIOS.AAA_LARGE : CONTRAST_RATIOS.AAA_NORMAL}:1 for better accessibility`,
              wcagReference: 'WCAG 2.1 1.4.6 Contrast (Enhanced)',
            });
          }
        }
      } catch (error) {
        logger.warn('Failed to parse color values', { 
          color, 
          backgroundColor: bgColor, 
          element: this.getElementSelector(el),
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });
  }

  /**
   * Audit focus indicators
   */
  private auditFocusIndicators(element: HTMLElement): void {
    const focusableElements = element.querySelectorAll(
      'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    focusableElements.forEach(el => {
      const htmlEl = el as HTMLElement;
      const styles = window.getComputedStyle(htmlEl);
      
      // Check for focus styles (this is a simplified check)
      const hasOutline = styles.outline !== 'none' && styles.outline !== '0px';
      const hasBoxShadow = styles.boxShadow !== 'none';
      const hasFocusRing = htmlEl.classList.toString().includes('focus:');
      
      if (!hasOutline && !hasBoxShadow && !hasFocusRing) {
        this.addIssue({
          type: 'focus',
          severity: 'error',
          element: this.getElementSelector(htmlEl),
          description: 'Interactive element lacks visible focus indicator',
          recommendation: 'Add visible focus styles using outline, box-shadow, or border changes',
          wcagReference: 'WCAG 2.1 2.4.7 Focus Visible',
        });
      }
    });
  }

  /**
   * Audit image alt text
   */
  private auditImageAltText(element: HTMLElement): void {
    const images = element.querySelectorAll('img');
    
    images.forEach(img => {
      const alt = img.getAttribute('alt');
      const ariaHidden = img.getAttribute('aria-hidden');
      const role = img.getAttribute('role');
      
      // Skip decorative images
      if (ariaHidden === 'true' || role === 'presentation') {
        return;
      }
      
      if (!alt) {
        this.addIssue({
          type: 'alt-text',
          severity: 'error',
          element: this.getElementSelector(img),
          description: 'Image missing alt attribute',
          recommendation: 'Add descriptive alt text or mark as decorative with aria-hidden="true"',
          wcagReference: 'WCAG 2.1 1.1.1 Non-text Content',
        });
      } else if (alt.trim().length === 0) {
        this.addIssue({
          type: 'alt-text',
          severity: 'warning',
          element: this.getElementSelector(img),
          description: 'Image has empty alt attribute',
          recommendation: 'Provide descriptive alt text or explicitly mark as decorative',
          wcagReference: 'WCAG 2.1 1.1.1 Non-text Content',
        });
      } else if (alt.length < 3) {
        this.addIssue({
          type: 'alt-text',
          severity: 'warning',
          element: this.getElementSelector(img),
          description: 'Image alt text is very short and may not be descriptive',
          recommendation: 'Provide more descriptive alt text that conveys the meaning and context',
          wcagReference: 'WCAG 2.1 1.1.1 Non-text Content',
        });
      }
    });
  }

  /**
   * Audit ARIA labels and attributes
   */
  private auditAriaLabels(element: HTMLElement): void {
    const interactiveElements = element.querySelectorAll(
      'button, a, input, select, textarea, [role="button"], [role="link"], [role="tab"], [role="menuitem"]'
    );

    interactiveElements.forEach(el => {
      const htmlEl = el as HTMLElement;
      const ariaLabel = htmlEl.getAttribute('aria-label');
      const ariaLabelledBy = htmlEl.getAttribute('aria-labelledby');
      const textContent = htmlEl.textContent?.trim();
      // Check if element has accessible name
      if (!ariaLabel && !ariaLabelledBy && !textContent) {
        this.addIssue({
          type: 'aria',
          severity: 'error',
          element: this.getElementSelector(htmlEl),
          description: 'Interactive element lacks accessible name',
          recommendation: 'Add aria-label, aria-labelledby, or visible text content',
          wcagReference: 'WCAG 2.1 4.1.2 Name, Role, Value',
        });
      }

      // Check for invalid ARIA attributes
      const ariaAttributes = Array.from(htmlEl.attributes)
        .filter(attr => attr.name.startsWith('aria-'))
        .map(attr => attr.name);

      // This is a simplified check - in a real implementation, you'd validate against ARIA spec
      ariaAttributes.forEach(attr => {
        if (attr === 'aria-expanded' && !['true', 'false'].includes(htmlEl.getAttribute(attr) || '')) {
          this.addIssue({
            type: 'aria',
            severity: 'error',
            element: this.getElementSelector(htmlEl),
            description: `Invalid aria-expanded value: "${htmlEl.getAttribute(attr)}"`,
            recommendation: 'Use "true" or "false" for aria-expanded',
            wcagReference: 'WCAG 2.1 4.1.2 Name, Role, Value',
          });
        }
      });
    });
  }

  /**
   * Audit keyboard navigation
   */
  private auditKeyboardNavigation(element: HTMLElement): void {
    const interactiveElements = element.querySelectorAll(
      'a, button, input, select, textarea, [tabindex], [role="button"], [role="link"]'
    );

    interactiveElements.forEach(el => {
      const htmlEl = el as HTMLElement;
      const tabIndex = htmlEl.getAttribute('tabindex');
      
      // Check for positive tabindex (anti-pattern)
      if (tabIndex && parseInt(tabIndex) > 0) {
        this.addIssue({
          type: 'keyboard',
          severity: 'warning',
          element: this.getElementSelector(htmlEl),
          description: 'Positive tabindex value disrupts natural tab order',
          recommendation: 'Use tabindex="0" or remove tabindex to follow document order',
          wcagReference: 'WCAG 2.1 2.4.3 Focus Order',
        });
      }

      // Check for interactive elements with tabindex="-1" that shouldn't have it
      if (tabIndex === '-1' && ['a', 'button', 'input', 'select', 'textarea'].includes(htmlEl.tagName.toLowerCase())) {
        const href = htmlEl.getAttribute('href');
        if (htmlEl.tagName.toLowerCase() === 'a' && href) {
          this.addIssue({
            type: 'keyboard',
            severity: 'warning',
            element: this.getElementSelector(htmlEl),
            description: 'Link with href removed from tab order',
            recommendation: 'Remove tabindex="-1" or ensure keyboard accessibility is maintained',
            wcagReference: 'WCAG 2.1 2.1.1 Keyboard',
          });
        }
      }
    });
  }

  /**
   * Audit semantic HTML structure
   */
  private auditSemanticStructure(element: HTMLElement): void {
    // Check for heading hierarchy
    const headings = element.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let lastLevel = 0;
    
    headings.forEach(heading => {
      const level = parseInt(heading.tagName.substring(1));
      
      if (lastLevel > 0 && level > lastLevel + 1) {
        this.addIssue({
          type: 'semantic',
          severity: 'warning',
          element: this.getElementSelector(heading as HTMLElement),
          description: `Heading level skips from h${lastLevel} to h${level}`,
          recommendation: 'Use sequential heading levels for proper document structure',
          wcagReference: 'WCAG 2.1 1.3.1 Info and Relationships',
        });
      }
      
      lastLevel = level;
    });

    // Check for landmark roles
    const hasMain = element.querySelector('main, [role="main"]');
    
    if (!hasMain && element.tagName.toLowerCase() !== 'main') {
      this.addIssue({
        type: 'semantic',
        severity: 'info',
        element: this.getElementSelector(element),
        description: 'Page lacks main landmark',
        recommendation: 'Add <main> element or role="main" to identify primary content',
        wcagReference: 'WCAG 2.1 1.3.1 Info and Relationships',
      });
    }
  }

  /**
   * Add an issue to the audit results
   */
  private addIssue(issue: AccessibilityIssue): void {
    this.issues.push(issue);
  }

  /**
   * Generate audit summary
   */
  private generateSummary(): { errors: number; warnings: number; info: number } {
    return this.issues.reduce(
      (summary, issue) => {
        summary[issue.severity === 'error' ? 'errors' : issue.severity === 'warning' ? 'warnings' : 'info']++;
        return summary;
      },
      { errors: 0, warnings: 0, info: 0 }
    );
  }

  /**
   * Calculate accessibility score (0-100)
   */
  private calculateScore(summary: { errors: number; warnings: number; info: number }): number {
    const totalIssues = summary.errors + summary.warnings + summary.info;
    if (totalIssues === 0) return 100;
    
    // Weighted scoring: errors -10, warnings -5, info -1
    const deductions = (summary.errors * 10) + (summary.warnings * 5) + (summary.info * 1);
    return Math.max(0, 100 - deductions);
  }

  /**
   * Get a CSS selector for an element
   */
  private getElementSelector(element: HTMLElement): string {
    if (element.id) {
      return `#${element.id}`;
    }
    
    if (element.className) {
      const classes = element.className.split(' ').filter(c => c.trim()).slice(0, 2);
      if (classes.length > 0) {
        return `${element.tagName.toLowerCase()}.${classes.join('.')}`;
      }
    }
    
    return element.tagName.toLowerCase();
  }

  /**
   * Convert RGB color to hex
   */
  private rgbToHex(rgb: string): string | null {
    // Handle hex colors
    if (rgb.startsWith('#')) {
      return rgb;
    }

    // Handle rgb() and rgba() colors
    const rgbMatch = rgb.match(/rgba?\(([^)]+)\)/);
    if (!rgbMatch) return null;

    const values = rgbMatch[1].split(',').map(v => parseInt(v.trim()));
    if (values.length < 3) return null;

    const [r, g, b] = values;
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }
}

/**
 * Quick accessibility check for development
 */
export async function quickAccessibilityCheck(element: HTMLElement = document.body): Promise<void> {
  const auditor = new AccessibilityAuditor();
  const result = await auditor.audit(element);
  
  console.group('🔍 Accessibility Audit Results');
  console.log(`Score: ${result.score}/100 ${result.passed ? '✅' : '❌'}`);
  console.log(`Issues: ${result.summary.errors} errors, ${result.summary.warnings} warnings, ${result.summary.info} info`);
  
  if (result.issues.length > 0) {
    console.group('Issues Found:');
    result.issues.forEach(issue => {
      const icon = issue.severity === 'error' ? '🚨' : issue.severity === 'warning' ? '⚠️' : 'ℹ️';
      console.log(`${icon} ${issue.type.toUpperCase()}: ${issue.description}`);
      console.log(`   Element: ${issue.element}`);
      console.log(`   Fix: ${issue.recommendation}`);
      if (issue.wcagReference) {
        console.log(`   WCAG: ${issue.wcagReference}`);
      }
      console.log('');
    });
    console.groupEnd();
  }
  
  console.groupEnd();
}

// Export for use in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as unknown as Record<string, unknown>).accessibilityCheck = quickAccessibilityCheck;
}

export default AccessibilityAuditor;
