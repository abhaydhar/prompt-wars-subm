/**
 * Accessibility Helpers for AdaptiveEd
 */

/**
 * Generates standard ARIA attributes for a tab and its panel
 */
export const getTabProps = (index: number) => ({
  id: `tab-${index}`,
  'aria-controls': `tabpanel-${index}`,
});

export const getTabPanelProps = (index: number) => ({
  role: 'tabpanel',
  id: `tabpanel-${index}`,
  'aria-labelledby': `tab-${index}`,
});

/**
 * Traps focus within an element (useful for modals/overlays)
 * Implementation is manual for lightweight use, can be replaced by MUI FocusTrap
 */
export const handleTabKey = (e: React.KeyboardEvent, container: HTMLElement | null) => {
  if (!container) return;
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

  if (e.key === 'Tab') {
    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  }
};

/**
 * Announces a message to screen readers using an aria-live region
 */
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  const announcer = document.getElementById('a11y-announcer') || createAnnouncer();
  announcer.textContent = '';
  announcer.setAttribute('aria-live', priority);
  setTimeout(() => {
    announcer.textContent = message;
  }, 100);
};

const createAnnouncer = () => {
  const el = document.createElement('div');
  el.id = 'a11y-announcer';
  el.style.position = 'absolute';
  el.style.width = '1px';
  el.style.height = '1px';
  el.style.padding = '0';
  el.style.margin = '-1px';
  el.style.overflow = 'hidden';
  el.style.clip = 'rect(0, 0, 0, 0)';
  el.style.whiteSpace = 'nowrap';
  el.style.border = '0';
  document.body.appendChild(el);
  return el;
};
