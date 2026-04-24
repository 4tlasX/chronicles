import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    font-size: 16px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    height: 100%;
    overflow: hidden;
    overscroll-behavior: none;
  }

  body {
    font-family: var(--sans, ${({ theme }) => theme.fontFamily.sans});
    color: var(--ink, ${({ theme }) => theme.colors.text});
    background-color: var(--paper, ${({ theme }) => theme.colors.background});
    line-height: 1.5;
    height: 100%;
    overflow: hidden;
    overscroll-behavior: none;
    position: fixed;
    width: 100%;
  }

  #root {
    height: 100%;
    overflow: auto;
    overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  button {
    cursor: pointer;
    border: none;
    background: none;
    font: inherit;
    color: inherit;
  }

  input, textarea, select {
    font: inherit;
    color: inherit;
  }

  /* Global focus-visible outline — uses user's header color */
  a:focus-visible,
  button:focus-visible,
  [tabindex]:focus-visible {
    outline: 2px solid rgba(var(--focus-color-rgb, 78, 110, 126), 0.5);
    outline-offset: 2px;
  }

  /* Bordered inputs get a full border color change instead of outline */
  input:focus-visible,
  select:focus-visible,
  textarea:focus-visible {
    outline: none;
    border-color: var(--focus-color, #4A5568);
  }

  /* Reduced motion for users who prefer it */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }

  /* Print styles — hide app chrome, show content */
  @media print {
    body {
      background: white !important;
      color: black !important;
    }

    [data-print-hide] {
      display: none !important;
    }

    main {
      overflow: visible !important;
      height: auto !important;
    }

    /* Remove fixed heights so content flows */
    html, body, #root, #root > * {
      height: auto !important;
      overflow: visible !important;
    }
  }

  /* Screen-reader only utility */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
`;
