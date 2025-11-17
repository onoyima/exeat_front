import { Montserrat } from 'next/font/google'

// Google Fonts - Montserrat
export const montserrat = Montserrat({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700'],
    variable: '--font-montserrat',
    display: 'swap',
})

// Font class names for easy usage
export const fontClasses = {
    montserrat: `${montserrat.variable} font-montserrat`,
}

