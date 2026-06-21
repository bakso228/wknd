/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Loyalocal tokens (mirrors CSS vars in index.css)
        primary:  { DEFAULT: '#0077B6', deep: '#005F92', soft: '#E1F0F8' },
        ink:      { DEFAULT: '#1F2933', soft: '#52606D', faint: '#7B8794' },
        reward:   { DEFAULT: '#62B58F', deep: '#3F9270', soft: '#E5F4EC' },
        flag:     { DEFAULT: '#FF6B5F', deep: '#C24A40', soft: '#FFE9E6' },
        ice:      '#F2F7FA',
        mist:     { DEFAULT: '#E3EEF5', deep: '#CBD9E3' },
      },
      borderRadius: {
        chip: '12px',
        ctl:  '16px',
        card: '22px',
        tile: '14px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(31,41,51,.05), 0 6px 18px rgba(31,41,51,.07)',
        btn:  '0 6px 16px rgba(0,119,182,.35)',
      },
      fontFamily: {
        brand: ['Manrope', 'Inter', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
