import type { ModalProps } from 'antd';

/**
 * Shared Modal sizing. Ant modals default to a fixed pixel width, which
 * overflows narrow viewports — on mobile we go near-full-bleed, pin the modal
 * near the top, and let the body scroll instead of the page.
 */
export function responsiveModalProps(
  isMobile: boolean,
  desktopWidth: number
): Pick<ModalProps, 'width' | 'style' | 'styles' | 'centered'> {
  if (!isMobile) return { width: desktopWidth };

  return {
    width: '100%',
    centered: false,
    style: {
      top: 8,
      maxWidth: 'calc(100vw - 16px)',
      margin: '8px auto',
      paddingBottom: 8,
    },
    styles: {
      body: { maxHeight: 'calc(100vh - 140px)', overflowY: 'auto' },
    },
  };
}

/** Pagination that stays usable when the viewport is ~360px wide. */
export function responsivePagination(isMobile: boolean) {
  return isMobile
    ? { simple: true as const, showSizeChanger: false }
    : { showSizeChanger: true, simple: false as const };
}
